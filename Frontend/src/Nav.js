import React from "react";
import Cookies from "universal-cookie";

// eslint-disable-next-line

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import { Layout, Menu, message } from "antd";
const { Header } = Layout;
const cookies = new Cookies();
var logout = () => {
  cookies.remove("webtoken");
  message.success("Logged Out");
  setTimeout(() => {
    window.location = "/";
  }, 1000);
};

const NavigationBar = (props) => {
  // const [isOpen, setIsOpen] = useState(false);
  // const toggle = () => setIsOpen(!isOpen);
  var token = cookies.get("webtoken");
  if (!token) {
    var const_div = <Link to="/login">Login</Link>;
  } else {
    const_div = (
      <Link to="/logout" onClick={logout}>
        Logout
      </Link>
    );
  }
  console.log(token);
  return (
    // <div>
    //   <Navbar color="primary" dark expand="md">
    //     <Link to="/" className="navbar-brand">
    //       Event Calander
    //     </Link>

    //     <NavbarToggler onClick={toggle} />
    //     <Collapse isOpen={isOpen} navbar>
    //       <Nav className="mr-auto" navbar>
    //         <NavItem>
    //           <Link to="/" className="nav-link text-light">
    //             Home
    //           </Link>
    //         </NavItem>
    //       </Nav>
    //       <Nav className="ml-auto " navbar>
    //         <NavItem className="nav-link text-light">{const_div}</NavItem>
    //       </Nav>
    //     </Collapse>
    //   </Navbar>
    // </div>
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
            <Menu.Item key="1">
              <Link to="/">Home</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/team">Team</Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to="/Create-team">Create Team</Link>
            </Menu.Item>
            <Menu.Item key="4">{const_div}</Menu.Item>
          </Menu>
        </Header>
      </Layout>
  );
};

export default NavigationBar;
