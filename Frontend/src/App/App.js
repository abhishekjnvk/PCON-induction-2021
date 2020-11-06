import React from 'react'
import { Calendar, Views, momentLocalizer } from 'react-big-calendar'
import "react-big-calendar/lib/css/react-big-calendar.css"
import "../style.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import moment from "moment"
import swal from 'sweetalert';

class Selectable extends React.Component {
    constructor(...args) {
        super(...args)
        this.state = { events: [], fetched: false }
    }

    handleSelect = async ({ start, end }) => {
        swal("Enter Event Name:", {
            content: "input",
        })
            .then((title) => {
                if (title)
                    this.setState({
                        events: [
                            ...this.state.events,
                            {
                                start,
                                end,
                                title,
                            },
                        ],
                    })
                console.log(this.state.events)
                var formdata = new FormData();

                var requestOptions = {
                    method: 'POST',
                    body: formdata,
                    redirect: 'follow'
                };
                var this_event = (this.state.events)[(this.state.events).length - 1]
                console.log(this_event)
                fetch(`http://localhost:8080/add_event?event=${JSON.stringify(this_event)}`, requestOptions)
                    .then(response => response.text())
                    .then(result => console.log(result))
                    .catch(error => console.log('error', error));
            });
    }

    getEvent = async () => {
        var requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };
        fetch("http://localhost:8080/", requestOptions)
            .then(response => response.json())
            .then(result => {
                var fucking_event = []
                result.forEach(aaa => {
                    aaa.start = new Date(aaa.start)
                    aaa.end = new Date(aaa.end)
                    fucking_event.push({
                            ...aaa
                        });
                });
                console.log(fucking_event)
                this.setState({
                    events: fucking_event,
                    fetched: true
                })
            }
            )
            .catch(error => console.log('error', error));
    }

    render() {
        if (!this.state.fetched) {
            this.getEvent()
        }
        const localizer = momentLocalizer(moment)
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
                    onSelectEvent={event => { swal(event.title); }}
                    onSelectSlot={this.handleSelect}
                />
            </div>
        )
    }
}


export default Selectable