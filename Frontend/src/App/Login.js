import React, { Component } from "react";
import Cookies from "universal-cookie";
import { message } from "antd";
import GoogleLogin from "react-google-login";

import "antd/dist/antd.css";
const cookies = new Cookies();

export default class AdminLogin extends Component {
  constructor() {
    super();
    this.state = { email: "", password: "", loading: false };
    this.check();
  }

  check = () => {
    if (cookies.get("webtoken")) {
      message.success("Already LoggedIn");
      setTimeout(() => {
        window.location = "/";
      }, 500);
    }
  };
  failed = (reason) => {
    console.log(reason);
    message.warning({ content: "Failed " + reason.error, duration: 3 });
  };
  responseGoogle = (result) => {
    if (result.profileObj.email) {
      var accesstoken = result.tokenObj.id_token;
      message.loading({
        content: "Please Wait while system is authenticating you ",
        key: "loggedin",
      });
      this.setState({ loading: true });
      var requestOptions = {
        method: "GET",
        redirect: "follow",
      };
      fetch(
        `${process.env.REACT_APP_BACKEND_URL}/login?accesstoken=${accesstoken}`,
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => {
          this.setState({ loading: false });
          if (result.status === 1) {
            message.success({
              content: "Login Successfull",
              key: "loggedin",
              duration: 2,
            });
            let token = result.token;
            cookies.set("webtoken", token, {
              path: "/",
              expires: new Date(Date.now() + 864000000),
            });
            window.location = "/";
            console.log(result);
          } else {
            message.error({
              content: result.message,
              key: "loggedin",
              duration: 2,
            });
          }
        })
        .catch((error) => console.log("error", error));
    } else {
      message.warning("Please Provide Required Permission");
    }
  };
  render() {
    return (
      <div className="text-center" style={{ paddingTop: "35vh" }}>
        <br></br>

        <GoogleLogin
          clientId={process.env.REACT_APP_GOOGLE_KEY}
          buttonText="Login with google"
          onSuccess={this.responseGoogle}
          onFailure={this.failed}
          isSignedIn={true}
          cookiePolicy={"single_host_origin"}
        />
      </div>
    );
  }
}
