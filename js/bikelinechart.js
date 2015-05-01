/**
 * Line Graph
 */

bikeLineVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;

    this.margin = {top: 10, right: 0, bottom: 0, left: 5},
    this.width = 1200 - this.margin.left - this.margin.right,
    this.height = 120 - this.margin.top - this.margin.bottom;
    
    var currenttime = d3.time.day(new Date(this.data[0]["starttime"]));
    //var endtime = new Date(this.data[this.data.length-1]["stoptime"]);
    this.bikeperminute = [];
    var placemarker = 0;
    var endplacemarker = 0;

    function all_bikes_for_date(date, dataset) {
        var that = this;
        var bike_list_minute = [];
        var date_rounded = d3.time.minute.floor(date);
        var i = 0, count =0; 
        bike_data = dataset;
        while (i < bike_data.length) {
          var bike_start_time = d3.time.minute.floor(new Date(bike_data[i].starttime));
          var bike_stop_time = d3.time.minute.floor(new Date(bike_data[i].stoptime));
          if(date_rounded.getTime() == bike_stop_time.getTime() || date_rounded.getTime() == bike_start_time.getTime() || (date_rounded < bike_stop_time && date_rounded > bike_start_time)) 
          {
            count++;
          }
          i++;
        }
        return count;
      }

    //console.log(all_bikes_for_date(currenttime, this.data))

    for (var i = 0; i < 1440; i++) {
        //var counterforminute = all_bikes_for_date(currenttime, this.data);
        var counterforminute = 0;
        var datatime = d3.time.minute.floor(currenttime);
        var nextminute = new Date(currenttime.getTime() + 60*1000);

        while(new Date(this.data[placemarker]["starttime"]) <= currenttime) {
            counterforminute++;
            placemarker++;
        }
        this.bikeperminute[i] = counterforminute;
        currenttime = new Date(currenttime.getTime() + 60*1000);
    }

    // console.log(bikeperminute)
    this.initVis();
}

/**
 * Method that sets up the SVG and the variables
 */
bikeLineVis.prototype.initVis = function(){

  var that = this;

    // constructs SVG layout
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // creates axis and scales
    this.y = d3.scale.linear()
      .range([this.height, 0]);

    this.x = d3.scale.linear()
      .range([0, this.width]);

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      //.ticks(15)
      .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left");

    this.area = d3.svg.area()
      .interpolate("monotone")
      .x(function(d, i) {return that.x(i); })
      .y0(this.height)
      .y1(function(d, i) { return that.y(d); });

    // Add axes visual elements
    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + (this.height) + ")")

    this.svg.append("g")
        .attr("class", "y axis")

    // call the update method
    this.updateVis();
}

bikeLineVis.prototype.updateVis = function(){

    var that = this;
    // updates scales
    this.x.domain(d3.extent(this.bikeperminute, function(d, i) {return i; }));
    this.y.domain([0, d3.max(this.bikeperminute, function(d, i) { return d })]);

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    // var area = d3.svg.area()
    //     .x(function(d,i) {return that.x(i)})
    //     .y(function(d) { return that.y(d)})
    //     .interpolate('monotone');

    this.svg.append('svg:path')
        .attr('d', that.area(this.bikeperminute))
        .attr('stroke', 'black')
        // .attr('fill', 'none')
      
}