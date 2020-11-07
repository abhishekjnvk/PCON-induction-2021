import React, { Component } from "react";
import Calander from "./App/calander";
import NavigationBar from "./Nav";
import AdminLogin from "./App/Login";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

export default class App extends Component {
  render() {
    return (
      <Router>
        <NavigationBar />
        <div>
          <Switch>
            <Route path="/admin">
              <AdminLogin />
            </Route>
            <Route path="/">
              <Calander />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}
