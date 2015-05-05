/**
 * Bitches make graphs pt. 1
 */

averageDayVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    var averageDay = this;
    this.nofilter_data = [];
    this.gender_filter_data = [];
    this.subsc_filter_data = [];

    this.margin = {top: 10, right: 0, bottom: 50, left: 45},
    this.width = parseInt(d3.select('#barchart').style('width'), 10) - this.margin.left - this.margin.right,
    this.height = 200 - this.margin.top - this.margin.bottom;

    d3.select(window).on('resize', resize); 

    function resize() {
        // update width
        averageDay.width = parseInt(d3.select('#barchart').style('width'), 10)- this.margin.left - this.margin.right;
        // reset x range
        d3.select("svg").remove();
        averageDay.initVis();
    }

    this.titles = ["Jun 29", "Jun 30", "Jul  1", "Jul  2", "Jul  3", "Jul  4", "Jul  5"];

    this.initVis();
}

averageDayVis.prototype.initVis = function() {

  var no_filter = [];
  var gender_filter = [];
  var subsc_filter = []

  var formatHour = d3.time.format("%H");
  var formatDate = d3.time.format("%a, %b %e");
  var formatTitle = d3.time.format("%b %e");

  this.data.forEach(function(d){

    var day_array = d3.range(24).map(function () { return 0; });
    var female_array = d3.range(24).map(function () { return 0; });
    var male_array = d3.range(24).map(function () { return 0; });
    var yes_subscribe = d3.range(24).map(function () { return 0; });
    var no_subscribe = d3.range(24).map(function () { return 0; });

    var index = 0;
    var lasthour = "00";
    var date = new Date (d[d.length-1].starttime);
    var true_date = formatDate(date);

    d.forEach(function(i){
      var hour = new Date (i.starttime);
      var now = formatHour(hour);
      var this_date = formatDate(hour);

      if (this_date == true_date){
        if (now != lasthour) {
          index +=1;
          lasthour = now;
        }

        // Add to unfiltered data
        day_array[index] += 1;

        // Now add to filtered data sets
        if (i.gender == 1){
            male_array[index] +=1;
        } if (i.gender == 2){
            female_array[index] +=1;
        } if (i.usertype == "Customer") {
            no_subscribe[index] += 1;
        } if (i.usertype == "Subscriber") {
            yes_subscribe[index] += 1;
        }
      }   
    })

    no_filter.push({"date": formatTitle(date), "type": 0, "bikers":day_array, "color":"#4D4D4D"});
    gender_filter.push({"date": formatTitle(date), "type": 1, "bikers":male_array, "color":"#3399FF"});
    gender_filter.push({"date": formatTitle(date), "type": 2, "bikers":female_array, "color":"#FF6699"}); 
    subsc_filter.push({"date": formatTitle(date), "type": 1, "bikers":yes_subscribe, "color":"#F5A50A"});
    subsc_filter.push({"date": formatTitle(date), "type": 2, "bikers":no_subscribe, "color":"#6699FF"});
  });

  this.nofilter_data = no_filter;
  this.gender_filter_data = gender_filter;
  this.subsc_filter_data = subsc_filter;

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

    this.x = d3.scale.ordinal()
      .rangeRoundBands([0, this.width], .1);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .tickFormat(function(d) {
        return d})
        .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left");

    // add axes visual elements
    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")");

    this.svg.append("g")
      .attr("class", "y axis")
      .append("text")
         
         .attr("transform", "translate(100,0)")
         .attr("y", 6)
         .attr("dy", ".71em")
         .style("text-anchor", "beginning")
         .text("Bikers This Hour");

    // call the update method
    this.data_to_use = this.nofilter_data;
    this.updateVis("00");
}

averageDayVis.prototype.filter_called = function(filter, hour) {
    this.svg.selectAll(".bar").remove();
    
    if(filter == "gender") {
      this.data_to_use = this.gender_filter_data;
    }

    if(filter == "subscription") {
      this.data_to_use = this.subsc_filter_data;
    }

    if(filter == "none") {
      this.data_to_use = this.nofilter_data;
    }
    // Call updateVis
    this.updateVis(hour);
}

averageDayVis.prototype.updateVis = function(hour) {


    var index = parseInt(hour);
    var that = this;

    var max = d3.max(this.data_to_use.map(function (d) {return d3.max(d.bikers);}));
    this.y.domain([0, max]);
    this.x.domain(this.titles);
   
    // Update x axis
    this.svg.select(".x.axis")
        .call(this.xAxis)
     .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
            return "rotate(-65)" 
         });

    // Updates axis
    this.svg.select(".y.axis")
        .call(this.yAxis);

    // Data join
    var bar = this.svg.selectAll(".bar")
      .data(this.data_to_use);

    var bar_enter = bar.enter().append("g");

    bar_enter.append("rect")
      .attr("class", "bar")
      .attr("y", function(d) { return that.y(d.bikers[index]);}) 
      .attr("x", function(d, i) { 
        if(d.type != 2) {
          return that.x(d.date);
        }
        return that.x(d.date) + (that.x.rangeBand()/2);
      })
      .attr("width", function(d, i) { 
        if(d.type == 0) {
          return that.x.rangeBand();
        }
        return that.x.rangeBand()/2;
      })
      .attr("height", function(d, i) {
        return that.height - that.y(d.bikers[index]);
      })
      .style("fill", function(d) {
        return d.color;
      })

    bar.exit().remove();

    bar
      .transition()
        .attr("y", function(d) { return that.y(d.bikers[index]); })
        .attr("height", function(d) { return that.height - that.y(d.bikers[index]); });
}

