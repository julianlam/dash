<html>
	<head>
		<link rel="preconnect" href="https://fonts.gstatic.com">
		<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet">
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/picnic">
		<style>
			body {
				font-family: 'Open Sans', sans-serif;
			}

			body > .flex {
				align-items: start;
				margin: .6em;
				height: calc(600px - 1.2em);
				width: calc(800px - 1.2em);
				overflow: hidden;
				transform: rotate(270deg);
				position: absolute;
				top: 100px;
				left: -100px;
			}

			body > .flex > div:first-child {
				padding-left: 0;
			}

			.weather > div > div {
				min-height: 100px;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-direction: column;
			}
			.weather .square span {
				font-weight: 600;
				font-size: 2em;
			}
			.weather .square small {
				text-transform: uppercase;
				font-weight: 600;
			}
			.weather .icon {
				background-color: #aaa;
			}
			.weather .current {
				background-color: #ccc;
			}
			.weather .feels_like {
				background-color: #333;
				color: #fff;
			}
			.weather .high {
				background-color: #eee;
			}
			.weather .low {
				background-color: #999;
			}
			.weather .date {
				background-color: #666;
				color: #fff;
			}

			.events .header, .news .header, .alert .header {
				border-bottom: 1px dashed #666;
				display: block;
				padding-bottom: 0.3em;
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
			.events li[data-allday="1"] {
				background: #666;
				color: #fff;
				padding: 0.6em;
			}
			.events .location, .events strong {
				white-space: nowrap;
			}

			.news ul {
				padding: 0;
			}
			.news li {
				list-style-type: none;
				font-size: 1em;
				margin-bottom: 1em
			}

			.alert {
				background: #333;
				color: #fff;
				padding: 0.6em;
				margin-bottom: 0.6em;
			}
			.alert .header {
				text-transform: uppercase;
			}
			.alert .header img {
				position: relative;
				top: 2px;
			}
			.alert p {
				white-space: pre-line;
				font-size: 0.9em;
				margin: 0;
			}

			.battery {
				float: right;
			}
		</style>
	</head>
	<body>
		<div class="flex two">
			<div>
				<div class="flex three weather">
					<div>
						<div class="icon">
							<img src="{weather.icon}" />
						</div>
					</div>
					<div>
						<div class="square date">
							<span>{date.day}</span>
							<small>{date.month}</small>
						</div>
					</div>
					<div>
						<div class="square current">
							<span>{weather.current}</span>
							<small>current</small>
						</div>
					</div>
					<div>
						<div class="square feels_like">
							<span>{weather.feels_like}</span>
							<small>feels like</small>
						</div>
					</div>
					<div>
						<div class="square high">
							<span>{weather.high}</span>
							<small>high</small>
						</div>
					</div>
					<div>
						<div class="square low">
							<span>{weather.low}</span>
							<small>low</small>
						</div>
					</div>
				</div>
				{{{ if weather.alerts.length }}}
				{{{ each weather.alerts }}}
				<div class="alert">
					<strong class="header"><img src="/assets/alert-triangle.svg" /> {../event} advisory</strong>
					<p>{../description}</p>
				</div>
				{{{ end }}}
				{{{ end }}}
				<div class="news">
					<strong class="header">Headlines</strong>
					<ul>
						{{{ each news }}}
						<li>{@value}</li>
						{{{ end }}}
					</ul>
				</div>
			</div>
			<div>
				<div class="events">
					<span class="battery">{battery}</span>
					<strong class="header">Upcoming appointments</strong>
					<ul>
						{{{ each events }}}
							<li data-allday="{../allday}">
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