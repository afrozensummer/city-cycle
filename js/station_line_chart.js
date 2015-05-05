/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 1/28/15.
 */


//TODO: DO IT ! :) Look at agevis.js for a useful structure
StationVis = function(_parentElement, day_data, station_list) {
   	var stationvis = this;
    this.parentElement = _parentElement;
    this.data = day_data;
    this.station_list = station_list;
    
    this.margin = {top: 10, right: 0, bottom: 25, left: 25},
    this.width = parseInt(d3.select('#stations_chart').style('width'), 10) - this.margin.left - this.margin.right,
    this.height = 300 - this.margin.top - this.margin.bottom;

    d3.selectAll(window).on('resize', resize);
    function resize() {
        // update width
        console.log(stationvis)
        that.width = parseInt(d3.select('#stations_chart').style('width'), 10) - that.margin.left - that.margin.right;
        // reset x range
        console.log("hi")
        // d3.select("svg").remove();
        that.initVis();
    }

    this.initVis();
}

/**
 * Method that sets up the SVG and the variables
 */
StationVis.prototype.initVis = function(){


    var that = this; // read about the this

    this.svg = this.parentElement.append("svg") 
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    /*var legend = this.svg.selectAll('.legend')
        .data([": overall average"])
        .enter()
        .append('g')
        .attr('class', 'legend');

    legend.append('line')
        .attr("x1", this.width - 100)
        .attr("x2", this.width - 70)
        .attr("y1", 16)
        .attr("y2", 16)
        .style("stroke-dasharray", ("3, 3")) 
        .style("stroke", "black");

    legend.append('text')
        .attr('x', this.width - 70)
        .attr('y', 10)
        .attr("dy", ".71em")
        .text(function(d) { return d; });*/

    // creates axis and scales
    this.x = d3.time.scale()
        .range([0, this.width]);

    this.y = d3.scale.linear()
        .range([this.height, 0]);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom");

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left");

    this.line = d3.svg.line()
        .interpolate("monotone")
        .x(function(d) { return that.x(d.date); })
        .y(function(d) { return that.y(d.count); });

    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")

    this.svg.append("g")
        .attr("class", "y axis")
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Count Volume");

    // modify the data
    this.wrangleData();

    // call the update method
    this.updateVis();

    //remove first call
    this.svg.selectAll(".line").remove();
}

/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
StationVis.prototype.wrangleData= function() {

    // time interval in minutes
    //var total_time = 24
    console.log(this.data);
    var interval = 10;
    var starttime = d3.time.day(new Date(this.data[this.data.length-1]["starttime"]));

    var line_data = [];
    this.station_list.forEach(function(d) {
        var time_line = [];
        for(var i = 0; i <= 24; i ++) {
            time_line.push({
                date:new Date(starttime.getTime() + i*60*1000*60),
                count: 0
            });
        }
        line_data.push({name:d, bikers:time_line});
    });

    this.data.forEach( function(d,i) {
        bikes_starting_time = d3.time.minute.floor(new Date(d.starttime));
        if(bikes_starting_time >= starttime) {
            line_data.forEach( function (e,j) {
                if(e.name == d["start station name"]) {
                    var index = ((d3.time.hour.floor(bikes_starting_time).getTime() - starttime.getTime())/(60*60*1000));
                    e.bikers[index+1].count ++;
                }
            });
        }
    });
    this.displayData = line_data;
    console.log(this.displayData);
}

StationVis.prototype.change_day = function(data) {
    this.data = data;
    this.wrangleData();
    this.updateVis();
}

StationVis.prototype.change_stations = function(station_list) {
    this.station_list = station_list;
    this.wrangleData();
    this.updateVis();
}

/**
 * the drawing function - should use the D3 selection, enter, exit
 */
StationVis.prototype.updateVis = function() {
    
    var that = this;

    if(this.displayData.length > 0) {
    // updates scales
        this.x.domain([
            d3.min(this.displayData, function(c) { return d3.min(c.bikers, function(v) { return v.date; }); }),
            d3.max(this.displayData, function(c) { return d3.max(c.bikers, function(v) { return v.date; }); })
        ]);

        this.y.domain([
            d3.min(this.displayData, function(c) { return d3.min(c.bikers, function(v) { return v.count; }); }),
            d3.max(this.displayData, function(c) { return d3.max(c.bikers, function(v) { return v.count; }); })
        ]);
    }

    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis)
 
    var lines = that.svg.selectAll(".line")
            .data(this.displayData)
    
    lines.enter()
            .append("path")
            .attr("class", "line");

    lines
        .attr("d", function(d,i) {return that.line(d.bikers);})
        .attr("fill", "none")
        .style("stroke", "red");

   lines.exit()
        .remove();
}
