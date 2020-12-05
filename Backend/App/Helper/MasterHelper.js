require("dotenv").config();
const pool = require("../Db_config");
const jwt = require("jsonwebtoken");
var cache = require("memory-cache");
const nodemailer = require("nodemailer");

const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.eventsecret_key);

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
  getTeamData: async (team_id) => {
    var team_data = cache.get(`team_data_of_${team_id}`);
    if (!team_data) {
      team_data = [];
      var team_result = await pool.query(
        `SELECT team_id,team_name,creator,creation_date,private FROM team WHERE team_id='${team_id}'`
      );
      team_data = team_result[0];
      cache.put(`team_data_of_${team_id}`, team_data);
    }
    return team_data;
  },
  isTeamExist: async (team_id) => {
    var flag = false;
    var team_data = await module.exports.getTeamData(team_id);
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
    var team_data = await module.exports.getTeamData(team_id);
    if (team_data.creator === email) {
      flag = true;
    }
    return flag;
  },

  getUsersTeam: async (email) => {
    var data = cache.get(`team_of_${email}`);
    if (!data) {
      data = [];
      var result = await pool.query(
        `SELECT member.team_id,member.right,team.team_name FROM member INNER JOIN team ON team.team_id=member.team_id WHERE email='${email}'`
      );
      result.forEach(async (key) => {
        data.push(key);
      });
      cache.put(`team_of_${email}`, data);
    }
    return data;
  },

  getTeamEvent: async (team_id) => {
    var data = cache.get(`event_of_${team_id}`); //getting value from cache
    if (!data) {
      var data = [];

      var result = await pool.query(
        `SELECT * FROM event WHERE team_id='${team_id}'`
      );

      result.forEach(async (key) => {
        let team_obj = {
          team_id: key.team_id,
          id: key.event_id,
          start: parseInt(key.start),
          end: parseInt(key.end),
          title: cryptr.decrypt(key.title),
          extra: cryptr.decrypt(key.extra),
          color: key.color,
          created_by: key.created_by,
        };
        data.push(team_obj);
      });

      cache.put(`event_of_${team_id}`, data);
    }
    return data;
  },

  isCalanderPrivate: async (team_id) => {
    let flag = false;
    var team_data = await module.exports.getTeamData(team_id);
    if (team_data) {
      if (team_data.private == "true") {
        flag = true;
      }
    }
    return flag;
  },
  usersInTeam: async (team_id) => {
    var data = cache.get(`member_of_${team_id}`);
    if (!data) {
      data = [];
      var result = await pool.query(
        `SELECT email,team_id,\`right\` FROM member WHERE team_id='${team_id}'`
      );
      result.forEach(async (key) => {
        data.push(key);
      });
      cache.put(`member_of_${team_id}`, data);
    }
    return data;
  },
  emailsOFTeam: async (team_id) => {
    var email_array = cache.get(`emails_of_${team_id}`);

    if (!email_array) {
      var email_array = [];
      var data = await module.exports.usersInTeam(team_id);
      data.forEach(async (user) => {
        email_array.push(user.email);
      });
      cache.put(`emails_of_${team_id}`, email_array);
    }
    return email_array;
  },
  sendMail:(email,team_id,start)=>{
  let transporter = nodemailer.createTransport({
    host: "smtp.hostinger.in",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "abhishek@kksnit.in", // generated ethereal user
      pass: "Abhishek@1234#", // generated ethereal password
    },
  });
  let info = transporter.sendMail({
    from: '"Abhishek Kumar" <abhishek@kksnit.in>',
    to: email.join(),
    subject: "Event Reminder",
    text: "Hola! You have a event ",
    html: `<span style="font-size:20px">Hola!<br/> You have a event for <b>${team_id}</b> From <b>${new Date(parseInt(start))}</b></spam>`,
  });

  console.log("sent to")
  }
};
