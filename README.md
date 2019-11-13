# Firstbird Personio Slack bot

### Fork of [personio-slack-bot](https://github.com/fedebertolini/personio-slack-bot)
 adapted to our needs here at [Firstbird](https://www.firstbird.com/)

NodeJS / Express app that fetches today's events from [Personio](https://www.personio.de/) and posts a
summary to a [Slack](https://slack.com/) channel.

## Todo
- Add logging for requests
- Integrate [Giphy](https://giphy.com)
- Implement useful [slash commands](https://api.slack.com/interactivity/slash-commands)
- Add tests?
- Improve file structure

## Installation
First install the node dependencies:
`npm install` or `yarn install`.

Then create a `.env` file (you can use [.env.dist](https://github.com/scyhhe/personio-slack-bot/blob/master/.env.dist)
as an example). You need to add these environment variable definitions:
- `SLACK_HOOK_URL`: Slack's hook URL that will be used to post messages to Slack.
- `PERSONIO_CALENDARS`: List of calendar identifiers separated by comma. For each calendar id defined
in this list you need to add another two environment variable definitions:
  - `PERSONIO_URL_{CALENDAR_ID}`: Personio's _iCalendar_ link. You can get this link by going to the
 Personio's Calendar page, cliking the `ICAL` button, then changing the filters you want and finally
 copying the link.
  - `PERSONIO_MESSAGE_{CALENDAR_ID}`: When the events are posted to Slack, these are grouped by Calendar
 ID. This env variable defines the group's header.
- `IGNORE_LIST` (optional): comma separated list of employee names that should be ignored.

- `PORT` (optional): a port to be used to run the NodeJS server, defaults to `3000`.
## Usage
Run `npm run start`.

Or for local development use `npm run dev` to spawn a nodemon server with hot reloading.
Also very helpful for local development - [Using ngrok to develop locally for Slack](https://api.slack.com/tutorials/tunneling-with-ngrok)

## Example
`.env` file:
```
SLACK_HOOK_URL=https://hooks.slack.com/services/ABCDEF

PERSONIO_CALENDARS=VACATION

PERSONIO_URL_VACATION=https://my-company.personio.de/calendar/ical/123456/vacations/0/calendar.ics

PERSONIO_MESSAGE_VACATION=:palm_tree: *Vacation* :palm_tree:

PORT = 80
```

Slack message:
```

:palm_tree: *Vacation* :palm_tree:
- Federico Bertolini [1 November - 7 November]
- John Doe [3 November - 12 November]
```
