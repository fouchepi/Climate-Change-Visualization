function sizeChange() {
	d3.select("g").attr("transform", "scale(" + $("#mapContainer").width()/900 + ")");
	$("svg").height($("#mapContainer").width());
}

function fillMap(svg, color, color_diff, diffmode, data) {
	d3.select('#year').text('Year: ' + current_year);
	svg.attr("fill", function(d) {
		let temp = data.find(x => x.country_id == d.id);
		if (diffmode) {
			linearLegend(color_diff);
			return (typeof temp === 'undefined') || (temp.DiffTemp == '') ? '#ccc' : color_diff(temp.DiffTemp);
		} else if (!diffmode){
			linearLegend(color);
			return (typeof temp === 'undefined') || (temp.AverageTemperature == '') ? '#ccc' : color(temp.AverageTemperature);
		}
	});
}

function colorDomain(data, diffmode, lowColor, highColor) {
	var minVal = d3.min(data);
	var maxVal = d3.max(data);
	if (diffmode) { 
		minVal = -2;
		maxVal = 2;
	}
	//var color = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor, highColor]);
	var color = d3.scaleSequential(d3.interpolateRdYlBu).domain([maxVal,minVal]);
	return color;
}

function updateMap(color, color_diff, diffmode, dt, current_year, current_season) {
	let duration;
	if(diffmode) {duration = 600} else {duration = 150}
	let data = dt.filter(d => (d.year == current_year) && (d.season == current_season));
	d3.selectAll("svg#map path").transition().ease(d3.easeSin).duration(duration)
	.call(fillMap, color, color_diff, diffmode, data);
}

function zoom(d) {
	var x, y, k;
	var title = d3.select("#textcplot");
	if (d && centered !== d) {
		var centroid = path.centroid(d);
		x = centroid[0];
		y = centroid[1];
		k = 4;
		centered = d;
		title.text(d.properties.name + " Evolution")
		country_graph(g3, d.id, current_season, current_year);
	} else {
		x = width / 2;
		y = height / 2;
		k = 1;
		centered = null;
		title.text("Country Evolution (click on a country)");
		g3.text('');
	}

	g.selectAll("path")
		.classed("active", centered && function(d) { return d === centered; });

	g.transition()
		.duration(750)
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
		.style("stroke-width", 1.5 / k + "px");
}

