import React from "react";
import Cookies from "universal-cookie";
import swal from "sweetalert";

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
console.log(email);
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
          <Link to="/team"><i className="fad fa-users" ></i> My Team</Link>
        </Menu.Item>
        <Menu.Item key="3">
          <Link to="/Create-team">
            <i className="fad fa-users-medical"></i> Create Team
            </Link>
        </Menu.Item>
        <Menu.Item key="4" className="float-right">
          <Link to="#" onClick={logout}>
            <i className="fad fa-power-off"></i> (
            <small className="text-light">{email}</small>)
          </Link>
        </Menu.Item>
      </>
    );
  }

  console.log(token);
  return (
    <Layout className="layout">
      <Header>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
          {nav_comp}
          {/* <Menu.Item key="4">{nav_comp}</Menu.Item> */}
        </Menu>
      </Header>
    </Layout>
  );
};

export default NavigationBar;
