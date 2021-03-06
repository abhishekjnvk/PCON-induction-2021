require("dotenv").config();
const express = require("express");
const app = express();
var cors = require("cors");
var schedule = require("node-schedule");
const port = process.env.PORT || 8080;
const {
  FetchEvent,
  AddEvent,
  DeleteEvent,
  EditEvent,
  MySchedule,
} = require("./App/Event");
const { GoogleLogin } = require("./App/Login");
const {
  CreateTeam,
  AddUser,
  DeleteUser,
  ExitTeam,
  MyTeam,
  GetTeamMember,
  DeleteTeam,
  ChangeVisiblity,CheckUpcoming
} = require("./App/CreateTeam");

app.use(
  cors({
    origin: [process.env.dev_url, process.env.prod_url, process.env.prods_url],
  })
);

app.get("/", FetchEvent);
app.post("/add_event", AddEvent);
app.post("/edit_event", EditEvent);
app.get("/login", GoogleLogin);
app.get("/create_team", CreateTeam);
app.get("/add_user", AddUser);
app.get("/delete_user", DeleteUser);
app.get("/exit_team", ExitTeam);
app.get("/myteam", MyTeam);
app.get("/getTeamMember", GetTeamMember);
app.get("/changeVisiblity", ChangeVisiblity);
app.get("/deleteTeam", DeleteTeam);
app.get("/delete_event", DeleteEvent);

app.get("/my_event", MySchedule);

app.get("/checkGoogle", GoogleLogin);
CheckUpcoming()
setInterval(() => {
  CheckUpcoming()
}, 60000);

app.listen(port, () => {
  console.log("Server is listing at at => " + port);
});
