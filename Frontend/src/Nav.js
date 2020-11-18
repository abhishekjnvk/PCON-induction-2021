import React from "react";
import Cookies from "universal-cookie";
import swal from "sweetalert";
import { GoogleLogout } from "react-google-login";

// eslint-disable-next-line
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import jwt_decode from "jwt-decode";

import { Layout, Menu, message } from "antd";
const cookies = new Cookies();
var token = cookies.get("webtoken");
if (token) {
  var decoded = jwt_decode(token);
  var email = decoded.data.email;
}

const { Header } = Layout;
var logout = () => {
  swal({
    title: "Do You really want to logout",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willDelete) => {
    if (willDelete) {
      cookies.remove("webtoken");
      message.success("Logged Out");
      setTimeout(() => {
        window.location = "/";
      }, 1000);
    }
  });
};

const NavigationBar = (props) => {
  if (!token) {
    var nav_comp = (
      <Menu.Item key="4" className="float-right mr-3">
        <Link to="/login">
          <i className="fad fa-unlock-alt"></i> Login
        </Link>
      </Menu.Item>
    );
  } else {
    nav_comp = (
      <>
        <Menu.Item key="1">
          <Link to="/">
            <i className="fad fa-home-lg-alt"></i> Home
          </Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link to="/my-schedules">
            <i className="far fa-calendar-week"></i> My Schedule
          </Link>
        </Menu.Item>
        <Menu.Item key="3">
          <Link to="/team">
            <i className="fad fa-users"></i> My Team
          </Link>
        </Menu.Item>
        <Menu.Item key="4">
          <Link to="/Create-team">
            <i className="fad fa-users-medical"></i> Create Team
          </Link>
        </Menu.Item>
        <Menu.Item key="5" className="float-right">
          <GoogleLogout
            clientId={process.env.REACT_APP_GOOGLE_KEY}
            buttonText="Logout"
            render={(renderProps) => (
              <Link
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
              >
                <i className="fad fa-power-off"></i> (
                <small className="text-light">{email}</small>)
              </Link>
            )}
            onLogoutSuccess={logout}
            onFailure={logout}
          ></GoogleLogout>
        </Menu.Item>
      </>
    );
  }

  return (
    <Layout className="layout">
      <Header>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
          {nav_comp}
        </Menu>
      </Header>
    </Layout>
  );
};

export default NavigationBar;
