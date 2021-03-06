import React, { Component } from "react";
import "semantic-ui-css/semantic.min.css";
import { Button, Icon, Dropdown } from "semantic-ui-react";
import { Redirect } from "react-router-dom";
import { message } from "antd";
import Cookies from "universal-cookie";
import "../style.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { Dimmer, Loader, Segment } from "semantic-ui-react";

const cookies = new Cookies();

class Home extends Component {
  state = {
    data: [],
    value: undefined,
    fetched: false,
    selected_team: undefined,
    redirect: false,
  };

  componentDidMount() {
    this.fetchEvent();
  }

  fetchEvent = () => {
    message.loading({ content: "Fetching Team list", key: "loadingTeam" });
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    var token = cookies.get("webtoken");
    fetch(
      `${process.env.REACT_APP_BACKEND_URL}/myteam?token=${token}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        this.setState({ fetched: true });
        var course_taught = [];
        if (!result.data.length) {
          message.warning({
            content: "You are not in any team please create a team",
            key: "loadingTeam",
            duration: 5,
          });
        } else {
          result.data.map((data) => {
            course_taught.push({
              key: data.team_id,
              text: data.team_name + " - " + data.team_id,
              value: data.team_id,
            });
            return true;
          });
          this.setState({ data: course_taught });
          message.destroy();
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
  };

  render() {
    if (!this.state.fetched) {
      return (
        <Segment style={{ minHeight: "90vh",zIndex:0 }}>
          <Dimmer active>
            <Loader />
          </Dimmer>
        </Segment>
      );
    } else {
      return (
        <div className="col-lg-3 mx-auto mt-2 text-center">
          {this.renderRedirect()}
          <center style={{ marginTop: "100px", padding: "25px" }}>
            Please Select a Team to View Calander
          </center>
          <Dropdown
            placeholder="Select Team"
            fluid
            clearable
            // search
            selection
            options={this.state.data}
            onChange={(e, data) => {
              this.setState({ redirect: false, selected_team: data.value });
            }}
            style={{ fontSize: "1.2em" }}
          />
          <Button color="facebook" className="mt-2" onClick={this.setRedirect}>
            <Icon name="calendar alternate outline" />
            View Calender
          </Button>
        </div>
      );
    }
  }
}

export default Home;
