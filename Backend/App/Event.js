require("dotenv").config();
const jwt = require("jsonwebtoken");

const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.eventsecret_key);
var uniqid = require("uniqid");
var { getUserId } = require("./Helper/MasterHelper");
require("firebase/auth");
require("firebase/database");
var { firebaseConfig } = require("./Constants/Firebase");
var firebase = require("firebase/app");
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

var {
  isCalanderPrivate,
  isUserInTeam,
  isTeamExist,
  isUserTeamAdmin,
  geEmailFromToken,
} = require("./Helper/MasterHelper");

var database = firebase.database();

module.exports.FetchEvent = async (req, res) => {
  try {
    var { team_id, token } = req.query;
    team_id = team_id.toLowerCase();

    if (token) {
      var email = await geEmailFromToken(token);
      var isMember = await isUserInTeam(team_id, email);
      var isAdmin = await isUserTeamAdmin(team_id, email);
    } else {
      isMember = false;
    }

    if (team_id) {
      var calendar_exist = true;
      if (!(await isCalanderPrivate(team_id)) || isMember) {
        let data = [];
        let team_data = [];
        await firebase
          .database()
          .ref()
          .child("/team/" + team_id + "/info")
          .once("value", function (snap) {
            if (!snap.exists()) {
              calendar_exist = false;
            } else {
              team_data = snap.val();
            }
          });
        await firebase
          .database()
          .ref()
          .child("/team/" + team_id + "/event")
          .once("value", function (snap) {
            if (snap.exists()) {
              var obj = snap.val();
              if (obj) {
                Object.keys(obj).forEach((key) => {
                  let team_obj = {
                    id: key,
                    start: cryptr.decrypt(obj[key].start),
                    end: cryptr.decrypt(obj[key].end),
                    title: cryptr.decrypt(obj[key].title),
                    extra: cryptr.decrypt(obj[key].extra),
                    color: cryptr.decrypt(obj[key].color),
                  };
                  data.push(team_obj);
                });
              }
            }
          });
        if (calendar_exist) {
          // team_data.creator = null;
          team_data.last_active = null;
          res
            .status(200)
            .json({ data, email, isMember, isAdmin, status: 1, team_data });
        } else
          res
            .status(404)
            .json({ message: "Calendar Doesn't Exist", status: 0 });
      } else {
        res.status(200).json({
          message: "This is a Private Calender",
          status: 0,
        });
      }
    } else {
      res.status(200).json({
        message: "Missing Required Field",
        status: 0,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error" + err.message,
      status: 0,
    });
  }
};

module.exports.AddEvent = async (req, res) => {
  try {
    var token = req.query.token;
    var obj = JSON.parse(req.query.event);
    var team_id = req.query.team_id;
    team_id = team_id.toLowerCase();
    if (obj && team_id && token) {
      var { start, end, title, color, extra } = obj;
      var event_detail = {
        start: cryptr.encrypt(start),
        end: cryptr.encrypt(end),
        title: cryptr.encrypt(title),
        color: cryptr.encrypt(color),
        extra: cryptr.encrypt(extra),
      };
      var email = await geEmailFromToken(token);

      if (await isUserTeamAdmin(team_id, email)) {
        if (await isTeamExist(team_id)) {
          await database
            .ref("/team/" + team_id + "/event/" + uniqid())
            .set(event_detail, function (error) {
              if (error) {
                console.log(error);
              } else {
                // console.log("Data Saved Successfully");
              }
            });
          res.json({ response: "Success", status: 1 });
        } else {
          res.json({ response: "Team Doesn't Exist", status: 0 });
        }
      } else {
        res.json({
          response: "You have no right to edit this calender",
          status: 0,
        });
      }
    } else {
      res.json({ response: "Missing Required", status: 0 });
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error : " + err.message,
      status: 0,
    });
  }
};

module.exports.EditEvent = async (req, res) => {
  try {
    var token = req.query.token;
    var obj = JSON.parse(req.query.event);
    var team_id = req.query.team_id;
    team_id = team_id.toLowerCase();
    var event_id = req.query.event_id;

    if (obj && team_id && token && event_id) {
      var email = await geEmailFromToken(token);
      var { start, end, title, color, extra } = obj;
      var event_detail = {
        start: cryptr.encrypt(start),
        end: cryptr.encrypt(end),
        title: cryptr.encrypt(title),
        color: cryptr.encrypt(color),
        extra: cryptr.encrypt(extra),
      };
      if (await isUserTeamAdmin(team_id, email)) {
        if (await isTeamExist(team_id)) {
          await database
            .ref("/team/" + team_id + "/event/" + event_id)
            .set(event_detail, function (error) {
              if (error) {
                console.log(error);
              } else {
                // console.log("Data Saved Successfully");
              }
            });
          res.json({ response: "Success", status: 1 });
        } else {
          res.json({ response: "Team Doesn't Exist", status: 0 });
        }
      } else {
        res.json({
          response: "You have no right to edit this calender",
          status: 0,
        });
      }
    } else {
      res.json({ response: "Missing Required", status: 0 });
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error : " + err.message,
      status: 0,
    });
  }
};

module.exports.DeleteEvent = async (req, res) => {
  try {
    var token = req.query.token;
    var team_id = req.query.team_id;
    var event_id = req.query.event_id;
    team_id = team_id.toLowerCase();
    if (event_id && team_id && token) {
      var email = await geEmailFromToken(token);

      if (await isUserTeamAdmin(team_id, email)) {
        await database.ref("/team/" + team_id + "/event/" + event_id).remove();
        res.json({ response: "Success", status: 1 });
      } else {
        res.json({
          response: "You have no right to edit this calender",
          status: 0,
        });
      }
    } else {
      res.json({ response: "Missing Required", status: 0 });
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error : " + err.message,
      status: 0,
    });
  }
};

module.exports.Search = async (req, res) => {
  try {
    getUserId(req.query.email);

    res.json({ response: "Success" });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error : " + err.message,
      status: 0,
    });
  }
};
