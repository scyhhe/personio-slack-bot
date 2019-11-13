const _ = require('lodash');
const format = require('date-fns/format');
const { IncomingWebhook } = require('@slack/webhook');

const SLACK_HOOK_URL = process.env.SLACK_HOOK_URL;

exports.sendPersonioEvents = (day, events) => {
    const message = getEventsMessage(events);
    const header = `\n <!here> \n *${format(day, 'dddd Do of MMMM')}* \n`;
    const fullMessage = header + message;

    console.log(fullMessage);

    if (!SLACK_HOOK_URL) {
        console.log("No SLACK_HOOK_URL provided!");
        return "In order to send messages to slack, please add the SLACK_HOOK_URL to your .env file"
    }
    sendSlackMessage(fullMessage);
};

const getEventsMessage = events => {
    if (!events.length) {
        return "No vacations for selected date in Personio's calendar. Get back to work! :whip: \n";
    }
    const eventGroups = _.groupBy(events, 'calendarId');

    return Object.keys(eventGroups).reduce((message, calendarId) => {
        const groupTitle = getEventTypeMessage(calendarId);
        if (!groupTitle) {
            return message;
        }
        const people = eventGroups[calendarId]
            .map(event => {
                if (event.start.getTime() === event.end.getTime()) {
                    return `- ${event.name}`;
                }
                return `- ${event.name} [${formatDate(event.start)} - ${formatDate(event.end)}]`;
            })
            .join('\n');

        return `${message}${groupTitle}\n${people}\n\n`;
    }, '');
};

const formatDate = date => format(date, 'MMMM Do');

const sendSlackMessage = message => {
    const webhook = new IncomingWebhook(SLACK_HOOK_URL);
    const datepickerInitial = new Date().toISOString().slice(0, 10);
    (async () => {
        await webhook.send({
            text: "Hey! Here is your daily vacation reminder :beach_with_umbrella:",
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: message
                    },
                    accessory: {
                        type: "image",
                        image_url: "https://api.slack.com/img/blocks/bkb_template_images/notifications.png",
                        alt_text: "calendar thumbnail"
                    }
                },
                {
                    "type": "divider"
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Pick a date to see who is on vacation"
                    },
                    "accessory": {
                        "type": "datepicker",
                        "initial_date": datepickerInitial,
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select a date",
                            "emoji": true
                        }
                    }
                },
            ]
        })
    })();
};

const getEventTypeMessage = calendarId => process.env[`PERSONIO_MESSAGE_${calendarId}`];