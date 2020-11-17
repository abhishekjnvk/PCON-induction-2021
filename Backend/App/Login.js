require("dotenv").config();
const jwt = require("jsonwebtoken");
var md5 = require("md5");
const pool = require("./Db_config");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.google_key);
var { isUserExist } = require("./Helper/MasterHelper");

module.exports.Login = async (req, res) => {
  try {
    var { email, password } = req.query;
    const token = await jwt.sign(
      {
        data: {
          email: email,
        },
      },
      process.env.secret_key,
      { expiresIn: "30d" }
    );
    if (password.length > 5) {
      result = await pool.query(
        `SELECT email FROM user WHERE email='${email}'`
      );
      if (result.length) {
        result = await pool.query(
          `SELECT email FROM user WHERE email='${email}' AND password='${md5(
            password
          )}'`
        );
        if (result.length) {
          res
            .json({
              status: 1,
              message: "successfully Logged in",
              token: token,
            })
            .status(200)
            .end();
        } else {
          res.status(200).json({
            message: "Invalid Credentials",
            status: 0,
          });
        }
      } else {
        await pool.query(
          `INSERT INTO \`user\`(\`email\`, \`password\`, \`date\`, \`name\`) VALUES ('${email}','${md5(
            password
          )}','${new Date().toLocaleString()}','')`
        );
        res
          .json({
            status: 1,
            message: "successfully Logged in",
            token: token,
          })
          .status(200)
          .end();
      }
    } else {
      res
        .json({
          status: 0,
          message: "Password is too weak",
          errorCode: "Login_2",
        })
        .status(200)
        .end();
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error" + err.message,
      status: 0,
      errorCode: "Login_1",
    });
  }
};

module.exports.GoogleLogin = async (req, res) => {
  try {
    var { accesstoken } = req.query;
    const ticket = await client.verifyIdToken({
      idToken: accesstoken,
      audience:process.env.google_key
    });
    const payload = ticket.getPayload();
    var name = payload.name;
    var email = payload.email;
    var picture = payload.picture;

    const token = await jwt.sign(
      {
        data: {
          email: email,
          name:name
        },
      },
      process.env.secret_key,
      { expiresIn: "10d" }
    );

    if (!(await isUserExist(email))) {
      await pool.query(
        `INSERT INTO \`user\`(\`email\`, \`password\`, \`date\`, \`name\`, \`picture\`) VALUES ('${email}','','${new Date().toLocaleString()}','${name}','${picture}')`
      );
    }

    res.status(200).json({
      status: 1,
      message: "successfully Logged in",
      token: token,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error " + err.message,
      status: 0,
      errorCode: "Login_1",
    });
  }
};
