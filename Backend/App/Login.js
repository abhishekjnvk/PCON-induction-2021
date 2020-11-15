require("dotenv").config();
const jwt = require("jsonwebtoken");
var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");
var md5 = require("md5");
var { firebaseConfig } = require("./Constants/Firebase");
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}


module.exports.FirebaseLogin = async (req, res) => {
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
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((response) => {
          
          res
            .json({
              status: 1,
              message: "successfully Logged in",
              token: token,
            })
            .status(200)
            .end();
        })
        .catch(function (error) {
          if (error.code == "auth/user-not-found") {
            //creating useraccount
            firebase
              .auth()
              .createUserWithEmailAndPassword(email, password)
              .then((response) => {
                //creating user node in database
                firebase
                  .database()
                  .ref("users/" + md5(email) + "/info")
                  .set({
                    email,
                  });

                res
                  .json({
                    status: 1,
                    message: "User Created Successfully",
                    token: token,
                  })
                  .status(200)
                  .end();
              })
              .catch(function (error) {
                res
                  .json({ status: 0, message: error.message })
                  .status(200)
                  .end();
              });
          } else {
            if (error.code == "auth/wrong-password") {
              res
                .json({
                  status: 0,
                  message: "Invalid Credentials",
                  errorCode: "Login_5",
                })
                .status(200)
                .end();
            } else if (error.code == "auth/user-disabled") {
              res.json({
                status: 0,
                message: "User is disabled Please contact support team",
                errorCode: "Login_4",
              });
            } else {
              res.json({
                status: 0,
                message: "Something Went Wrong",
                extraMessage: error.message,
                extraCode: error.code,
                errorCode: "Login_3",
              });
            }
          }
        });
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