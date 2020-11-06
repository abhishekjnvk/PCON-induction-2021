const express = require('express')
const app = express()
const port = 8080
const mongoose = require('mongoose');
var EventSchema = require('./schema/event');

app.get('/', async (req, res) => {
    EventSchema.find({}, function (err, fetched_event) {
        res.send(fetched_event);
    });
})

app.post('/add_event', async (req, res) => {
    var obj = JSON.parse(req.query.event)
    await EventSchema.create(obj);
    res.json({ response: "Success" });
})

app.post('/delete_event', async (req, res) => {

})


app.listen(port, () => {
    mongoose.connect('mongodb://localhost/mydb', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
    console.log('Database ready!')
    console.log('Server is listing at at => ' + port)
})