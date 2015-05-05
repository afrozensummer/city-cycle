
StationVis = function(_parentElement, day_data, station_list) {
   	var stationvis = this;
    this.parentElement = _parentElement;
    this.data = day_data;
    this.station_list = station_list;
    this.start_trips = true;
    
    this.margin = {top: 10, right: 0, bottom: 25, left: 35},
    this.width = parseInt(d3.select('#stations_chart').style('width'), 10) - this.margin.left - this.margin.right,
    this.height = 300 - this.margin.top - this.margin.bottom;

    d3.selectAll(window).on('resize', resize);
    function resize() {
        that.width = parseInt(d3.select('#stations_chart').style('width'), 10) - that.margin.left - that.margin.right;
        that.initVis();
    }

    this.initVis();
}

StationVis.prototype.initVis = function() {

    var that = this;
    this.svg = this.parentElement.append("svg") 
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // Creates axis and scales
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
        .attr("class", "ytext")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Trips Starting from the Station in this Hour");

    //Modify the data
    this.wrangleData();

    //Call the update method
    this.updateVis();
}

StationVis.prototype.wrangleData= function() {

    if(this.start_trips == true) {
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
            line_data.push({name:d.name, color:d.color, bikers:time_line});
        });

        this.data.forEach( function(d,i) {
            bikes_starting_time = d3.time.minute.floor(new Date(d.starttime));
            if(bikes_starting_time >= starttime) {
                line_data.forEach( function (e,j) {
                    if(e.name == d["start station name"]) {
                        var index = ((d3.time.hour.floor(bikes_starting_time).getTime() - starttime.getTime())/(60*60*1000));
                        if(index != -1) {
                            e.bikers[index].count ++;
                        }
                    }
                });
            }
        });
        this.displayData = line_data;
    } else {
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
            line_data.push({name:d.name, color:d.color, bikers:time_line});
        });

        this.data.forEach( function(d,i) {
            bikes_ending_time = d3.time.minute.floor(new Date(d.stoptime));
            line_data.forEach( function (e,j) {
                if(e.name == d["end station name"]) {
                    var index = ((d3.time.hour.floor(bikes_ending_time).getTime() - starttime.getTime())/(60*60*1000));
                    if(index != -1 && index < 25) {
                        e.bikers[index].count ++;
                    }
                }
            });
        });
        this.displayData = line_data;
    }
}

StationVis.prototype.ending = function() {
    this.svg.selectAll(".ytext").text("Trips Ending at the Station in this Hour");
    this.start_trips = false;
    this.wrangleData();
    this.updateVis();
}

StationVis.prototype.starting = function() {
    this.svg.selectAll(".ytext").text("Trips Starting from the Station in this Hour");
    this.start_trips = true;
    this.wrangleData();
    this.updateVis();
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
        .style("stroke", function (d) {
          return d.color;  
        });

   lines.exit()
        .remove();
}
