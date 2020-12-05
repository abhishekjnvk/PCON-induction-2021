import React from "react";
import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import moment from "moment";
import swal from "sweetalert";
import { message } from "antd";
import { Dimmer, Loader, Segment } from "semantic-ui-react";
import Swal from "sweetalert2";
import "../style.css";

import Cookies from "universal-cookie";
const cookies = new Cookies();
const token = cookies.get("webtoken");

class MySchedules extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      events: [],
      fetched: false,
      isMember: false,
      isAdmin: false,
      team_data: {},
    };
  }

  formatdateTime = (date) => {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime =
      date.toDateString() + " " + hours + ":" + minutes + " " + ampm;
    return strTime;
  };

  getEvent = async () => {
    message.loading({ content: "Fetching Event list", key: "loadingEvent" });
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    var data = "token=" + token;
    fetch(
      `${process.env.REACT_APP_BACKEND_URL}/my_event?${data}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        if (result.status === 1) {
          var fetched_event = [];
          result.data.forEach((aaa) => {
            aaa.start = new Date(aaa.start);
            aaa.end = new Date(aaa.end);
            fetched_event.push({
              ...aaa,
            });
          });
          this.setState({
            events: fetched_event,
            fetched: true,
            isAdmin: result.isAdmin,
            isMember: result.isMember,
            team_data: result.team_data,
          });
        } else {
          Swal.fire({
            title: result.message,
            icon: "error",
            footer: "<b>If You Are a Member of Team! Please Login</b>",
          });
          this.setState({
            events: [],
            fetched: true,
            alert_message: result.message,
            isAdmin: false,
            isMember: false,
          });
        }
        message.destroy();
      })
      .catch((error) => console.log("error", error));
  };

  viewEvent = (event) => {
    let extra_info = "\n\n" + (event.extra || "");
    if (this.state.isAdmin) {
      var buttons = {
        delete: {
          text: "Delete Event",
          value: "delete",
          buttons: true,
          dangerMode: true,
        },
        edit: {
          text: "Edit Event",
          value: "edit",
          buttons: true,
          dangerMode: true,
        },
        Close: true,
      };
    } else {
      buttons = {
        Close: true,
      };
    }
    swal({
      title: event.title + " (" + event.team_id + ") ",
      text:
        this.formatdateTime(event.start) +
        " => " +
        this.formatdateTime(event.end) +
        extra_info,
      buttons: buttons,
    }).then((value) => {
      switch (value) {
        case "delete":
          this.deleteEvent(event);
          break;
        case "edit":
          this.editEvent(event);
          break;

        default:
      }
    });
  };

  handleEventColors = (event) => {
    const eventColors = {
      green: "bg-success",
      yellow: "bg-warning text-dark",
      dark: "bg-dark text-light",
      red: "bg-danger text-light",
      light_green: "bg-info text-light",
    };
    return { className: eventColors[event.color] };
  };

  render() {
    if (!this.state.fetched) {
      this.getEvent();
      return (
        <Segment style={{ minHeight: "90vh" }}>
          <Dimmer active>
            <Loader />
          </Dimmer>
        </Segment>
      );
    }
    const localizer = momentLocalizer(moment);
    return (
      <>
        <div className="container border border-primary rounded py-2">
          <b>
            <center style={{ fontSize: "25px" }}>My Schedule</center>
          </b>
          <Calendar
            selectable={false}
            localizer={localizer}
            events={this.state.events}
            defaultView={Views.MONTH}
            startAccessor="start"
            eventPropGetter={this.handleEventColors}
            endAccessor="end"
            defaultDate={moment().toDate()}
            onSelectEvent={this.viewEvent}
            onSelectSlot={this.handleSelect}
          />
        </div>
        <center>
          <small>Events From All Team Will Be Displayed Here </small>
        </center>
      </>
    );
  }
}

export default MySchedules;
