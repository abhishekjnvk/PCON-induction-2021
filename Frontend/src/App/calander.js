import React from "react";
import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import moment from "moment";
import swal from "sweetalert";
import { message } from "antd";
import { Dimmer, Loader, Segment } from "semantic-ui-react";
import Swal from "sweetalert2";

import Cookies from "universal-cookie";
const cookies = new Cookies();
const token = cookies.get("webtoken");

class Calander extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      events: [],
      fetched: false,
      isMember: false,
      isAdmin: false,
    };
  }

  formatdate = (date) => {
    return new Date(date)
      .toLocaleString("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(" ", "T");
  };
  formatdateTime = (date) => {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime =
      date.toDateString() +" " + hours + ":" + minutes + " " + ampm;
    return strTime;
  };
  handleSelect = async ({ start, end }) => {
    var team_id = this.props.match.params.id;

    const { value: formValues } = await Swal.fire({
      confirmButtonText: `Save`,
      title: "Add Event",
      html:
        `<lable for="event_start">Event Starts at <span class="text-danger">*</span></lable>
        <input id="event_start" type="datetime-local" placeholder="Event Start Date" class="swal2-input" value="${this.formatdate(
          start
        )}">` +
        `<lable for="event_end">Event Ends at <span class="text-danger">*</span></lable>
        <input id="event_end" type="datetime-local" placeholder="Event Start Date" class="swal2-input" value="${this.formatdate(
          end
        )}">` +
        '<lable for="event_title">Event Name <span class="text-danger">*</span></lable><input id="event_title" class="swal2-input" placeholder="Event Title">' +
        '<lable for="extra_info">Extra Info</lable><input id="extra_info" class="swal2-input" placeholder="Any Extra Info (example:Eevent Url)">',
      focusConfirm: false,
      backdrop: "rgba(140,140,242,0.4)",

      preConfirm: () => {
        return [
          document.getElementById("event_start").value,
          document.getElementById("event_end").value,
          document.getElementById("event_title").value,
          document.getElementById("extra_info").value,
        ];
      },
    });

    if (formValues) {
      var event_start = new Date(formValues[0]);
      var event_end = new Date(formValues[1]);
      var event_title = formValues[2];
      var extra_info = formValues[3];
      if (event_start.getTime() && event_end.getTime()) {
        if (event_title.trim()) {
          message.loading({ content: "Adding Event", key: "event_adding" });
          var this_event = {
            start: event_start,
            end: event_end,
            title: event_title,
            extra: extra_info,
          };

          console.log(this_event);

          var requestOptions = {
            method: "POST",
            redirect: "follow",
          };
          fetch(
            `https://caleder-app-backend.herokuapp.com/add_event?event=${JSON.stringify(
              this_event
            )}&token=${token}&team_id=${team_id}`,
            requestOptions
          )
            .then((response) => response.json())
            .then((result) => {
              if (result.status === 0) {
                message.error({
                  content: result.message,
                  key: "event_adding",
                  duration: 2,
                });
              }
              if (result.status === 1) {
                this.setState({
                  events: [
                    ...this.state.events,
                    {
                      start: event_start,
                      end: event_end,
                      title: event_title,
                      extra: extra_info,
                    },
                  ],
                });
                message.success({
                  content: "Event Added",
                  key: "event_adding",
                  duration: 2,
                });
              }
            })
            .catch((error) => console.log("error", error));
        } else {
          message.warning("Event Title is Required Field");
        }
      } else {
        message.warning("Invalid Date");
      }
    }
  };

  getEvent = async () => {
    message.loading({ content: "Fetching Event list", key: "loadingEvent" });
    var team_id = this.props.match.params.id;
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };0
    var data = "team_id=" + team_id;
    if (token) {
      data = data + "&token=" + token;
    }
    fetch(`https://caleder-app-backend.herokuapp.com/?${data}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        var fetched_event = [];
        console.log(result.data);
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
        });
        message.destroy();
      })
      .catch((error) => console.log("error", error));
  };

  deleteEvent = (event) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this event",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        var requestOptions = {
          method: "GET",
          redirect: "follow",
        };
        var team_id = this.props.match.params.id;

        fetch(
          `https://caleder-app-backend.herokuapp.com/delete_event?team_id=${team_id}&token=${token}&event_id=${event.id}`,
          requestOptions
        )
          .then((response) => response.json())
          .then((result) => {
            console.log(result);
            if (result.status) {
              swal("Deleted", {
                icon: "success",
              });
              this.setState({ fetched: false });
            }
          })
          .catch((error) => console.log("error", error));
      }
    });
  };
  viewEvent = (event) => {
    //  console.log(event)
    let extra_info = "\n\n" + (event.extra || "");
    if (this.state.isAdmin) {
      var buttons = {
        delete: {
          text: "Delete Event",
          value: "delete",
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
      title: event.title,
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

        default:
      }
    });
  };
  render() {
    if (!this.state.fetched) {
      this.getEvent();
      return (
        <Segment style={{ minHeight: "250px" }}>
          <Dimmer active>
            <Loader />
          </Dimmer>
        </Segment>
      );
    }
    const localizer = momentLocalizer(moment);
    return (
      <div className="container mt-2 border border-primary rounded py-2">
        {this.state.isAdmin ? (
          <div className="text-right my-2">
            <button className="btn btn-secondary" onClick={this.handleSelect}>
              <i className="fad fa-calendar-plus"></i> Create Event
            </button>
          </div>
        ) : null}

        <Calendar
          selectable={this.state.isAdmin}
          localizer={localizer}
          events={this.state.events}
          defaultView={Views.MONTH}
          startAccessor="start"
          endAccessor="end"
          defaultDate={moment().toDate()}
          onSelectEvent={this.viewEvent}
          onSelectSlot={this.handleSelect}
        />
      </div>
    );
  }
}

export default Calander;
