import React, { Component } from "react";
import Calander from "./App/calander";
import NavigationBar from "./Nav";
import Home from "./App/Home";
import Team from "./App/Team";
import AdminLogin from "./App/Login";
import CreateTeam from "./App/Create-Team";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Cookies from "universal-cookie";
import { message } from "antd";
import MySchedules from "./App/My-schedules"
message.config({
  top: "65vh",
  duration: 20,
  maxCount: 3,
});

const cookies = new Cookies();

var token = cookies.get("webtoken");


export default class App extends Component {
  render() {
    return (
      <Router>
        <NavigationBar />
        <div>
          <Switch>

          <Route path="/login">
              <AdminLogin />
            </Route>

            <Route exact path="/calender/:id" component={Calander} />
            {token ? (
              <>
                <Route path="/team/" component={Team} />
                <Route path="/create-team">
                  <CreateTeam />
                </Route>
                <Route path="/my-schedules">
                  <MySchedules />
                </Route>
                <Route exact path="/" component={Home} />
              </>
            ) : (
              <Route path="/*">
                <AdminLogin />
              </Route>
            )}
          </Switch>
        </div>
      </Router>
    );
  }
}
