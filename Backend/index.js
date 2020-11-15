require("dotenv").config();
const express = require("express");
const app = express();
var cors = require("cors");
const port = process.env.PORT || 8080;
const mongoose = require("mongoose");
const { FetchEvent, AddEvent,Search,DeleteEvent,EditEvent } = require("./App/Event");
const { Login,FirebaseLogin } = require("./App/Login");
const { CreateTeam,AddUser,DeleteUser,ExitTeam,isUserInTeam,MyTeam,GetTeamMember,DeleteTeam,ChangeVisiblity} = require("./App/CreateTeam");
app.use(cors());

app.get("/", FetchEvent);
app.post("/add_event", AddEvent);
app.post("/edit_event", EditEvent);
app.get("/login", FirebaseLogin);
app.get("/create_team", CreateTeam);
app.get("/add_user", AddUser);
app.get("/delete_user", DeleteUser);
app.get("/exit_team", ExitTeam);
app.get("/search", Search);
app.get("/isExist",isUserInTeam);
app.get("/myteam",MyTeam);
app.get("/getTeamMember",GetTeamMember);

app.get("/changeVisiblity",ChangeVisiblity);
app.get("/deleteTeam",DeleteTeam);
app.get("/delete_event", DeleteEvent);
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
