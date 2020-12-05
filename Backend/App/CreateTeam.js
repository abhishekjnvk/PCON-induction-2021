const pool = require("./Db_config");
var cache = require("memory-cache");
var {
  isUserExist,
  isUserInTeam,
  isTeamExist,
  getEmailFromToken,
  getTeamData,
  isUserTeamCreator,
  getUsersTeam,
  usersInTeam,emailsOFTeam,sendMail
} = require("./Helper/MasterHelper");

const nodemailer = require("nodemailer");


module.exports.CreateTeam = async (req, res) => {
  try {
    var { team_name, team_id, token, private_calender } = req.query;
    if (team_id && team_name && token) {
      // team_id = team_id.toLowerCase();
      var format = /[ `!@#$%^&*()_+\-=[]{};':"\\|,.<>\/?~]/;

      if (!(/\s/.test(team_id) || format.test(team_id))) {
        if (!(await isTeamExist(team_id))) {
          var email = await getEmailFromToken(token);

          pool.query(
            `INSERT INTO member(\`team_id\`, \`email\`, \`right\`, \`date\`) VALUES ('${team_id}','${email}','creator','${new Date().toLocaleString()}')`
          );

          await pool.query(
            `INSERT INTO team(\`team_id\`, \`team_name\`, \`creation_date\`, \`last_active\`, \`creator\`, \`private\`) VALUES ('${team_id}','${team_name}','${new Date().toLocaleString()}','${new Date().toLocaleString()}','${email}','${private_calender}')`
          );

          cache.del(`team_of_${email}`);

          res.json({ response: "Success", status: 1, team_id: team_id });
        } else {
          res.json({ response: "Team id is not avialable", status: 0 });
        }
      } else {
        res.json({ response: "Invalid Team ID", status: 0 });
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
    var { team_id, email, right, token } = req.query;
    admin_email = await getEmailFromToken(token);
    if (await isTeamExist(team_id)) {
      if (await isUserTeamCreator(team_id, admin_email)) {
        if (await isUserExist(email)) {
          if (!(await isUserInTeam(team_id, email))) {
            cache.del(`member_of_${team_id}`);
            cache.del(`team_of_${email}`);
            cache.del(`emails_of_${team_id}`);

            pool.query(
              `INSERT INTO member(\`team_id\`, \`email\`, \`right\`, \`date\`) VALUES ('${team_id}','${email}','${right}','${new Date().toLocaleString()}')`
            );

            res.json({ response: "Success", status: 1, team_id: team_id });
          } else {
            res.json({ response: "User Already in Team", status: 0 });
          }
        } else {
          res.json({
            response: "There is no any user assosiated with this email",
            status: 0,
          });
        }
      } else {
        res.json({ response: "You are not a team creator", status: 0 });
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

module.exports.DeleteUser = async (req, res) => {
  try {
    var { team_id, email, token } = req.query;
    admin_email = await getEmailFromToken(token);
    if (await isUserTeamCreator(team_id, admin_email)) {
      if (await isTeamExist(team_id)) {
        cache.del(`member_of_${team_id}`);
        cache.del(`team_of_${email}`);
        cache.del(`emails_of_${team_id}`);


        pool.query(
          `DELETE FROM member WHERE team_id='${team_id}' AND email='${email}'`
        );

        res.json({ response: "Success", status: 1, team_id: team_id });
      } else {
        res.json({ response: "Team Doesn't Exist", status: 0 });
      }
    } else {
      res.json({ response: "You Are Not Creator of team", status: 0 });
    }
  } catch (err) {
    res.status(200).json({
      response: "Internal Server Error : " + err.message,
      status: 0,
    });
  }
};

module.exports.ExitTeam = async (req, res) => {
  try {
    var { team_id, token } = req.query;
    var email = await getEmailFromToken(token);
    if (!(await isUserTeamCreator(team_id, email))) {
      if (await isTeamExist(team_id)) {
        cache.del(`member_of_${team_id}`);
        cache.del(`team_of_${email}`);
        cache.del(`emails_of_${team_id}`);

        await pool.query(
          `DELETE FROM member WHERE team_id='${team_id}' AND email='${email}'`
        );

        res.json({ response: "Success", status: 1, team_id: team_id });
      } else {
        res.json({ response: "Team Doesn't Exist", status: 0 });
      }
    } else {
      res.json({ response: "Team Creator Can't Leave a team", status: 0 });
    }
  } catch (err) {
    res.status(200).json({
      response: "Internal Server Error : " + err.message,
      status: 0,
    });
  }
};

module.exports.DeleteTeam = async (req, res) => {
  try {
    var { team_id, token } = req.query;
    if (team_id && token) {
      var email = await getEmailFromToken(token);
      if (await isUserTeamCreator(team_id, email)) {
        pool.query(`DELETE FROM member WHERE team_id='${team_id}'`);
        pool.query(`DELETE FROM team WHERE team_id='${team_id}'`);
        await pool.query(`DELETE FROM event WHERE team_id='${team_id}'`);

        res.json({ response: "Success", status: 1 });

        cache.del(`team_data_of_${team_id}`);
        cache.del(`event_of_${team_id}`);
        var data = cache.get(`member_of_${team_id}`);
        data.forEach((element) => {
          cache.del(`team_of_${element.email}`);
        });
        cache.del(`member_of_${team_id}`);
        cache.del(`emails_of_${team_id}`);
      } else {
        res.json({ response: "You are not owner Of this team", status: 0 });
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

module.exports.ChangeVisiblity = async (req, res) => {
  try {
    var { team_id, token, team_type } = req.query;
    if (team_id && token && team_type) {
      var email = await getEmailFromToken(token);
      if (await isUserTeamCreator(team_id, email)) {
        cache.del(`team_data_of_${team_id}`);

        await pool.query(
          `UPDATE team set \`private\`='${team_type}' WHERE team_id='${team_id}'`
        );

        res.json({ response: "Success", status: 1 });
      } else {
        res.json({ response: "You are not owner Of this team", status: 0 });
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

module.exports.MyTeam = async (req, res) => {
  try {
    var { token } = req.query;
    if (token) {
      var email = await getEmailFromToken(token);
      var data = await getUsersTeam(email);
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

module.exports.CheckUpcoming = async () => {
  try {
    var start = new Date().getTime();
    var end = new Date().getTime() + 600000;
    var result = await pool.query(
      `SELECT team_id,start FROM event WHERE \`start\`>'${start}' AND \`start\`<'${end}'`
    );
    console.log("AAAAAAAAA")

    if (result.length) {
      result.forEach(async (element) => {
        let team_id = element.team_id;
        let start=element.start
        var email=await emailsOFTeam(team_id)
        sendMail(email,team_id,start)
      });
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports.GetTeamMember = async (req, res) => {
  try {
    var { token, team_id } = req.query;
    if (token) {
      var email = await getEmailFromToken(token);
      if (await isUserInTeam(team_id, email)) {
        var data = await usersInTeam(team_id);
        var team_data = await getTeamData(team_id);
        // var isAdmin = await isUserTeamAdmin(team_id, email);

        res.json({ response: "Success", status: 1, data, team_data });
      } else {
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
