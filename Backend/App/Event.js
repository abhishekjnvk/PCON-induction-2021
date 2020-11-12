var EventSchema = require("../schema/event");
const jwt = require("jsonwebtoken");
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
  isUserExist,
  isUserInTeam,
  isTeamExist,
  isUserTeamAdmin,
  geEmailFromToken,
} = require("./Helper/MasterHelper");

var database = firebase.database();

module.exports.FetchEvent = async (req, res) => {
  try {
    var { team_id, token } = req.query;
    if (team_id) {
      let data = [];
      await firebase
        .database()
        .ref()
        .child("/team/" + team_id + "/event")
        .once("value", function (snap) {
          var obj = snap.val();
          var sl = 1;
          if (obj) {
            Object.keys(obj).forEach((key) => {
              let team_obj = {
                id: key,
                start: obj[key].start,
                end: obj[key].end,
                title: obj[key].title,
                extra: obj[key].extra,
              };
              data.push(team_obj);
            });
          }
        });
      if (token) {
        var email = await geEmailFromToken(token);
        var isMember = await isUserInTeam(team_id, email);
        var isAdmin = await isUserTeamAdmin(team_id, email);
      }
      res.status(200).json({ data, email, isMember, isAdmin });
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

    if (obj && team_id && token) {
      var email = await geEmailFromToken(token);

      if (await isUserTeamAdmin(team_id, email)) {
        if (await isTeamExist(team_id)) {
          await database
            .ref("/team/" + team_id + "/event/" + uniqid())
            .set(obj, function (error) {
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
