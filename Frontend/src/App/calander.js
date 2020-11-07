import React from "react";
import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import moment from "moment";
import swal from "sweetalert";
import { message } from "antd";

import Cookies from "universal-cookie";
const cookies = new Cookies();
const token = cookies.get("webtoken");

class Calander extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = { events: [], fetched: false };
  }

  handleSelect = async ({ start, end }) => {
    if (token) {
      swal("Enter Event Name:", {
        content: "input",
      }).then((title) => {
        if (title) {
          message.loading({ content: "Adding Event", key:"event_adding" });
          var this_event = {
            start,
            end,
            title,
          };

          var requestOptions = {
            method: "POST",
            redirect: "follow",
          };
          fetch(
            `http://localhost:8080/add_event?event=${JSON.stringify(
              this_event
            )}&token=${token}`,
            requestOptions
          )
            .then((response) => response.json())
            .then((result) => {
              if (result.status === 0) {
                message.error({ content: result.message, key:"event_adding", duration: 2 });
              }
              if (result.status === 1) {
                this.setState({
                  events: [
                    ...this.state.events,
                    {
                      start,
                      end,
                      title,
                    },
                  ],
                });
                message.success({ content: "Event Added", key:"event_adding", duration: 2 });
              }
            })
            .catch((error) => console.log("error", error));
        }
      });
    } else {
      message.warning("You are not admin");
    }
  };

  getEvent = async () => {
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    fetch("http://localhost:8080/", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        var fucking_event = [];
        result.forEach((aaa) => {
          aaa.start = new Date(aaa.start);
          aaa.end = new Date(aaa.end);
          fucking_event.push({
            ...aaa,
          });
        });
        console.log(fucking_event);
        this.setState({
          events: fucking_event,
          fetched: true,
        });
      })
      .catch((error) => console.log("error", error));
  };

  render() {
    if (!this.state.fetched) {
      this.getEvent();
    }
    const localizer = momentLocalizer(moment);
    return (
      <div className="container mt-2 border border-primary rounded py-2">
        <Calendar
          selectable
          localizer={localizer}
          events={this.state.events}
          defaultView={Views.MONTH}
          startAccessor="start"
          endAccessor="end"
          defaultDate={moment().toDate()}
          onSelectEvent={(event) => {
            swal(event.title);
          }}
          onSelectSlot={this.handleSelect}
        />
      </div>
    );
  }
}

export default Calander;
