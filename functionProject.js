function sizeChange() {
	d3.select("g").attr("transform", "scale(" + $("#mapContainer").width()/900 + ")");
	$("svg").height($("#mapContainer").width());
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
	.call(fillMap, color, data);

	d3.select("#h2_year").text(current_year + " - " + current_season);
}

function graph(graph_svg, current_season, current_year) {
	// Set the dimensions of the canvas / graph

	//d3.selectAll("svg > *").remove();
	graph_svg.text('');

	console.log(graph_svg.style("width"))
	console.log(graph_svg.style("height"))
	console.log(current_season);
	console.log(current_year);

	var margin = {top: 15, right: 15, bottom: 15, left: 20};
	var width =  parseFloat(graph_svg.style("width")) - margin.left - margin.right;
	var height = parseFloat(graph_svg.style("height")) + margin.top + margin.bottom;

	// Parse the date / time
	var parseDate = d3.timeParse("%Y");

	// Set the ranges
	var x = d3.scaleTime().range([0, width]);  
	var y = d3.scaleLinear().range([height, 0]);

	// Define the line
	var templine = d3.line()    
	    .x(function(d) { return x(d.year); })
	    .y(function(d) { return y(d.LandAverageTemperature); });

	// Get the data
	d3.csv("https://raw.githubusercontent.com/AlexandrePoussard/Climate-Change-Visualization/master/data/global_temp_season.csv", function(error, data) {
	    
	    data = data.filter(d => (d.year >= 1850));

	    data.forEach(function(d) {
	        d.year = parseDate(d.year);
	        d.LandAverageTemperature = +d.LandAverageTemperature;
	    });

	    // Scale the range of the data
	    x.domain(d3.extent(data, function(d) { return d.year; }));
	    y.domain([0, d3.max(data, function(d) { return d.LandAverageTemperature; })]);

	    // Nest the entries by symbol
	    var dataNest = d3.nest()
	        .key(function(d) {return d.season;})
	        .entries(data);


	    // Loop through each symbol / key
	    dataNest.forEach(function(d) { 

	        graph_svg
	        	.append("path")
	            .attr("class", "line")
	            .attr("id", "path_graph")
	            .style("stroke", function() {
					switch(d.key) {
						case "spring":
							return d.color = "#01DF01";
							break;
						case "summer":
							return d.color = "#FF0000";
							break;
						case "fall":
							return d.color = "#FFBF00";
							break;
						case "winter":
							return d.color = "#0000FF";
							break;
					}
				})
	            .attr("d", templine(d.values))
	            .attr("transform", "translate(" + margin.left + "," + 0 + ")");

	    });

		/*var curtain = graph_svg.append('rect')
			.attr('x', -1 * (width + margin.left))
			.attr('y', -1 * height)
			.attr('height', height)
			.attr('width', width)
			.attr('class', 'curtain')
			.attr('transform', 'rotate(180)')
			.style('fill', '#ffffff');*/

		graph_svg.append('line')
			.attr('stroke', '#333')
			.attr('stroke-width', 0)
			.attr('class', 'guide')
			.attr('x1', 1)
			.attr('y1', 1)
			.attr('x2', 1)
			.attr('y2', height)
			.attr("transform", "translate(" + margin.left + "," + 0 + ")");

	     // add the Y gridlines
	  	graph_svg.append("g")			
	      	.attr("class", "grid")
	      	.attr("transform", "translate(" + margin.left + ",0)")
	      	.call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))

	    // Add the X Axis
	    graph_svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + margin.left + "," + height + ")")
			.call(d3.axisBottom(x));

	    // Add the Y Axis
	    graph_svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + margin.left + ",0)")
			.call(d3.axisLeft(y));

	});

}