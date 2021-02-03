# Kindle Dashboard Generator

[Sample of the dashbaord running on a Kindle](./sample.jpg)

This is a simple node application that renders a dashboard-style page that is compatible with the Kindle 4 resolution (600x800). It is meant to be used with [Pascal W's Kindle Dashboard](https://github.com/pascalw/kindle-dash) script.

I use it to pull weather and event data and render it in a nice way. It exposes two routes:

* `/dash` which loads the page in the browser
* `/dash.png` which takes a screenshot of the page using Puppeteer, and serves it up as a greyscaled PNG

## Usage

```
OPENWEATHERMAP_KEY=abcdef GOOGLE_CALENDAR_ID=me@gmail.com GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key-file.json node index.js
```

## Credits

This project is built upon the following projects:

* Templating engine: [Benchpress.js](https://github.com/benchpressjs/benchpressjs)
* CSS Framework: [Picnic CSS](https://picnicss.com/)
* Screenshot tool: [Puppeteer](https://developers.google.com/web/tools/puppeteer/)
* Weather API: [OpenWeatherMap](https://openweathermap.org)
* Calendar API: [Google Calendar](https://developers.google.com/calendar/quickstart/nodejs)

Apologies if I have omitted any (especially subdependencies!)