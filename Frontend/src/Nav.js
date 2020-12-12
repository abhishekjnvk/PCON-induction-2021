import React, { useCallback } from "react";
import { useHistory } from "react-router-dom";

import Cookies from "universal-cookie";
import swal from "sweetalert";
import { GoogleLogout } from "react-google-login";

import { makeStyles } from "@material-ui/core/styles";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import LoginIcon from "@material-ui/icons/Lock";
import LogoutIcon from "@material-ui/icons/KeyboardArrowDown";
import MenuItem from "@material-ui/core/MenuItem";
import Menu2 from "@material-ui/core/Menu";

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

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    // marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    color: "white",
  },
  stickToBottom: {
    width: "100%",
    position: "fixed",
    bottom: 0,
    fontSize: "0.8em",
    // boxShadow: "0px 0px 1000px 15px #888888",
    zIndex: 999,
  },
});

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
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const history = useHistory();
  const handleOnClick = useCallback((newValue) => history.push(newValue), [
    history,
  ]);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!token) {
    var nav_comp = (
      <Menu.Item key="4" className="float-right mr-3">
        <Link to="/">
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
    <>
      {window.innerWidth < 700 ? (
        <>
          <div className={classes.root}>
            <AppBar style={{zIndex:80}}>
              <Toolbar>
                <Typography variant="h6" className={classes.title}>
                  Team Calendar
                </Typography>
                {token != null ? (
                  <div>
                    <IconButton
                      aria-label="account of current user"
                      aria-controls="menu-appbar"
                      aria-haspopup="true"
                      onClick={handleMenu}
                      color="inherit"
                    >
                      <LogoutIcon />
                    </IconButton>
                    <Menu2
                      id="menu-appbar"
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      open={open}
                      onClose={handleClose}
                    >
                    <MenuItem onClick={handleClose}>
                      <Link to="/Create-team">
                        <i className="fad fa-users-medical"></i> Create Team
                      </Link>
                    </MenuItem>
                      <MenuItem onClick={handleClose}>
                        <GoogleLogout
                          clientId={process.env.REACT_APP_GOOGLE_KEY}
                          buttonText="Logout"
                          render={(renderProps) => (
                            <Link
                              onClick={renderProps.onClick}
                              disabled={renderProps.disabled}
                            >
                              <i className="fad fa-power-off"></i> (
                              <small className="text-dark">{email}</small>)
                            </Link>
                          )}
                          onLogoutSuccess={logout}
                          onFailure={logout}
                        ></GoogleLogout>
                      </MenuItem>
                    </Menu2>
                  </div>
                ) : (
                  <div>
                    <IconButton
                      aria-label="account of current user"
                      aria-controls="menu-appbar"
                      aria-haspopup="true"
                      onClick={handleMenu}
                      color="inherit"
                    >
                      <Link to="/" className="text-light">
                        <LoginIcon />
                        Login
                      </Link>
                    </IconButton>
                  </div>
                )}
              </Toolbar>
            </AppBar>
          </div>
          {token != null ? (
            <BottomNavigation
              value={value}
              onChange={(event, newValue) => {
                setValue(newValue);
                handleOnClick(newValue);
                console.log(newValue);
              }}
              showLabels
              className={classes.stickToBottom}
            >
              <BottomNavigationAction
                value="/my-schedules"
                label="My schedule"
                icon={<i className="far fa-calendar-week"></i>}
              />
              <BottomNavigationAction
                value="/"
                label="Home"
                icon={<i className="fad fa-home-lg-alt"></i>}
              />
              <BottomNavigationAction
                value="/team"
                label="My Team"
                icon={<i className="fad fa-users"></i>}
              />
            </BottomNavigation>
          ) : null}
        </>
      ) : (
        <Layout className="layout">
          <Header>
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
              {nav_comp}
            </Menu>
          </Header>
        </Layout>
      )}
    </>
  );
};

export default NavigationBar;
