function sizeChange() {
	d3.select("g").attr("transform", "scale(" + $("#mapContainer").width()/900 + ")");
	$("svg").height($("#divMap").width()*0.618);
}

function fillMap(svg, color, data) {
	svg.attr("fill", function(d) {
		let temp = data.find(x => x.country_id == d.id);
		return typeof temp === 'undefined' ? '#ccc' : color(temp.AverageTemperature)
	});
}

function colorDomain(data, lowColor, highColor) {
	
	var minVal = d3.min(data);
	var maxVal = d3.max(data);
	var color = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor, highColor]);

	return color
}


function updateMap(color, dt, current_year, current_season) {
	let data = dt.filter(d => (d.year == current_year) && (d.season == current_season));

	d3.selectAll("svg#map path").transition()
	//.delay(100)
	.call(fillMap, color, data);

	d3.select("#h2_year").text(current_year + " - " + current_season);	
}

function temp_mouseover(d, data, current_year, current_season) {
	d3.select("#h2_year").text(current_year + " - " + d.properties);
}

function temp_mouseout(d) {
	d3.select("#h2_year").text(current_year + " - " + current_season);
}

/*function graph() {
	var graph_svg = d3.select("#graph").append("svg").attr("width", "960").attr("height", "500"),
	margin = {top: 20, right: 20, bottom: 30, left: 50},
	width = +graph_svg.attr("width") - margin.left - margin.right,
	height = +graph_svg.attr("height") - margin.top - margin.bottom,
	g = graph_svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var parseTime = d3.timeParse("%Y");

	var x = d3.scaleTime()
	.rangeRound([0, width]);

	var y = d3.scaleLinear()
	.rangeRound([height, 0]);

	var line = d3.line()
	.x(function(d) { return x(d.date); })
	.y(function(d) { return y(d.close); });

	d3.csv("global_temp_season2.csv", function(d) {
		d.date = parseTime(d.year);
		d.close = +d.LandAverageTemperature;
		return d;
	}, function(error, data) {
		if (error) throw error;
		data = data.filter(d => d.season == "winter")
		console.log(data)
		x.domain(d3.extent(data, function(d) { return d.date; }));
		y.domain(d3.extent(data, function(d) { return d.close; }));

		g.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))
		.select(".domain")
		.remove();

		g.append("g")
		.call(d3.axisLeft(y))
		.append("text")
		.attr("fill", "#000")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "0.71em")
		.attr("text-anchor", "end")
		.text("LandAverageTemperature(Celsius)");

		g.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.attr("d", line);
	});
}*/