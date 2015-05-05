/**
 * Bitches make graphs 
 */

aggregateVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    //this.displayData = [];

    this.nofilter_data = [];
    this.gender_filter_data = [];
    this.subsc_filter_data = [];

    this.margin = {top: 10, right: 0, bottom: 50, left: 50},
    this.width = parseInt(d3.select('#aggregate_chart').style('width'), 10) - this.margin.left - this.margin.right,
    this.height = 200 - this.margin.top - this.margin.bottom;

        d3.select(window).on('resize', resize); 

    function resize() {
        // update width
        averageDay.width = parseInt(d3.select('#aggregate_chart').style('width'), 10)- this.margin.left - this.margin.right;
        // reset x range
        d3.select("svg").remove();
        averageDay.initVis();
    }

    this.titles = ["Jul  4", "Dec  1"];
    this.initVis();
}

aggregateVis.prototype.initVis = function() {

  var no_filter = [];
  var gender_filter = [];
  var subsc_filter = []

  var formatHour = d3.time.format("%H");
  var formatMinute = d3.time.format("%M");
  var formatDate = d3.time.format("%a, %b %e");
   var formatTitle = d3.time.format("%b %e");

  this.data.forEach(function(d){
    var no_filter_array = d3.range(1440).map(function () { return 0; });
    var female_array = d3.range(1440).map(function () { return 0; });
    var male_array = d3.range(1440).map(function () { return 0; });
    var yes_subscribe = d3.range(1440).map(function () { return 0; });
    var no_subscribe = d3.range(1440).map(function () { return 0; });

    var index = 0;
    var date = new Date (d[1000].starttime);
    var true_date = formatDate(date);

    d.forEach(function(i) {

      var time = new Date (i.starttime);
      if (formatDate(time) == true_date){
        var new_index = (60 * parseInt(formatHour(time))) + parseInt(formatMinute(time));
        if (new_index == index){
          no_filter_array[index] += 1;
          if (i.gender == 1){
            male_array[index] +=1
          } if (i.gender == 2) {
            female_array[index] +=1;
          }
          if (i.usertype == "Subscriber") {
            yes_subscribe[index] +=1
          } if (i.usertype == "Customer") {
            no_subscribe[index] +=1;
          }
        } else {
          index +=1;
          no_filter_array[index] = no_filter_array[index - 1] + 1;

          // Gender stuff
          if (i.gender == 1){
            male_array[index] = male_array[index - 1] + 1;
            female_array[index] = female_array[index -1 ]
          } else if (i.gender == 2) {
            female_array[index] = female_array[index-1] + 1;
            male_array[index] = male_array[index-1];
          } else {
            male_array[index] = male_array[index-1];
            female_array[index] = female_array[index-1];
          }

          // Subscription information
          if (i.usertype == "Customer"){
            no_subscribe[index] = no_subscribe[index - 1] + 1;
            yes_subscribe[index] = yes_subscribe[index-1]

          } else if (i.usertype == "Subscriber"){
            yes_subscribe[index] = yes_subscribe[index-1] + 1;
            no_subscribe[index] = no_subscribe[index-1];
          } else {
            yes_subscribe[index] = yes_subscribe[index-1]
            no_subscribe[index] = no_subscribe[index-1];
          }

        }
      }
    })
    no_filter.push({"date": formatTitle(date), "type": 0, "bikers":no_filter_array, "color":"black"});
    gender_filter.push({"date": formatTitle(date), "type": 1, "bikers":male_array, "color":"blue"});
    gender_filter.push({"date": formatTitle(date), "type": 2, "bikers":female_array, "color":"red"}); 
    subsc_filter.push({"date": formatTitle(date), "type": 1, "bikers":yes_subscribe, "color":"#ffa500"});
    subsc_filter.push({"date": formatTitle(date), "type": 2, "bikers":no_subscribe, "color":"#0080ff"});
  })

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
      .attr("transform", "translate(0," + this.height + ")")

    this.svg.append("g")
      .attr("class", "y axis")
      .append("text")
         
         //.attr("transform", "translate(0, 100)", "")
         .attr("transform", "translate(100, 0)")
         .attr("y", 6)
         .attr("dy", ".71em")
         .style("text-anchor", "beginning")
         .text("Total Bikers So Far Today");

    // call the update method
    this.data_to_use = this.nofilter_data;
    this.updateVis("00", "00");
}
aggregateVis.prototype.filter_called = function(filter, hour, minute) {
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
    // call updateVis
    this.updateVis(hour, minute);
}

aggregateVis.prototype.updateVis = function(hour, minute) {

   //console.log("in update vis");
   // console.log(today_date);

    var index = (60 * parseInt(hour)) + parseInt(minute);

    this.data = this.nofilter_data;
    var that = this;

    //this.y.domain([0, d3.max(this.data.map(function(d) {return d.bikers[index];}))]);
    var max = d3.max(this.data_to_use.map(function (d) {return d3.max(d.bikers);}));
    this.y.domain([0, max]);
    this.x.domain(this.titles);
   
    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis)
     .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
            return "rotate(-65)" 
         });

    // updates axis
    this.svg.select(".y.axis")
        .call(this.yAxis);

    // data join
    var bar = this.svg.selectAll(".bar")
      .data(this.data_to_use);

    var bar_enter = bar.enter().append("g");

    bar_enter.append("rect")
      .attr("class", "bar")
      .attr("y", function(d) { return that.y(d.bikers[index]);}) // or something like that
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

   /* bar_enter.append("rect")
      .attr("class", "bar")
      .attr("y", function(d) { return that.y(d.bikers[index]);}) // or something like that
      .attr("x", function(d, i) {return that.x(d.date);})
    .attr("width", this.x.rangeBand())
    .attr("height", function(d, i) {
        return that.height - that.y(d.bikers[index]);
    })
    .style("fill", function(d,i) {
        if (d.date == today_date) {
            return "teal";
        }
     });
  */
    bar.exit().remove();

    bar
      .transition()
        .attr("y", function(d) { return that.y(d.bikers[index]); })
        .attr("height", function(d) { return that.height - that.y(d.bikers[index]); });
}


