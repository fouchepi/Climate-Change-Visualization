d3.select(window).on("resize", sizeChange);

var current_year = 1800;
var current_season = "spring"
var text_year = "Average Temperature in ";

var lowColor = '#a39bff'
var highColor = '#f26a52'

var dict_color = {"spring":["#fff87f","#59b200"], "summer":["#ffc700","#a80000"], "fall":["#9ff2a1","#00b238"], "winter":["#7fc3ff","#0037ff"]};

var width = $("#mapContainer").width();
var height = $("#mapContainer").height();

var moving = false;
var myTimer;

d3.select("#myRange")
.property("value", current_year);

/*d3.selectAll("input[name='season']")
.property("checked", (d,i) => i === 0);*/

d3.select("#h2_year").text(current_year + " - " + current_season);

//Define map projection
var projection = d3.geoMercator()
.center([13,40])
.scale(135);

//Define path generator
var path = d3.geoPath()
.projection(projection);

//Create SVG element
var svg = d3.select("#mapContainer")
	.append("svg")
	.attr("id", "map")
	.attr("class", "rect")
	.attr("width", width)
	.attr("height", height)
	.append("g");

d3.csv("https://raw.githubusercontent.com/AlexandrePoussard/Climate-Change-Visualization/master/country_temp_season.csv", function(data) {
	let data_filt = data.filter(d => (d.year == current_year) && (d.season == current_season));
	let data_season = data.filter(d => d.season == current_season);
	let data_value = data_season.map(dic => parseFloat(dic.AverageTemperature));
	//let color = colorDomain(data_value, dict_color[current_season][0], dict_color[current_season][1]);
	let color = colorDomain(data_value, lowColor, highColor);

	d3.json("https://raw.githubusercontent.com/AlexandrePoussard/Climate-Change-Visualization/master/countries.geo.json", function(json) {
		
		svg
		.attr("class", "countries")
		.selectAll("path")
		.data(json.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("id", function(d) { return d.id; })
		.call(fillMap, color, data_filt)
		/*.on('mouseover', temp_mouseover(data, current_year, current_season))
  		.on('mouseout', temp_mouseout);*/

	});

	d3.select("#myRange").on("input", function() {
		current_year = this.value;
		updateMap(color, data, current_year, current_season);
	});

	d3.selectAll("input[name='season']").on("change", function() {
		current_season = this.value;
		updateMap(color, data, current_year, current_season);
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
	  			var b= d3.select("#myRange");
	  			var t = (+b.property("value") + 1) % (+b.property("max") + 1);
	  			//if (t == +b.property("max")) { clearInterval(myTimer); }
	  			if (t == 0) { t = +b.property("min"); }
	  			b.property("value", t);

				current_year = b.property("value");
				updateMap(color, data, current_year, current_season);

	  		}, 100);
	  		button.text("Pause");
	  	}
  	});
  });

//graph()