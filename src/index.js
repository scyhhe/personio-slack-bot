require('dotenv').config();
const personio = require('./personio');
const slack = require('./slack');

const addWeeks = require('date-fns/add_weeks');

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
    const nextWeek = addWeeks(new Date(), 1);
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
