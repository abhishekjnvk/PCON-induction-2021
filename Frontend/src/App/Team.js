import React, { Component } from "react";
import "semantic-ui-css/semantic.min.css";
import Cookies from "universal-cookie";
import { Dimmer, Loader, Dropdown } from "semantic-ui-react";
import "../style.css";
import swal from "sweetalert";
import { Input, message } from "antd";
import { Form, Button, Select } from "antd";
import jwt_decode from "jwt-decode";

const { Option } = Select;
const cookies = new Cookies();
var token = cookies.get("webtoken");
if (token) {
  var decoded = jwt_decode(token);
  var email = decoded.data.email;
}
class Team extends Component {
  state = {
    data: [],
    value: undefined,
    fetched: 0,
    member_fetched: 1,
    selected_team: undefined,
    team_member: [],
    team_data: [],
    redirect: false,
    isAdmin: false,
  };

  fetchTeam = () => {
    message.loading({ content: "Fetching Team list", key: "loadingTeam" });
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    // var token = cookies.get("webtoken");
    fetch(`${process.env.REACT_APP_BACKEND_URL}/myteam?token=${token}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        this.setState({ fetched: 1 });
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
              text: data.team_name+" - "+data.team_id,
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
  addUser = (value) => {
    // return
    if (value) {
      var new_user_data = { email: value.email, right: value.member_type };

      message.loading({ content: "Adding User", key: "addingUser" });
      var requestOptions = {
        method: "GET",
        redirect: "follow",
      };

      fetch(
        `${process.env.REACT_APP_BACKEND_URL}/add_user?team_id=${this.state.selected_team}&email=${value.email}&right=${value.member_type}&token=${token}`,
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => {
          if (result.status) {
            message.success({
              content: "User Added",
              key: "addingUser",
              duration: 3,
            });


            var new_list = this.state.team_member;
            new_list.push(new_user_data);
            this.setState({ team_member: new_list });

          } else {
            message.warning({
              content: result.response,
              key: "addingUser",
              duration: 5,
            });
          }
        })
        .catch((error) => console.log("error", error));
    }
  };
  DeleteUser = (this_user) => {
    message.destroy()
    if (!this.state.isCreator) {
      return;
    }
    var user_email = this_user.email;
    if (this.state.team_data.creator === user_email) {
      message.warning({content:"You Can't Remove a team creator",duration: 3});
      return;
    }

    var index_of_this_user = this.state.team_member.findIndex(
      (x) => x.email === this_user.email
    );
    var new_list = this.state.team_member;
    new_list.splice(index_of_this_user, 1);

    swal({
      title: "Are you sure?",
      text:
        "Do You really Want to Remove " +
        user_email +
        " from " +
        this.state.team_data.team_name,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        if (user_email) {
          message.loading({ content: "Removing User", key: "addingUser" });
          var requestOptions = {
            method: "GET",
            redirect: "follow",
          };
          fetch(
            `${process.env.REACT_APP_BACKEND_URL}/delete_user?team_id=${this.state.selected_team}&email=${user_email}&token=${token}`,
            requestOptions
          )
            .then((response) => response.json())
            .then((result) => {
              if (result.status) {
                message.success({
                  content: "User Deleted",
                  key: "addingUser",
                  duration: 3,
                });
                this.setState({ team_member: new_list });
               
                
              } else {
                message.warning({
                  content: result.response,
                  key: "addingUser",
                  duration: 5,
                });
              }
            })
            .catch((error) => console.log("error", error));
        }
      }
    });
  };

  ExitTeam = () => {
    message.destroy()
    if (this.state.isCreator) {
      message.warning({content:"Team Creator Can't Leave a team",duration:5});
      return;
    }
    swal({
      title: "Are you sure?",
      text:
        "Do You really Want to Exit from " +
        this.state.team_data.team_name,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
          message.loading({ content: "Removing User", key: "addingUser" });
          var requestOptions = {
            method: "GET",
            redirect: "follow",
          };
          fetch(
            `${process.env.REACT_APP_BACKEND_URL}/exit_team?team_id=${this.state.selected_team}&token=${token}`,
            requestOptions
          )
            .then((response) => response.json())
            .then((result) => {
              if (result.status) {
                message.destroy();

                message.success({
                  content: "Team Left",
                  key: "addingUser",
                  duration: 3,
                });
                window.location='/'
              } else {
                message.warning({
                  content: result.response,
                  key: "addingUser",
                  duration: 5,
                });
              }
            })
            .catch((error) => console.log("error", error));
        
      }
    });
  };

  fetchMembers = () => {
    if (this.state.selected_team) {
      var requestOptions = {
        method: "GET",
        redirect: "follow",
      };
      // var token = cookies.get("webtoken");
      fetch(
        `${process.env.REACT_APP_BACKEND_URL}/getTeamMember?team_id=${this.state.selected_team}&token=${token}`,
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => {
          if (result.status) {
            this.setState({
              team_member: result.data,
              isAdmin: result.isAdmin,
              team_data: result.team_data,
            });
            this.setState({ member_fetched: 1 });
            if (result.team_data.creator === email) {
              this.setState({ isCreator: true });
            }
          } else {
            message.warning("Something Went Wrong");
          }
        })
        .catch((error) => {
          message.warning("Something Went Wrong");
          console.log(error);
        });
    }
  };
  handleChange = (value) => {
    this.setState({ value });
  };

  edit_team = async () => {
    if (this.state.team_data.private === "true") {
      var new_type = "false";
      var visiblity_text = "Make Public";
    } else {
      new_type = "true";
      visiblity_text = "Make Private";
    }
    var buttons = {
      delete: {
        text: "Delete Team",
        value: "delete",
        buttons: true,
        dangerMode: true,
      },
      edit: {
        text: visiblity_text,
        value: "edit",
        buttons: true,
        dangerMode: true,
      },
      Close: true,
    };

    swal({
      title: "Team Setting",
      text: "",
      buttons: buttons,
    }).then((value) => {
      switch (value) {
        case "delete":
          this.deleteTeam();
          break;
        case "edit":
          this.changeVisiblity(new_type);
          break;

        default:
      }
    });
  };

  deleteTeam = () => {
    // var token = cookies.get("webtoken");
    swal({
      title: "Are you sure?",
      text:
        "Once deleted, you will not be able to recover team event and team data. Please create a backup of data",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        var requestOptions = {
          method: "GET",
          redirect: "follow",
        };
        fetch(
          `${process.env.REACT_APP_BACKEND_URL}/deleteTeam?team_id=${this.state.selected_team}&token=${token}`,
          requestOptions
        )
          .then((response) => response.json())
          .then((result) => {
            if (result.status) {
              swal("Deleted", {
                icon: "success",
              });
              window.location = "/";
            }
          })
          .catch((error) => console.log("error", error));
      }
    });
  };

  changeVisiblity = (team_type) => {
    if (team_type === "true") {
      var alert_text = `Once Team is Private calendar link is accessible by members of ${this.state.team_data.team_name} only`;
    } else {
      alert_text = `Once Team is Public calendar is accessible by anyone having its link`;
    }
    swal({
      title: "Are you sure?",
      text: alert_text,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        var requestOptions = {
          method: "GET",
          redirect: "follow",
        };
        fetch(
          `${process.env.REACT_APP_BACKEND_URL}/changeVisiblity?team_id=${this.state.selected_team}&token=${token}&team_type=${team_type}`,
          requestOptions
        )
          .then((response) => response.json())
          .then((result) => {
            if (result.status) {
              if (result.status) {
                swal("Change", {
                  icon: "success",
                });
                this.setState({
                  team_data: {
                    ...this.state.team_data,
                    private: team_type,
                  },
                });
              }
            }
          })
          .catch((error) => console.log("error", error));
      }
    });
  };

  componentDidMount(){
    this.fetchTeam();
  }
  render() {
    if (!(this.state.member_fetched === 1)) {
      this.fetchMembers();
    }
    if (!(this.state.fetched === 1)) {
      return <></>;
    } else {
      return (
        <>
          <div className="col-lg-2 mx-auto text-center pt-5 pt-md-2 mt-5 mt-md-2">
            <Dropdown
              placeholder="Select Team"
              fluid
              selection
              options={this.state.data}
              onChange={(e, data) => {
                this.setState({
                  team_member: [],
                  isAdmin: false,
                  team_data: {},
                  isCreator: false,
                  member_fetched: this.state.member_fetched * -1,
                  selected_team: data.value
                });
              }}
              style={{ fontSize: "1.12em" }}
            />
          </div>

          {this.state.selected_team ? (
            <div className="col-lg-4 mx-auto mt-2 shadow-lg p-3 mb-5 bg-white rounded" style={{ minHeight: "20vh" }} >
              {this.state.member_fetched === -1 ? (
                <Dimmer active style={{zIndex:"0"}}>
                  <Loader />
                </Dimmer>
              ) : (
                <>
                  {this.state.isCreator ? (
                    <>
                    <div className="text-right">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={this.edit_team}
                      >
                        <i className="fal fa-cog"></i> Team Setting
                      </button>
                      </div>
                      <label>Add Member</label>
                      <div className="container">
                        <Form name="control-hooks" onFinish={this.addUser}>
                          <Form.Item
                            name="email"
                            label="Email"
                            disabled={!(this.state.isCreator)}
                            rules={[{ required: true, type: "email" }]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            name="member_type"
                            label="Type"
                            rules={[{ required: true }]}
                          >
                            <Select placeholder="Select Member Type" allowClear>
                              <Option value="member">Member</Option>
                              <Option value="admin">Admin</Option>
                            </Select>
                          </Form.Item>
                          <Button
                            type="primary"
                            className="float-right"
                            htmlType="submit"
                          >
                            <i className="fal fa-user-plus"></i> Add User
                          </Button>
                        </Form>
                      </div>
                      <br />
                      <br />
                    </>
                  ) : <div className="text-center"><button onClick={()=>{this.ExitTeam()}} className="btn btn-danger">Exit Team</button></div>}

                  <center>
                    <b style={{ fontSize: "25px" }}>
                      {this.state.team_data.team_name}
                    </b>
                    <br />
                    <b>Member List</b>
                  </center>
                  <br />
                  {this.state.team_member.map((value, key) => (
                    <p
                      onClick={() => {
                        this.DeleteUser(value);
                      }}
                    >
                      {key + 1}.) {value.email}
                      <span
                        className="float-right"
                        style={{ textTransform: "capitalize" }}
                      >
                        {value.right}
                      </span>
                    </p>
                  ))}
                </>
              )}
              <br/>
              <br/>
              <br/>
              <br/>
            </div>
          ) : null}
        </>
      );
    }
  }
}

export default Team;
