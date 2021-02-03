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
	// Time & Date
	const { time: timeLabel, date: dateLabel } = formatTimeDate();

	// Weather
	let weather;
	if (cache.has('weather')) {
		weather = cache.get('weather');
	} else {
		weather = await request.get(`http://api.openweathermap.org/data/2.5/forecast/daily?id=5911592&units=metric&cnt=1&appid=${nconf.get('OPENWEATHERMAP_KEY')}`, {
			json: true,
		});
		cache.set('weather', weather);
	}

	let iconUrl;
	let weatherText;
	let feelsLike = '';

	try {
		iconUrl = 'http://openweathermap.org/img/wn/' + weather.list[0].weather[0].icon + '@2x.png';
		weatherText = 'Today, expect ' + weather.list[0].weather[0].description + ', a high of ' + weather.list[0].temp.max + '°C and a low of ' + weather.list[0].temp.min + '°C';
		feelsLike = `It feels like ${Math.round(weather.list[0].feels_like.day)}°C outside.`;
	} catch (err) {
		iconUrl = 'http://openweathermap.org/img/wn/03d@2x.png'; // fallback to scattered clouds
		weatherText = "Today, I couldn't get the weather for you :\\ (" + err.message + ')';
	}

	// Calendar
	let events;
	if (cache.has('events')) {
		events = cache.get('events');
	} else {
		try {
			const response = (await getEvents({
				calendarId: nconf.get('GOOGLE_CALENDAR_ID'),
				timeMin: (new Date()).toISOString(),
				maxResults: 10,
				singleEvents: true,
				orderBy: 'startTime',
			})).data.items;

			events = response.map((item) => ({
				summary: item.summary,
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
			console.log(e);
			events = [];
		}

		cache.set('events', events);
	}

	res.render('dash', {
		datetime: {
			timeLabel,
			dateLabel,
		},
		weather: {
			icon: iconUrl,
			weatherText,
			feelsLike,
		},
		events
	});
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