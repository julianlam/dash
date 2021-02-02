<html>
	<head>
		<link rel="preconnect" href="https://fonts.gstatic.com">
		<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet">
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/picnic">
		<style>
			body {
				font-family: 'Open Sans', sans-serif;
				margin: .6em;
				height: calc(600px - 1.2em);
				width: calc(800px - 1.2em);
				transform: rotate(270deg);
				position: absolute;
				top: 100px;
				left: -100px;
			}

			.flex {
				align-items: center;
			}

			.datetime {
				text-align: center;
			}

			.datetime h1 {
				font-weight: 600;
				font-size: 3em;
				text-align: center;
				padding: 0;
			}

			.datetime span {
				font-weight: 400;
				font-size: 1em;
			}

			.weather {
				text-align: center;
				background-color: #ccc;
			}
			.weather img {
				margin: 0 auto;
			}
			.weather p {
				margin-top: 0;
			}

			.full {
				background-color: #eee;
				margin-top: 0.6em;
			}
		</style>
	</head>
	<body>
		<div class="flex two">
			<div class="datetime">
				<h1>{datetime.timeLabel}</h1>
				<span>{datetime.dateLabel}</span>
			</div>
			<div class="weather">
				<img src="{weather.icon}" />
				<p>
					{weather.weatherText}
				</p>
				<p>
					{weather.feelsLike}
				</p>
			</div>
			<div class="full">
				<strong>Upcoming appointments</strong>
				<ul>
					{{{ each events }}}
						<li>
							<strong>{../summary}</strong><br />
							<small>{../text}</small>
						</li>
					{{{ end }}}
				</ul>
			</div>
		</div>
	</body>
</html>