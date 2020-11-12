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

message.config({
  top: 200,
  duration: 2,
  maxCount: 3,
});

const cookies = new Cookies();

var token = cookies.get("webtoken");
if (token) {
  var home = <Route exact path="/" component={Home} />;
} else {
  home = <Route exact path="/" component={AdminLogin} />;
}

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
            <Route path="/team/" component={Team} />
            <Route path="/create-team">
              <CreateTeam />
            </Route>
            <Route exact path="/calender/:id" component={Calander} />
            {home}
          </Switch>
        </div>
      </Router>
    );
  }
}
