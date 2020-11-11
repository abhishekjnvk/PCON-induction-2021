import React, { Component } from "react";
import "semantic-ui-css/semantic.min.css";
import { Button, Icon, Label, Dropdown } from "semantic-ui-react";
import { Redirect } from "react-router-dom";
import { message } from "antd";
import Cookies from "universal-cookie";
const cookies = new Cookies();

class Home extends Component {
  state = {
    data: [],
    value: undefined,
    fetched: false,
    selected_team: undefined,
    redirect: false,
  };

  fetchEvent = () => {
    message.loading({ content: "Fetching Team list", key: "loadingTeam" });

    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    var token = cookies.get("webtoken");
    fetch(`http://localhost:8080/myteam?token=${token}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        this.setState({ fetched: true });
        var course_taught = [];
        if (!result.data.length) {
          message.warning({
            content: "You are not in any team please create a team",
            key: "loadingTeam",
            duration: 1,
          });
        } else {
          result.data.map((data) => {
            course_taught.push({
              key: data.team_id,
              text: data.team_id,
              value: data.team_id,
            });
            return true;
          });
          this.setState({ data: course_taught });
          message.success({
            content: "Fetched",
            key: "loadingTeam",
            duration: 1,
          });
        }
      })
      .catch((error) => console.log("error", error));
  };
  handleChange = (value) => {
    this.setState({ value });
  };
  setRedirect = () => {
    this.setState({
      redirect: true,
    });
  };
  unsetRedirect = () => {
    this.setState({
      redirect: true,
    });
  };
  renderRedirect = () => {
    if (this.state.redirect && this.state.selected_team) {
      return <Redirect to={"/calender/" + this.state.selected_team} />;
    }
    // this.unsetRedirect
  };

  render() {
    if (!this.state.fetched) {
      this.fetchEvent();
      return <></>;
    } else {
      return (
        <div className="col-lg-2 mx-auto mt-2 text-center">
          {this.renderRedirect()}
          <Dropdown
            placeholder="Select Team"
            fluid
            search
            selection
            options={this.state.data}
            onChange={(e, data) => {
              this.setState({ selected_team: data.value });
            }}
          />
          <Button color="red" className="mt-2" onClick={this.setRedirect}>
            <Icon name="refresh" />
            Fetch Events
          </Button>
        </div>
      );
    }
  }
}

export default Home;
