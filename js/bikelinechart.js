/**
 * Line Graph
 */

bikeLineVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    var bikelineVis = this;
    this.margin = {top: 0, right: 0, bottom: 0, left: 0},
    this.width = parseInt(d3.select('#bikeline').style('width'), 10);
    this.height = 100 - this.margin.top - this.margin.bottom;
       
    d3.select(window).on('resize', resize); 

    function resize() {
        // update width
        bikelineVis.width = parseInt(d3.select('#bikeline').style('width'), 10);
        // reset x range
        d3.select("svg").remove();
        bikelineVis.initVis();
    }
    
    var currenttime = d3.time.day(new Date(this.data[this.data.length-1]["starttime"]));
    var newday = d3.time.day(new Date(this.data[this.data.length-1]["starttime"]));
    this.bikeperminute = [];
    var placemarker = 0;
    var endplacemarker = 0;

    for (var i = 0; i < 1440; i++) {
        var counterforminute = 0;

        var datatime = d3.time.minute.floor(currenttime);
        var nextminute = new Date(currenttime.getTime() + 60*1000);

        if (new Date(this.data[placemarker]["starttime"]) <= newday) {
            while(new Date(this.data[placemarker]["starttime"]) <= newday) {
            placemarker++;
        }
        }

        while(new Date(this.data[placemarker]["starttime"]) <= currenttime) {
            counterforminute++;
            placemarker++;
        }
        this.bikeperminute[i] = counterforminute;
        currenttime = new Date(currenttime.getTime() + 60*1000);
    }

    this.initVis();
}


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

    this.svg.append('svg:path')
        .attr('d', that.area(this.bikeperminute))
        .attr('fill',  '#d3d3d3')

      
}



