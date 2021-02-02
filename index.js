const path = require('path');
const util = require('util');
let { execFile } = require('child_process');
execFile = util.promisify(execFile);
const request = require('request-promise-native');
const fs = require('fs');
const fsPromises = fs.promises;
const puppeteer = require('puppeteer');
const PngCrush = require('pngcrush');

const nconf = require('nconf');
nconf.argv().env();

const express = require('express');
const app = express();
const benchpress = require('benchpressjs');

const viewsDir = path.join(__dirname, 'templates');

// Sanity checks
const required = ['OPENWEATHERMAP_KEY'];
if (!required.every(prop => !!nconf.get(prop))) {
	process.stdout.write('Some required environment variables are not set. Check index.js.\n');
	process.exit(1);
}

// Precompile templates
['dash'].forEach(async (tpl) => {
	const template = await fsPromises.readFile(path.join(viewsDir, `${tpl}.tpl`));
	const precompiled = await benchpress.precompile(template.toString(), { filename: `${tpl}.tpl` });
	await fsPromises.writeFile(path.join(viewsDir, `${tpl}.js`), precompiled);
})

app.engine('tpl', function (filepath, data, next) {
	filepath = filepath.replace(/\.tpl$/, '.js');
	benchpress.__express(filepath, data, next);
});
app.set('view engine', 'tpl');
app.set('views', viewsDir);

app.get('/dash', async (req, res) => {
	// Time & Date
	const now = new Date();
	let minutes = now.getMinutes();
	if (minutes < 10) {
		minutes = '0'.concat(minutes);
	}
	const timeLabel = `${now.getHours()}:${minutes}`;

	// Weather
	const weather = await request.get('http://api.openweathermap.org/data/2.5/forecast/daily?q=Toronto&units=metric&cnt=1&appid=' + nconf.get('OPENWEATHERMAP_KEY'), {
		json: true,
	});

	let iconUrl;
	let weatherText;

	try {
		iconUrl = 'http://openweathermap.org/img/wn/' + weather.list[0].weather[0].icon + '@2x.png';
		weatherText = 'Today, expect ' + weather.list[0].weather[0].description + ', a high of ' + weather.list[0].temp.max + '°C and a low of ' + weather.list[0].temp.min + '°C';
	} catch (e) {
		iconUrl = 'http://openweathermap.org/img/wn/03d@2x.png'; // fallback to scattered clouds
		weatherText = "Today, I couldn't get the weather for you :\\ (" + err.message + ')';
	}

	res.render('dash', {
		datetime: {
			label: timeLabel,
		},
		weather: {
			icon: iconUrl,
			label: weatherText,
		}
	});
});

app.get('/dash.png', async (req, res) => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	const grayscale = new PngCrush(['-c', '0']);

	await page.setViewport({
		width: 600,
		height: 800,
	});
	await page.goto('http://localhost:3000/dash');
	await page.screenshot({path: 'dash.png'});
	await browser.close();

	await fs.createReadStream(path.join(__dirname, 'dash.png')).pipe(grayscale).pipe(res);
});

app.listen(3000);