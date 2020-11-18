require("dotenv").config();
const jwt = require("jsonwebtoken");
var md5 = require("md5");
const pool = require("./Db_config");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.google_key);
var { isUserExist } = require("./Helper/MasterHelper");

module.exports.WATCHEVENT = async (req, res) => {
  try {
    var start=Math.floor(new Date())+(1000*60*10)          //10 minutes
    console.log(start)
    var result=await pool.query(`SELECT * from event WHERE start<'${start}'`);
    res.status(200).json({result});
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
