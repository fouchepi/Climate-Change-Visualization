d3.select(window).on("resize", sizeChange);

var current_year = 1850;
var current_season = "spring"
var text_year = "Average Temperature in ";

var lowColor = '#a39bff'
var highColor = '#f26a52'

var dict_color = {"spring":["#fff87f","#59b200"], "summer":["#ffc700","#a80000"], "fall":["#9ff2a1","#00b238"], "winter":["#7fc3ff","#0037ff"]};

var width = $("#mapContainer").width();
var height = $("#mapContainer").height();
var centered;

var moving = false;
var myTimer;

var div = d3.select("#mapContainer")
			.append("div")	
		    .attr("class", "tooltip")				
		    .style("opacity", 0);

d3.select("#myRange")
	.property("value", current_year);

/*d3.selectAll("input[name='season']")
.property("checked", (d,i) => i === 0);*/

d3.select("#h2_year").text(current_year + " - " + current_season);

//Define map projection
var projection = d3.geoMercator()
.center([25,78])
.scale(130);

//Define path generator
var path = d3.geoPath()
.projection(projection);

//Create SVG element
var svg = d3.select("#mapContainer")
	.append("svg")
	.attr("id", "map")
	.attr("width", width)
	.attr("height", height);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", zoom);

var g = svg.append("g");


var plot1Div = document.getElementById("plot1");
var ww_svg = d3.select(plot1Div).append('svg').attr('id', 'svg_plot1'),
	margin = {top: 15, right: 15, bottom: 15, left: 35},
	width_ww = plot1Div.clientWidth - margin.left - margin.right,
    height_ww = plot1Div.clientHeight - margin.top - margin.bottom;

// var ww_svg = d3.select("#plot1")
// 	.append("svg")
// 	.attr("id", "ww_graph")
// 	.attr("width", width_ww)
// 	.attr("height", height_ww)
// 	.append("g");

var g2 = ww_svg.append("g")
	.attr("id", "ww_graph")
	// .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

graph(g2, current_season, current_year);

d3.csv("https://raw.githubusercontent.com/AlexandrePoussard/Climate-Change-Visualization/master/data/country_temp_season.csv", function(data) {
	let data_filt = data.filter(d => (d.year == current_year) && (d.season == current_season));
	let data_season = data.filter(d => d.season == current_season);
	let data_value = data.map(dic => parseFloat(dic.AverageTemperature));
	//let color = colorDomain(data_value, dict_color[current_season][0], dict_color[current_season][1]);
	let color = colorDomain(data_value, lowColor, highColor);

	d3.json("https://raw.githubusercontent.com/AlexandrePoussard/Climate-Change-Visualization/master/data/countries_custom.geo.json", function(json) {
		
		g.append('g')
		.attr("class", "countries")
		.selectAll("path")
		.data(json.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("id", function(d) { return d.id; })
		.call(fillMap, color, data_filt)
		.on("click", zoom)
		.on('mouseover', function(d) {
			let dt = data.filter(d => (d.year == current_year) && (d.season == current_season));
			let dt_temp = dt.find(x => x.country_id == d.id);
			let temp = '';
			if (typeof dt_temp != 'undefined' && dt_temp.AverageTemperature != '') { 
				temp = "<br>" + dt_temp.AverageTemperature + " &degC";
			}
	    	div.transition()		
			.duration(200)		
			.style("opacity", .9);		
		    div.html(d.properties.name + temp)
			.style("left", (d3.event.pageX) + "px")		
			.style("top", (d3.event.pageY - 28) + "px");		
			})
		.on("mouseout", function(d) {
			div.transition()		
			.duration(500)		
			.style("opacity", 0);
		});
		linearLegend(color);
	});

	d3.select("#myRange").on("input", function() {
		current_year = this.value;
		updateMap(color, data, current_year, current_season);
		graph(g2, current_season, current_year)
	});

	d3.selectAll("input[name='season']").on("change", function() {
		current_season = this.value;
		updateMap(color, data, current_year, current_season);
		//graph(ww_svg, current_season, current_year)
	});

  	d3.select("#play").on("click", function() {
  		var button = d3.select(this);
		if (button.text() == "Pause") {
			moving = false;
			clearInterval(myTimer);
      		button.text("Play");
  		} else {
  			clearInterval (myTimer);
	  		myTimer = setInterval (function() {
	  			moving = true;
	  			var b = d3.select("#myRange");
	  			var t = (+b.property("value") + 1) % (+b.property("max") + 1);
	  			//if (t == +b.property("max")) { clearInterval(myTimer); }
	  			if (t == 0) { t = +b.property("min"); }
	  			b.property("value", t);

				current_year = b.property("value");
				updateMap(color, data, current_year, current_season);
				//graph(ww_svg, current_season, current_year)

	  		}, 100);
	  		button.text("Pause");
	  	}
  	});
});