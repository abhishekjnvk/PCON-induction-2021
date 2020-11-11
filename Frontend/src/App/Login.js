import React, { Component } from "react";
import Cookies from "universal-cookie";
import { message } from "antd";

import "antd/dist/antd.css";

export default class AdminLogin extends Component {
  constructor() {
    super();
    this.state = { email: "", password: "", loading: false };
    this.check();
  }

  check = () => {
    const cookies = new Cookies();
    if (cookies.get("webtoken")) {
      message.success("Already LoggedIn");
      setTimeout(() => {
        window.location = "/";
      }, 500);
    }
  };
  login = () => {
    const cookies = new Cookies();
    let email = this.state.email;
    let password = this.state.password;
    console.log("email: " + email);
    console.log("password: " + password);

    if (email && password) {
      message.loading({
        content: "Please Wait while system is authenticating you ",
        key: "loggedin",
      });
      this.setState({ loading: true });
      //
      var requestOptions = {
        method: "GET",
        redirect: "follow",
      };
      fetch(
        `http://localhost:8080/login?email=${email}&password=${password}`,
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
            cookies.set("webtoken", token, { path: "/" });
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
      message.warning("All Fields are required");
    }
  };
  render() {
    return (
      <div className="mt-5 px-3">
        <div
          className="col-lg-3 col-md-4 col-sm-10 mx-auto border border-primary p-4 px-2 rounded"
          style={{ marginTop: "15vh" }}
        >
          <div className="form-group">
            <label for="exampleInputEmail1">Email address</label>
            <input
              type="email"
              className="form-control"
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
              onChange={(e) => {
                this.setState({ email: e.target.value });
              }}
            />
          </div>
          <div className="form-group">
            <label for="exampleInputPassword1">Password</label>
            <input
              type="password"
              className="form-control"
              id="exampleInputPassword1"
              onChange={(e) => {
                this.setState({ password: e.target.value });
              }}
            />
          </div>
          <div style={{ textAlign: "right" }}>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={this.login}
              loading={this.state.loading}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }
}
