/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 1/28/15.
 */


//TODO: DO IT ! :) Look at agevis.js for a useful structure
StationVis = function(_parentElement, day_data, station_list) {
   	var that = this;
    this.parentElement = _parentElement;
    this.data = day_data;
    this.station_list = station_list;
    
    this.margin = {top: 10, right: 30, bottom: 25, left: 45},
    this.width = 950 - this.margin.left - this.margin.right,
    this.height = 300 - this.margin.top - this.margin.bottom;

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
}

/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
StationVis.prototype.wrangleData= function() {

    // time interval in minutes
    //var total_time = 24
    var interval = 10;

    var time_line = [];
    var starttime = d3.time.day(new Date(this.data[this.data.length-1]["starttime"]));
    for(var i = 0; i <= 24*60; i ++) {
        time_line.push({
            date:new Date(starttime.getTime() + i*1000*60),
            count: 0
        });
    }

    var line_data = [];
    this.station_list.forEach(function(d) {
        line_data.push({name:d, bikers:time_line});
    });
    
    console.log(line_data);

    this.data.forEach( function(d,i) {
        bikes_starting_time = d3.time.minute.floor(new Date(d.starttime));
        if(bikes_starting_time >= starttime) {
            line_data.forEach( function (e,j) {
                if(e.name == d["start station name"]) {
                    var index = ((bikes_starting_time.getTime() - starttime.getTime())/(60*1000));
                    //(Math.ceil(index / 10) * 10)/10;
                    line_data[j].bikers[index].count ++;
                    console.log(e.name + d["start station name"] + ":" + bikes_starting_time + ":" + line_data[j].bikers[index].count);
                    console.log(line_data[j].bikers);
                }
            });
        }
    });

    console.log(line_data);
    this.displayData = line_data;
}


/**
 * the drawing function - should use the D3 selection, enter, exit
 */
StationVis.prototype.updateVis = function() {
    
    var that = this;

    // updates scales
    console.log(this.displayData);
    this.x.domain([
        d3.min(this.displayData, function(c) { return d3.min(c.bikers, function(v) { return v.date; }); }),
        d3.max(this.displayData, function(c) { return d3.max(c.bikers, function(v) { return v.date; }); })
    ]);

    console.log(d3.max(this.displayData, function(c) { return d3.max(c.bikers, function(v) { return v.date; })}));
    console.log(d3.max(this.displayData, function(c) { return d3.max(c.bikers, function(v) { return v.count; })}));

    this.y.domain([
        d3.min(this.displayData, function(c) { return d3.min(c.bikers, function(v) { return v.count; }); }),
        d3.max(this.displayData, function(c) { return d3.max(c.bikers, function(v) { return v.count; }); })
    ]);

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
        .attr("d", function(d,i) {console.log(d); return that.line(d.bikers);})
        .attr("fill", "none")
        .style("stroke", function(d,i) {
            if(i == 1) return "blue";
            else return "red";
        });

   lines.exit()
        .remove();
}


/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
StationVis.prototype.onSelectionChange = function (selectionStart, selectionEnd, is_empty){

    // TODO: call wrangle function
    if(is_empty) {
        this.wrangleData(null);
    } else {
        this.wrangleData(function (d) {
            return (d.time >= selectionStart && d.time <= selectionEnd);
        });
    }
    this.updateVis();
}


StationVis.prototype.doesLabelFit = function(datum, label) {
  var pixel_per_character = 6;  // obviously a (rough) approximation
  return datum.type.length * pixel_per_character < this.x(datum.count);
}

StationVis.prototype.filterAndAggregateAverages = function(_filter) {
    
    var that = this;
    var filter = function(){return true;}
    if (_filter != null){
        filter = _filter;
    }

    var average_data = this.checked.map( function (d) {
        return {values:[], priority:d};
    });

    this.data.filter(filter).forEach(function(d,i) {
        average_data.forEach( function(e,f) {
            e.values.push({date:d.time, count:that.averages[e.priority]});
            }
        )
    });

    return average_data;

}

/**
 * The aggregate function that creates the counts for each age for a given filter.
 * @param _filter - A filter can be, e.g.,  a function that is only true for data of a given time range
 * @returns {Array|*}
 */
StationVis.prototype.filterAndAggregate = function(_filter){

    // Set filter to a function that accepts all items
    // ONLY if the parameter _filter is NOT null use this parameter
    var filter = function(){return true;}
    if (_filter != null){
        filter = _filter;
    }
   
    var that = this;
    var res = this.checked.map( function (d) {
        return {values:[], priority:d};
    });

    this.data.filter(filter).forEach( function (d) {
        d.prios.forEach( function (e,i) {
            res.forEach( function(f,g) {
                if(f.priority == i) {
                    f.values.push({count:e, date:d.time});
                }
            })
        })
    });
    return res;
}