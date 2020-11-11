require("firebase/auth");
require("firebase/database");
var uniqid = require("uniqid");
var md5 = require("md5");

var { firebaseConfig } = require("./Constants/Firebase");
var firebase = require("firebase/app");
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

var {
  isUserExist,
  isUserInTeam,
  isTeamExist,
  geEmailFromToken,
  getTeamName,
} = require("./Helper/MasterHelper");

module.exports.CreateTeam = async (req, res) => {
  try {
    var { team_name, team_id, token } = req.query;
    if (team_id && team_name && token) {
      if (!(await isTeamExist(team_id))) {
        var email = await geEmailFromToken(token);
        var uid = md5(email);
        firebase
          .database()
          .ref("/team/" + team_id + "/info")
          .set({
            team_name: team_name,
            creator: email,
          });

        firebase
          .database()
          .ref("users/" + uid + "/team/" + team_id)
          .set({ right: "admin" });

        await firebase
          .database()
          .ref("/team/" + team_id + "/members/" + uid)
          .set({ email, right: "admin" });

        res.json({ response: "Success", status: 1, team_id: team_id });
      } else {
        res.json({ response: "Team id is not avialable", status: 0 });
      }
    } else {
      res.json({ response: "Missing Required Feild", status: 0 });
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error : " + err.message,
      status: 0,
    });
  }
};

module.exports.AddUser = async (req, res) => {
  try {
    var { team_id, email, right } = req.query;
    var uid = md5(email);
    if (await isTeamExist(team_id)) {
      if (await isUserExist(email)) {
        if (!(await isUserInTeam(team_id, email))) {
          firebase
            .database()
            .ref("/team/" + team_id + "/members/" + uid)
            .set({ email, right });

          await firebase
            .database()
            .ref("users/" + uid + "/team/" + team_id)
            .set({ right });

          res.json({ response: "Success", status: 1, team_id: team_id });
        } else {
          res.json({ response: "User Already in Team", status: 0 });
        }
      } else {
        res.json({ response: "User Doesn't Exist", status: 0 });
      }
    } else {
      res.json({ response: "Team Doesn't Exist", status: 0 });
    }
  } catch (err) {
    res.status(200).json({
      response: "Internal Server Error : " + err.message,
      status: 0,
    });
  }
};

module.exports.ISTeamExist = async (req, res) => {
  var team_id = req.query.team_id;
  var status = await isTeamExist(team_id);
  res.json({ response: "Success", status: 1, status });
};

module.exports.isUserInTeam = async (req, res) => {
  var { team_id, email } = req.query;
  var status = await isUserInTeam(team_id, email);
  res.json({ response: "Success", status: 1, status });
};

module.exports.MyTeam = async (req, res) => {
  try {
    var { token } = req.query;
    if (token) {
      var email = await geEmailFromToken(token);
      var uid = md5(email);
      let data = [];
      await firebase
        .database()
        .ref("/users/" + uid + "/team/")
        .once("value", function (snap) {
          var obj = snap.val();
          if (obj) {
            Object.keys(obj).forEach(async (key) => {
              let team_obj = { team_id: key };
              data.push(team_obj);
            });
          }
        })
        .catch((error) => {
          res.json({ response: error, status: 1, data });
        });
      res.json({ response: "Success", status: 1, data });
    } else {
      res.json({ response: "Missing Required Feilds", status: 1, data });
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error : " + err.message,
      status: 0,
    });
  }
};

module.exports.GetTeamMember = async (req, res) => {
  try {
    var { token, team_id } = req.query;
    if (token) {
      var email = await geEmailFromToken(token);
      if (await isUserInTeam(team_id, email)) {
        let data = [];
        await firebase
          .database()
          .ref("/team/" + team_id + "/members/")
          .once("value", function (snap) {
            var obj = snap.val();
            if (obj) {
              Object.keys(obj).forEach(async (key) => {
                let team_obj = { email: obj[key].email,right: obj[key].right};
                data.push(team_obj);
              });
            }
          })
          .catch((error) => {
            res.json({ response: error, status: 0 });
          });
        res.json({ response: "Success", status: 1, data });
      }else{
        res.json({ response: "You Are not in team", status: 0 });
      }
    } else {
      res.json({ response: "Missing Required Feilds", status: 0, data });
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error : " + err.message,
      status: 0,
    });
  }
};