function graph(graph_svg, current_season, current_year) {
	graph_svg.text('');

	var parseDate = d3.timeParse("%Y");
	var x = d3.scaleTime().range([0, width_ww]);  
	var y = d3.scaleLinear().range([height_ww, 0]);
	var templine = d3.line()    
	    .x(function(d) { return x(d.year); })
	    .y(function(d) { return y(d.LandAverageTemperature); });

	d3.csv("https://raw.githubusercontent.com/AlexandrePoussard/Climate-Change-Visualization/master/data/global_temp_season.csv", function(temper) {
	    data = temper.filter(d => (d.year >= 1850));

	    data.forEach(function(d) {
	        d.year = parseDate(d.year);
	        d.LandAverageTemperature = +d.LandAverageTemperature;
	    });

	    x.domain(d3.extent(data, function(d) { return d.year; }));
	    y.domain([0, d3.max(data, function(d) { return d.LandAverageTemperature+1; })]);

	    var dataNest = d3.nest()
	        .key(function(d) {return d.season;})
	        .entries(data);

	  	// Draw the 4 lines
	    dataNest.forEach(function(d) { 
  			graph_svg.append("path")
      			.datum(data)
      			.attr("fill", "none")
      			.attr("stroke", function() {
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
				.attr('class', 'paths')
      			.attr("stroke-linejoin", "round")
      			.attr("stroke-linecap", "round")
      			.attr("stroke-width", 1.5)
      			.attr("d", templine(d.values))
      			.attr("transform", "translate(" + margin.left + "," + 0 + ")");
	    });



	    // Draw x Axis
	    graph_svg.append("g")
	    	.attr("class", "axis")
  			.attr("transform", "translate(" + margin.left + "," + height_ww + ")")
  			.call(d3.axisBottom(x))
			.select(".domain");

  		// Draw y Axis
  		graph_svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + margin.left + "," + 0 + ")")
			.call(d3.axisLeft(y))
			.append("text")
		   	.attr("fill", "#000")
		   	.attr("transform", "rotate(-90)")
		   	.attr("y", 0)
		   	.attr("dy", "0.75em")
		   	.attr("text-anchor", "end")
		   	.attr("transform", "translate(" + margin.left + "," + 0 + ")")
		   	.text("(C)");
		
		// Draw the grid
	  	graph_svg.append("g")			
	      	.attr("class", "grid")
	      	.attr("transform", "translate(" + margin.left + ",0)")
	      	.call(d3.axisLeft(y).ticks(5).tickSize(-width_ww).tickFormat(""))

		// Curve Name
		// var season = graph_svg.selectAll(".paths")
  //     		.data(d)
  //   		.enter().append("g")
  //     		.attr("class", "city");

  // 		season.append("path")
  //     		.attr("class", "line")
  //     		.attr("d", function(d) { return line(d.values); })
  //     		.attr("data-legend",function(d) { return d.name})
  //     		.style("stroke", function(d) { return color(d.name); });

  // 		season.append("text")
  //     		.datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
  //     		.attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
  //     		.attr("x", 3)
  //     		.attr("dy", ".35em")
  //     		.text(function(d) { return d.name; });
		

		/*var curtain = graph_svg.append('rect')
			.attr('x', -1 * (width + margin.left))
			.attr('y', -1 * height)
			.attr('height', height)
			.attr('width', width)
			.attr('class', 'curtain')
			.attr('transform', 'rotate(180)')
			.style('fill', '#ffffff');*/

		// graph_svg.append('line')
		// 	.attr('stroke', '#333')
		// 	.attr('stroke-width', 0)
		// 	.attr('class', 'guide')
		// 	.attr('x1', 1)
		// 	.attr('y1', 1)
		// 	.attr('x2', 1)
		// 	.attr('y2', height)
		// 	.attr("transform", "translate(" + margin.left + "," + 0 + ")");
	});
}

function linearLegend(color) {
  	// add a legend
    var w = 120, h = 200;

    var key = d3.select("#leg").text('');

    var legend = key.append("defs")
      .append("svg:linearGradient")
      .attr("id", "gradient")
      .attr("x1", "100%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");

    legend.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", d3.interpolateRdYlBu(0))
      .attr("stop-opacity", 1);

    legend.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", d3.interpolateRdYlBu(0.5))
      .attr("stop-opacity", 1);
      
    legend.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", d3.interpolateRdYlBu(1))
      .attr("stop-opacity", 1);

    key.append("rect")
      .attr("width", w - 100)
      .attr("height", h)
      .style("fill", "url(#gradient)")
      .attr("transform", "translate(0,10)");

    var y = d3.scaleLinear()
      .range([h, 0])
      .domain([color.domain()[1], color.domain()[0]]);

    var yAxis = d3.axisRight(y).tickFormat(d => d + " C");

    key.append("g")
      .attr("class", "yaxis")
      .attr("transform", "translate(21,10)")
      .call(yAxis);
}

function country_graph(country_svg, country, current_season, current_year) {
	country_svg.text('');
	var parseDate = d3.timeParse("%Y");
	var x = d3.scaleTime().range([0, width_country]);  
	var y = d3.scaleLinear().range([height_country, 0]);
	var templine = d3.line()    
	    .x(function(d) { return x(d.year); })
	    .y(function(d) { return y(d.AverageTemperature); });

	d3.csv("https://raw.githubusercontent.com/AlexandrePoussard/Climate-Change-Visualization/master/data/country_temp_season.csv", function(temper) {
	    data = temper.filter(d => (d.year >= 1850));
	    data = data.filter(d => (d.country_id == country));

	    data.forEach(function(d) {
	        d.year = parseDate(d.year);
	        d.AverageTemperature = +d.AverageTemperature;
	    });

	    x.domain(d3.extent(data, function(d) { return d.year; }));
	    y.domain(d3.extent(data, function(d) { return d.AverageTemperature+1; }));

	    var dataNest = d3.nest()
	        .key(function(d) {return d.season;})
	        .entries(data);

	  	// Draw the 4 lines
	    dataNest.forEach(function(d) { 
  			country_svg.append("path")
      			.datum(data)
      			.attr("fill", "none")
      			.attr("stroke", function() {
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
				.attr('class', 'paths')
      			.attr("stroke-linejoin", "round")
      			.attr("stroke-linecap", "round")
      			.attr("stroke-width", 1.5)
      			.attr("d", templine(d.values))
      			.attr("transform", "translate(" + margin.left + "," + 0 + ")");
	    });

	    // Draw x Axis
	    country_svg.append("g")
	    	.attr("class", "axis")
  			.attr("transform", "translate(" + margin.left + "," + height_country + ")")
  			.call(d3.axisBottom(x))
			.select(".domain");

  		// Draw y Axis
  		country_svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + margin.left + "," + 0 + ")")
			.call(d3.axisLeft(y))
			.append("text")
		   	.attr("fill", "#000")
		   	.attr("transform", "rotate(-90)")
		   	.attr("y", 0)
		   	.attr("dy", "0.75em")
		   	.attr("text-anchor", "end")
		   	.attr("transform", "translate(" + margin.left + "," + 0 + ")")
		   	.text("(C)");
		
		// Draw the grid
	  	country_svg.append("g")			
	      	.attr("class", "grid")
	      	.attr("transform", "translate(" + margin.left + ",0)")
	      	.call(d3.axisLeft(y).ticks(10).tickSize(-width_country).tickFormat(""));

	// 	// Curve Name
	// 	var season = graph_svg.selectAll(".paths")
 //      		.data(d.)
 //    		.enter().append("g")
 //      		.attr("class", "city");

 //  		season.append("path")
 //      		.attr("class", "line")
 //      		.attr("d", function(d) { return line(d.values); })
 //      		.attr("data-legend",function(d) { return d.name})
 //      		.style("stroke", function(d) { return color(d.name); });

 //  		season.append("text")
 //      		.datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
 //      		.attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
 //      		.attr("x", 3)
 //      		.attr("dy", ".35em")
 //      		.text(function(d) { return d.name; });
		

		/*var curtain = graph_svg.append('rect')
			.attr('x', -1 * (width + margin.left))
			.attr('y', -1 * height)
			.attr('height', height)
			.attr('width', width)
			.attr('class', 'curtain')
			.attr('transform', 'rotate(180)')
			.style('fill', '#ffffff');*/

		// graph_svg.append('line')
		// 	.attr('stroke', '#333')
		// 	.attr('stroke-width', 0)
		// 	.attr('class', 'guide')
		// 	.attr('x1', 1)
		// 	.attr('y1', 1)
		// 	.attr('x2', 1)
		// 	.attr('y2', height)
		// 	.attr("transform", "translate(" + margin.left + "," + 0 + ")");
	});
}