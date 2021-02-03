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

			.flex > div > div {
				padding: 0.6em;
			}

			.weather {
				text-align: center;
				background-color: #ccc;
			}
			.weather .forecast {
				font-size: .9em;
			}
			.weather .feelslike {
				font-weight: 600;
			}
			.weather img {
				margin: 0 auto;
			}
			.weather p {
				margin-top: 0;
			}

			.events ul {
				padding: 0;
			}
			.events li {
				list-style-type: none;
				overflow: hidden;
				text-overflow: ellipsis;
				margin-bottom: .6em;
			}
			.events .location {
				white-space: nowrap;
			}
		</style>
	</head>
	<body>
		<div class="flex two">
			<div>
				<div class="weather">
					<img src="{weather.icon}" />
					<p class="forecast">
						{weather.weatherText}
					</p>
					<p class="feelslike">
						{weather.feelsLike}
					</p>
				</div>
			</div>
			<div>
				<div class="events">
					<strong>Upcoming appointments</strong>
					<ul>
						{{{ each events }}}
							<li>
								<strong>{../summary}</strong><br />
								<small>{../text}</small><br />
								<small class="location">{../location}</small>
							</li>
						{{{ end }}}
					</ul>
				</div>
			</div>
		</div>
	</body>
</html>