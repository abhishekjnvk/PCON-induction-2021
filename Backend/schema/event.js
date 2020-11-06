const mongoose = require('mongoose');

const EventModal = new mongoose.Schema({
    id: {
        type: Number,
    },
    title: {
        type: String,
    },
    start: {
        type: Object,
    },
    end: {
        type: Object,
    },
    allDay: {
        type: Boolean,
    },
});

const EventSchema = mongoose.model('event', EventModal);
module.exports = EventSchema;