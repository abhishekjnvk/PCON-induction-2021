require("dotenv").config();
const pool = require("../Db_config");
const jwt = require("jsonwebtoken");
var cache = require('memory-cache');

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

  getEmailFromToken: async function (token) {
    var data = await jwt.verify(token, process.env.secret_key);
    return data.data.email;
  },
  isUserExist: async (email) => {
    var flag = false;
    var result = await pool.query(
      `SELECT email FROM user WHERE email='${email}'`
    );
    if (result.length > 0) {
      flag = true;
    }
    return flag;
  },
  getTeamData:async(team_id)=>{
    var team_data = cache.get(`team_data_of_${team_id}`);
    if (!team_data) {
      team_data = [];
      var team_result = await pool.query(
        `SELECT team_id,team_name,creator,creation_date,private FROM team WHERE team_id='${team_id}'`
      );
      team_data = team_result[0];
      cache.put(`team_data_of_${team_id}`, team_data);
    }
    return team_data
  },
  isTeamExist: async (team_id) => {
    var flag = false;
    var team_data = await module.exports.getTeamData(team_id)
    if (team_data) {
      flag = true;
    }
    return flag;
  },

  isUserInTeam: async (team_id, email) => {
    var flag = false;
    var result = await pool.query(
      `SELECT * FROM member WHERE team_id='${team_id}' AND email='${email}'`
    );
    if (result.length > 0) {
      flag = true;
    }
    return flag;
  },
  isUserTeamAdmin: async (team_id, email) => {
    var flag = false;
    var result = await pool.query(
      `SELECT * FROM member WHERE team_id='${team_id}' AND email='${email}' AND (\`right\`='creator' OR \`right\`='admin')`
    );
    if (result.length > 0) {
      flag = true;
    }
    return flag;
  },
  isUserTeamCreator: async (team_id, email) => {
    let flag = false;
    var team_data = await module.exports.getTeamData(team_id)
    if (team_data.creator === email) {
      flag = true;
    }
    return flag;
  },
  isCalanderPrivate: async (team_id) => {
    let flag = false;
    var team_data = await module.exports.getTeamData(team_id)
    if (team_data) {
      if (team_data.private == "true") {
        flag = true;
      }
    }
    return flag;
  },
};
