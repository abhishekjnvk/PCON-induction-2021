import React, { useState } from "react";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
} from "reactstrap";
import Cookies from "universal-cookie";

// eslint-disable-next-line
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { message } from "antd";

const cookies = new Cookies();

var logout = () => {
  cookies.remove("webtoken");
  message.success("Logged Out");
  setTimeout(() => {
    window.location = "/";
  }, 1000);
};

const NavigationBar = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  var token = cookies.get("webtoken");
  if (!token) {
    var const_div = (
      <Link to="/admin" className="nav-link">
        Admin
      </Link>
    );
  } else {
    const_div = (
      <Link to="/logout" className="nav-link" onClick={logout}>
        Logout
      </Link>
    );
  }
  console.log(token);
  return (
    <div>
      <Navbar color="primary" dark expand="md">
        <Link to="/" className="navbar-brand">
          Event Calander
        </Link>

        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar>
            <NavItem>
              <Link to="/" className="nav-link text-light">
                Home
              </Link>
            </NavItem>
          </Nav>
          <Nav className="ml-auto " navbar>
            <NavItem className="nav-link text-light">{const_div}</NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
};

export default NavigationBar;
