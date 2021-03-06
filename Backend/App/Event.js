require("dotenv").config();
const pool = require("./Db_config");
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.eventsecret_key);
var uniqid = require("uniqid");
var cache = require("memory-cache");

var {
  isCalanderPrivate,
  isUserInTeam,
  isTeamExist,
  isUserTeamAdmin,
  getEmailFromToken,
  getTeamData,
  getUsersTeam,
  getTeamEvent,
} = require("./Helper/MasterHelper");

module.exports.FetchEvent = async (req, res) => {
  try {
    var { team_id, token } = req.query;

    if (token) {
      var email = await getEmailFromToken(token);
      var isMember = await isUserInTeam(team_id, email);
      var isAdmin = await isUserTeamAdmin(team_id, email);
    } else {
      isMember = false;
    }

    if (team_id) {
      team_id = team_id.toLowerCase();
      var calendar_exist = true;
      if (!(await isCalanderPrivate(team_id)) || isMember) {
        var team_data = await getTeamData(team_id);

        if (team_data) {
          var data = await getTeamEvent(team_id);
        } else {
          calendar_exist = false;
        }
        if (calendar_exist) {
          res
            .status(200)
            .json({ data, isMember, isAdmin, status: 1, team_data });
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

module.exports.MySchedule = async (req, res) => {
  try {
    var { token } = req.query;

    if (token) {
      var email = await getEmailFromToken(token);
      var user_team = await getUsersTeam(email);
      all_data = [];
      var flag = 0;

      user_team.forEach(async (element) => {
        let team_id = (element.team_id).toLowerCase();
        var data = await getTeamEvent(team_id);
        data.forEach(element => {
          all_data.push(element);
        });
        flag++;
        if (user_team.length == flag) {
          res
          .status(200)
          .json({ data:all_data,status: 1 });
        }
      });

      if(user_team.length==0){
        res.status(200).json({  });
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
      color = color || "";
      extra = extra || "";
      start = Math.floor(new Date(start));
      end = Math.floor(new Date(end));
      if (start && end && title) {
        var email = await getEmailFromToken(token);
        if (await isUserTeamAdmin(team_id, email)) {
          if (await isTeamExist(team_id)) {
            cache.del(`event_of_${team_id}`);
            await pool.query(
              `INSERT INTO \`event\`(\`event_id\`, \`team_id\`, \`title\`, \`start\`, \`end\`, \`color\`, \`extra\`, \`created_by\`) VALUES 
                                  ('${uniqid()}','${team_id}','${cryptr.encrypt(
                title
              )}','${start}','${end}','${color}','${cryptr.encrypt(
                extra
              )}','${email}')`
            );

            pool.query(
              `UPDATE team set last_active='${new Date().toLocaleString()}' WHERE team_id='${team_id}'`
            );

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
      var { start, end, title, color, extra } = obj;
      color = color || "";
      extra = extra || "";
      start = Math.floor(new Date(start));
      end = Math.floor(new Date(end));

      if (start && end && title) {
        var email = await getEmailFromToken(token);
        if (await isUserTeamAdmin(team_id, email)) {
          if (await isTeamExist(team_id)) {
            cache.del(`event_of_${team_id}`);

            await pool.query(
              `
              UPDATE \`event\` SET \`title\`='${cryptr.encrypt(
                title
              )}',\`start\`='${start}',\`end\`='${end}',\`color\`='${color}',\`extra\`='${cryptr.encrypt(
                extra
              )}',\`created_by\`='${email}' WHERE \`event_id\`='${event_id}' AND \`team_id\`='${team_id}'
              `
            );
            pool.query(
              `UPDATE team set last_active='${new Date().toLocaleString()}' WHERE team_id='${team_id}'`
            );

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
      var email = await getEmailFromToken(token);
      if (await isUserTeamAdmin(team_id, email)) {
        cache.del(`event_of_${team_id}`);

        await pool.query(
          `DELETE FROM event WHERE team_id='${team_id}' AND event_id='${event_id}'`
        );
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
