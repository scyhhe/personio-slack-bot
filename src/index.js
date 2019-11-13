require('dotenv').config();
const personio = require('./personio');
const slack = require('./slack');

const date = require('date-fns');

const finalhandler = require('finalhandler');
const http = require('http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/events',  (req, res) => {
    const nextWeek = date.addWeeks(new Date(), 1);
    fetchPersonioEventsAndPostToSlack(nextWeek);

    res.statusCode = 200;
    res.end(`Vacations for ${nextWeek.toDateString()} posted to Slack`)
});

app.post('/events', (req, res) => {
    const payload = JSON.parse(req.body.payload);
    const selectedDate = getSelectedDate(payload);
    fetchPersonioEventsAndPostToSlack(selectedDate);

    res.status = 200;
    res.end(`Vacations for ${selectedDate} posted to Slack`);
});

app.post('/vacations', (req, res) => {
    // currently only /vacations is a valid slash command
    // TODO: add check if command is valid
    const command = req.body.command;
    const text = req.body.text;

    if (!text) {
        res.status = 400;
        res.end('Please provide a date or day to view vacations :slightly_smiling_face:')
    }

    const matched = matchTextToDay(text);

    Promise.all([personio.getEvents(matched)])
        .then(result => {
            const events = result[0];
            const message = slack.getEventsMessage(events, matched);
            res.status = 200;
            res.end(message);
        });
});

const server = http.createServer(function (req, res) {
    app(req, res, finalhandler(req, res))
});

server.listen(PORT);
console.log(`Server listening on port ${PORT}`);

const fetchPersonioEventsAndPostToSlack = date => {
    Promise.all([personio.getEvents(date)])
        .then(result => {
            const todayEvents = result[0];
            slack.sendPersonioEvents(date, todayEvents);
        })
        .catch(error => {
            console.log(error);
        });
};

const getSelectedDate = payload => {
    if (payload.type !== "block_actions") {
        console.log("action is not initiated from Block Kit");
        return "Only block interactions are supported at the moment."
    }

    return payload.actions[0].selected_date;
};

const matchTextToDay = day => {
    const today = new Date();
    switch (day) {
        case "today":
            console.log("matched today");
            return date.addDays(today, 0);
        case "tomorrow":
            console.log("matched tomorrow");
            return date.addDays(today, 1);
        default:
            return date.parse(day);
    }
};