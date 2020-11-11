require("dotenv").config();
const express = require("express");
const app = express();
var cors = require("cors");
const port = process.env.PORT || 8080;
const mongoose = require("mongoose");
const { FetchEvent, AddEvent,Search } = require("./App/Event");
const { Login,FirebaseLogin } = require("./App/Login");
const { CreateTeam,AddUser,isUserInTeam,MyTeam,GetTeamMember } = require("./App/CreateTeam");
app.use(cors());

app.get("/", FetchEvent);
app.post("/add_event", AddEvent);
// app.get("/login", Login);
app.get("/login", FirebaseLogin);
app.get("/create_team", CreateTeam);
app.get("/add_user", AddUser);
app.get("/search", Search);
app.get("/isExist",isUserInTeam);
app.get("/myteam",MyTeam);
app.get("/getTeamMember",GetTeamMember);

app.post("/delete_event", async (req, res) => {});
// app.post("/fetch_user", );


app.listen(port, () => {
  
  // mongoose.connect("mongodb://localhost/mydb", {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  //   useCreateIndex: true,
  // });

  console.log("Database ready!");
  console.log("Server is listing at at => " + port);
});
