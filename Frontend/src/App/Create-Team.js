import React, { Component } from "react";
import { Container } from "semantic-ui-react";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import Cookies from "universal-cookie";

import { BrowserRouter as Link, Redirect } from "react-router-dom";
import { Form, Input, Button, Switch, message, Alert } from "antd";

const cookies = new Cookies();

export default class CreateTeam extends Component {
  state = {
    loading: false,
    fetched: false,
    team_created: null,
    redirect: true,
    alert: false,
  };
  onFinish = (values) => {
    console.log(values);
    if (values.private_calender) {
      var private_calender = values.private_calender;
    } else {
      var private_calender = false;
    }

    var team_name = values.team_name;
    var team_id = values.team_id;
    if (team_id && team_name) {
      this.setState({ loading: true });
      message.loading({ content: "Please Wait", key: "creatingteam" });
      var requestOptions = {
        method: "GET",
        redirect: "follow",
      };
      var token = cookies.get("webtoken");
      fetch(
        `https://caleder-app-backend.herokuapp.com/create_team?team_name=${team_name}&team_id=${team_id}&token=${token}&private_calender=${private_calender}`,
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => {
          if (result.status) {
            message.success({
              content: result.response,
              key: "creatingteam",
              duration: 3,
            });
            console.log(result);
            this.setState({ team_created: team_id });
          } else {
            this.setState({
              loading: false,
              alert: true,
              alert_message: result.response,
            });
            message.error({
              content: result.response,
              key: "creatingteam",
              duration: 3,
            });
          }
        })
        .catch((error) => console.log("error", error));
    } else {
      message.warning("All Feilds are required");
    }
  };

  createTeam = () => {};
  render() {
    if (this.state.team_created) {
      return <Redirect to={"/calender/" + this.state.team_created} />;
    }
    return (
      <div>
        <Container className="text-center">
          <Form
            name="normal_login"
            className="login-form col-lg-4 mx-auto shadow-lg p-4 mb-5 bg-white rounded pt-3 rounded mt-5"
            initialValues={{ remember: true }}
            onFinish={this.onFinish}
          >
            <Form.Item
              name="team_name"
              rules={[{ required: true, message: "Please Enter Team Name" }]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Team Name"
              />
            </Form.Item>
            <Form.Item
              name="team_id"
              rules={[
                { required: true, message: "Please Enter unique Team ID" },
              ]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Unique Team ID"
              />
            </Form.Item>
            
            <Form.Item label="Private Team" name="private_calender">
              <Switch title="Private Team's Calendar are accessible by team member only" />
            </Form.Item>
              
            {this.state.alert ? (
              <Alert message={this.state.alert_message} type="error" />
            ) : null}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                loading={this.state.loading}
              >
                <i className="fad fa-users-medical"></i>&nbsp; Create Team
              </Button>
            </Form.Item>
          </Form>
        </Container>
      </div>
    );
  }
}
