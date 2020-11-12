require("dotenv").config();
require("firebase/auth");
require("firebase/database");
var md5 = require("md5");
const jwt = require("jsonwebtoken");

var { firebaseConfig } = require("../Constants/Firebase");
var firebase = require("firebase/app");

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

module.exports = {
  FilterString: async function (str) {
    //function to filter string to avoid sql injection attack
    var res = str.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "");
    var res = res.replace(/ OR /gi, "");
    var res = res.replace(/ AND /gi, "");
    var res = res.replace(/ WHERE /gi, "");
    var res = res.replace(/ SELECT /gi, "");
    var res = res.replace(/ DISTINCT /gi, "");
    var res = res.replace(/ FROM /gi, "");
    var res = res.replace(/ BY /gi, "");
    var res = res.replace(/ GROUP /gi, "");
    var res = res.replace(/ COUNT /gi, "");
    var res = res.replace(/ DROP /gi, "");
    var res = res.replace(/ TABLE /gi, "");
    var res = res.replace(/ CREATE /gi, "");
    var res = res.replace(/ ALTER /gi, "");
    var res = res.replace(/ TRUNCATE /gi, "");
    var res = res.replace(/ DATABASE /gi, "");
    return res;
  },

  getUserId: async function (email) {
    admin
      .auth()
      .getUserByEmail(email)
      .then(function (userRecord) {
        console.log("Successfully fetched user data:", userRecord.toJSON());
      })
      .catch(function (error) {
        console.log("Error fetching user data:", error);
      });
  },

  geEmailFromToken: async function (token) {
    var data = await jwt.verify(token, process.env.secret_key);
    return data.data.email;
  },
  isUserExist: async (email) => {
    var flag = false;
    await firebase
      .auth()
      .fetchSignInMethodsForEmail(email)
      .then(function (providers) {
        if (providers.length) {
          flag = true;
        }
      });
    return flag;
  },
  isTeamExist: async (team_id) => {
    var flag = false;
    await firebase
      .database()
      // .ref()
      .ref("/team/" + team_id + "/info")
      .once("value", function (snap) {
        if (snap.exists()) {
          flag = true;
        }
      });
    return flag;
  },

  isUserInTeam: async (team_id, email) => {
    var flag = false;
    var uid = md5(email);
    await firebase
      .database()
      .ref("/team/" + team_id + "/members/" + uid + "/")
      .once("value", function (snap) {
        if (snap.exists()) {
          flag = true;
        }
      });
    return flag;
  },
  isUserTeamAdmin: async (team_id, email) => {
    let flag = false;
    let uid=md5(email)
    await firebase
      .database()
      .ref("/team/" + team_id + "/members/"+uid)
      .once("value", function (snap) {
        if (snap.val().right === "admin") {
          flag = true;
        }
      });
    return flag;
  },
  getTeamName: async (team_id) => {
    var flag = "";
    await firebase
      .database()
      .ref("/team/" + team_id + "/info/")
      .once("value", function (snap) {
        flag = snap.val().team_name;
      });
    return flag;
  },
};
