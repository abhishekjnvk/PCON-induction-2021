import React from "react";
import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import moment from "moment";
import swal from "sweetalert";
import { message } from "antd";
import { Dimmer, Loader, Segment } from "semantic-ui-react";

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

  handleSelect = async ({ start, end }) => {
    var team_id = this.props.match.params.id;
    if (this.state.isAdmin) {
      swal("Enter Event Name:", {
        content: "input",
      }).then((title) => {
        if (title) {
          message.loading({ content: "Adding Event", key: "event_adding" });
          var this_event = {
            start,
            end,
            title,
          };
          // console.log(this_event);
          var requestOptions = {
            method: "POST",
            redirect: "follow",
          };
          fetch(`https://caleder-app-backend.herokuapp.com/add_event?event=${JSON.stringify(this_event)}&token=${token}&team_id=${team_id}`,
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
                      start,
                      end,
                      title,
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
        }
      });
    } else {
      message.warning("You are not admin");
    }
  };

  getEvent = async () => {
    message.loading({ content: "Fetching Event list", key: "loadingEvent" });
    var team_id = this.props.match.params.id;
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    var data="team_id="+team_id;
    if(token){
       data=data+"&token="+token;
    }
    fetch(
      `https://caleder-app-backend.herokuapp.com/?${data}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        var fucking_event = [];
        result.data.forEach((aaa) => {
          aaa.start = new Date(aaa.start);
          aaa.end = new Date(aaa.end);
          fucking_event.push({
            ...aaa,
          });
        });
        this.setState({
          events: fucking_event,
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
      text:
        "Once deleted, you will not be able to recover this event",
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
            if(result.status){
              swal("Deleted", {
                icon: "success",
              });
              this.setState({fetched:false})
            }
          })
          .catch((error) => console.log("error", error));

      }
    });
  };
  viewEvent = (event) => {
    //  console.log(event)
    if (this.state.isAdmin) {
      var buttons = {
        delete: {
          text: "Delete Event",
          value: "delete",
          buttons: true,
          dangerMode: true,
        },
        okay: true,
      };
    } else {
      buttons = {
        okay: true,
      };
    }
    swal({
      title: event.title,
      text:
        new Date(event.start).toLocaleString() +
        " => " +
        new Date(event.end).toLocaleString(),
      // icon: "warning",
      buttons: buttons,
    })
      // swal(event.title, {
      //   buttons: {
      //     delete: {
      //       text: "Delete Event",
      //       value: "delete",
      //       buttons: true,
      //       dangerMode: true,
      //     },
      //     okay: true,
      //   },
      // })
      .then((value) => {
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
        <Segment>
          <Dimmer active>
            <Loader />
          </Dimmer>
        </Segment>
      );
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
          onSelectEvent={this.viewEvent}
          onSelectSlot={this.handleSelect}
        />
      </div>
    );
  }
}

export default Calander;
