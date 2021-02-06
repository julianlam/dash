const path = require('path');
const util = require('util');
let { execFile } = require('child_process');
execFile = util.promisify(execFile);
const request = require('request-promise-native');
const fs = require('fs');
const fsPromises = fs.promises;
const puppeteer = require('puppeteer');
const pngjs = require('pngjs').PNG;
const LRU = require('lru-cache');
const { google } = require('googleapis');

const nconf = require('nconf');
nconf.argv().env();

const express = require('express');
const app = express();
const benchpress = require('benchpressjs');

const viewsDir = path.join(__dirname, 'templates');

// Sanity checks
const required = ['OPENWEATHERMAP_KEY', 'GOOGLE_CALENDAR_ID', 'GOOGLE_APPLICATION_CREDENTIALS'];
const checkRequired = (prop) => {
	const ok = !!nconf.get(prop);
	if (!ok) {
		process.stdout.write(`Environment variable ${prop} not found.\n`)
	}

	return ok;
}
if (!required.every(checkRequired)) {
	process.stdout.write('Some required environment variables are not set. Aborting.\n');
	process.exit(1);
}

// Precompile templates
['dash'].forEach(async (tpl) => {
	const template = await fsPromises.readFile(path.join(viewsDir, `${tpl}.tpl`));
	const precompiled = await benchpress.precompile(template.toString(), { filename: `${tpl}.tpl` });
	await fsPromises.writeFile(path.join(viewsDir, `${tpl}.jst`), precompiled);
})

app.engine('jst', benchpress.__express);
app.set('view engine', 'jst');
app.set('views', viewsDir);

// Cache results for 15 minutes
const cache = new LRU({
	maxAge: 1000 * 60 * 15,
});

const auth = new google.auth.GoogleAuth({
	keyFile: nconf.get('GOOGLE_APPLICATION_CREDENTIALS'),
	scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
});
const calendar = google.calendar({version: 'v3', auth});
const getEvents = util.promisify(calendar.events.list.bind(calendar.events));

const formatTimeDate = (date) => {
	date = date || new Date();
	let minutes = date.getMinutes();
	let hours = date.getHours();
	[minutes, hours] = [minutes, hours].map(num => num < 10 ? '0'.concat(num) : num);
	const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	return {
		time: `${hours}:${minutes}`,
		date: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`,
	};
}

app.get('/dash', async (req, res) => {
	const now = new Date();

	// Date
	let dateString = formatTimeDate(now).date.split(' ');
	const date = {
		day: dateString[0],
		month: dateString[1],
	};

	// Weather
	let weatherData;
	if (cache.has('weather')) {
		weatherData = cache.get('weather');
	} else {
		const lon = nconf.get('LON');
		const lat = nconf.get('LAT');
		weatherData = await request.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&cnt=1&units=metric&appid=${nconf.get('OPENWEATHERMAP_KEY')}`, {
			json: true,
		});
		cache.set('weather', weatherData);
	}

	const weather = {};

	try {
		weather.icon = 'http://openweathermap.org/img/wn/' + weatherData.daily[0].weather[0].icon + '@2x.png';
		weather.label = weatherData.daily[0].weather[0].description;
		weather.current = `${Math.round(weatherData.current.temp)}°C`;
		weather.feels_like = `${Math.round(weatherData.current.feels_like)}°C`;
		weather.high = `${Math.round(weatherData.daily[0].temp.max)}°C`;
		weather.low = `${Math.round(weatherData.daily[0].temp.min)}°C`;
	} catch (err) {
		weather.icon = 'http://openweathermap.org/img/wn/03d@2x.png'; // fall back to scattered clouds
	}

	// Calendar
	let events;
	if (cache.has('events')) {
		events = cache.get('events');
	} else {
		const calendarIds = nconf.get('GOOGLE_CALENDAR_ID').split(',');
		events = (await Promise.all(calendarIds.map(async (id) => {
			try {
				const response = (await getEvents({
					calendarId: id,
					timeMin: (new Date()).toISOString(),
					maxResults: 10,
					singleEvents: true,
					orderBy: 'startTime',
				})).data.items;

				return response.map((item) => ({
					summary: item.summary,
					location: item.location,
					start: new Date(item.start.dateTime),
					end: new Date(item.end.dateTime),
				})).map((item) => {
					const formatted = formatTimeDate(item.start);
					length = (item.end - item.start) / 1000 / 60;	// minutes
					length = `${length} minutes`;	// TODO: handle hours
					item.text = `${formatted.date} – ${formatted.time} (${length})`

					return item;
				});
			} catch (e) {
				return [];
			}
		}))).flat().sort((a, b) => a.start - b.start).filter((event, idx, all) => {
			if (idx > 0) {
				const previous = all[idx-1];
				if (event.summary === previous.summary && event.start.getTime() === previous.start.getTime()) {
					return false;
				}
			}

			return true;
		});

		// 10 events is enough (overflows otherwise)
		if (events.length > 10) {
			events.length = 10;
		}

		cache.set('events', events);
	}

	res.render('dash', { date, weather, events });
});

app.get('/dash.png', async (req, res) => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	await page.setViewport({
		width: 600,
		height: 800,
	});
	await page.goto('http://localhost:3000/dash');
	await page.screenshot({path: 'dash.png'});
	await browser.close();

	await fs.createReadStream(path.join(__dirname, 'dash.png')).pipe(new pngjs({ colorType: 0 }).on('parsed', function () {
		this.pack().pipe(res);
	}));
});

app.listen(3000);