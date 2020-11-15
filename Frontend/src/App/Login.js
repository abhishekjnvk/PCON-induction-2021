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
    if (email && password) {
      if (
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
          email
        )
      ) {
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
          `https://caleder-app-backend.herokuapp.com/login?email=${email}&password=${password}`,
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
              cookies.set("webtoken", token, { path: "/", expires: new Date(Date.now()+2592000000)});
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
        message.warning("Please Enter a Valid Email");
      }
    } else {
      message.warning("All Fields are required");
    }
  };
  render() {
    return (
      <div className="mt-5 px-3">
                  <center><b style={{fontSize:'25px'}}> Login/ Signup</b></center>
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
              <i className="fad fa-unlock-alt"></i> Login/ Signup
            </button>
          </div>
        </div>
      </div>
    );
  }
}
