# Kindle Dashboard Generator

![Sample of the dashboard running on a Kindle](./sample.jpg)

This is a simple node application that renders a dashboard-style page that is compatible with the Kindle 4 resolution (600x800). It is meant to be used with [Pascal W's Kindle Dashboard](https://github.com/pascalw/kindle-dash) script.

I use it to pull weather and event data and render it in a nice way. It exposes two routes:

* `/dash` which loads the page in the browser
* `/dash.png` which takes a screenshot of the page using Puppeteer, and serves it up as a greyscaled PNG

## Usage

1. Sign up for an account at OpenWeatherMap and generate an API key.
1. Create a service account [for your Google account](https://console.developers.google.com/apis/credentials/) &ndash; note down the email address assigned to this account.
1. Generate a key file for the new service account and save it to disk..
1. In Google Calendar, share your calendar with the service account's email address.
    * At this time I have not figured out a way to share the calendar of a [Google Family](https://families.google.com/families)

```
OPENWEATHERMAP_KEY=abcdef GOOGLE_CALENDAR_ID=me@gmail.com GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key-file.json node index.js
```

## Environment Variables

The various keys and credentials can be passed in via environment variable or as double-dashed arguments (e.g. `--OPENWEATHERMAP_KEY`), though the latter is not tested.

The following variables are used:

* `OPENWEATHERMAP_KEY` &ndash; An API key (either free or paid) from [OpenWeatherMap](https://openweathermap.org)
* `GOOGLE_CALENDAR_ID` &dash; A single calendar ID, or a comma-separated list of calendar IDs. You can find calendar IDs in each calendar's settings page on [Google Calendar](https://developers.google.com/calendar/quickstart/nodejs)
* `GOOGLE_APPLICATION_CREDENTIALS` &ndash; The path to the service account key file (generated earlier), on the local disk

## Credits

This project is built upon the following projects:

* Templating engine: [Benchpress.js](https://github.com/benchpressjs/benchpressjs)
* CSS Framework: [Picnic CSS](https://picnicss.com/)
* Screenshot tool: [Puppeteer](https://developers.google.com/web/tools/puppeteer/)
* Weather API: [OpenWeatherMap](https://openweathermap.org)
* Calendar API: [Google Calendar](https://developers.google.com/calendar/quickstart/nodejs)

Apologies if I have omitted any (especially subdependencies!)