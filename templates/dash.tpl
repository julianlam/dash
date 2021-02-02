<html>
	<head>
		<link rel="preconnect" href="https://fonts.gstatic.com">
		<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet">
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/picnic">
		<style>
			body {
				font-family: 'Open Sans', sans-serif;
				margin: .6em;
				height: 600px;
				width: 800px;
				transform: rotate(270deg);
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
				<ol>
					<li>Grocery run &ndash; Maybe fortinos, probably Food Basics. Always bananas.</li>
					<li>Doctor's appointment &ndash; ask about getting refill on medications.</li>
					<li>Work meeting</li>
				</ol>
			</div>
		</div>
	</body>
</html>