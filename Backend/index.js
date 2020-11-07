require("dotenv").config();
const express = require("express");
const app = express();
var UserSchema = require("./schema/users");
const jwt = require("jsonwebtoken");
var cors = require('cors');
const port = process.env.PORT || 8080;
const mongoose = require("mongoose");
var EventSchema = require("./schema/event");
app.use(cors());
app.get("/", async (req, res) => {
  try {
    EventSchema.find({}, function (err, fetched_event) {
      res.send(fetched_event);
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error" + err.message,
      status: 0,
    });
  }
});

app.post("/add_event", async (req, res) => {
  try {
    var token = req.query.token;
    var decoded = jwt.verify(token, process.env.secret_key);
    if (decoded) {
      var obj = JSON.parse(req.query.event);
      await EventSchema.create(obj);
      res.json({ response: "Success", status: 1 });
    } else {
      res.json({ response: "Token Expired", status: 0 });
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error : " + err.message,
      status: 0,
    });
  }
});

app.post("/delete_event", async (req, res) => {});

app.get("/login", async (req, res) => {
  try {
    const { email, password } = req.query;
    // await UserSchema.create({email,password});
    if (email && password) {
      if (password.length > 4) {
        const userRecord = await UserSchema.findOne({ email });
        if (userRecord) {
          if (password != userRecord.password) {
            return res
              .json({ status: 0, message: "Wrong Password" })
              .status(200)
              .end();
          } else {
            const token = await jwt.sign(
              {
                data: {
                  role: "admin",
                  email: userRecord.email,
                },
              },
              process.env.secret_key,
              { expiresIn: "30d" }
            );
            return res
              .json({
                status: 1,
                message: "Authentication Successful",
                token,
              })
              .status(200)
              .end();
          }
        } else {
          return res
            .json({ status: 0, message: "Email Does Not exist" })
            .status(200)
            .end();
        }
      } else {
        return res
          .json({ status: 0, message: "Password is less than 4 character" })
          .status(200)
          .end();
      }
    } else {
      return res
        .json({ status: 0, message: "Missing Required Fields" })
        .status(200)
        .end();
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error" + err.message,
      status: 0,
    });
  }
});

app.listen(port, () => {
  mongoose.connect("mongodb://localhost/mydb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  console.log("Database ready!");
  console.log("Server is listing at at => " + port);
});
