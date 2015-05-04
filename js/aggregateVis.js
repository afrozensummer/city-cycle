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

    this.margin = {top: 10, right: 0, bottom: 200, left: 50},
    this.width = 400 - this.margin.left - this.margin.right,
    this.height = 350 - this.margin.top - this.margin.bottom;

    this.titles = ["July 4", "December 1"];
    this.initVis();
}

aggregateVis.prototype.initVis = function(){

  var no_filter = [];
  var gender_filter = [];
  var subsc_filter = []

  console.log(this.data);

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

    d.forEach(function(i){

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
    no_filter.push({"date": formatTitle(date), "bikers":no_filter_array});
    gender_filter.push({"date": formatTitle(date), "gender": "male", "bikers":male_array});
    gender_filter.push({"date": formatTitle(date), "gender": "female", "bikers":female_array});
    subsc_filter.push({"date": formatTitle(date), "type": "subscriber", "bikers":yes_subscribe});
    subsc_filter.push({"date": formatTitle(date), "type": "customer", "bikers":no_subscribe});
  })

  console.log(no_filter);
  console.log(gender_filter);
  console.log(subsc_filter);

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
        //console.log(d);
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
    this.updateVis("00", "00", "July 4");
}

aggregateVis.prototype.updateVis = function(hour, minute, today_date) {

    //console.log("in update vis");
   // console.log(today_date);

    var index = (60 * parseInt(hour)) + parseInt(minute);

    this.data = this.nofilter_data;
    var that = this;

    //this.y.domain([0, d3.max(this.data.map(function(d) {return d.bikers[index];}))]);
    this.x.domain(this.titles);
    this.y.domain([0, 20000]);
   
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
      .data(this.data);

    var bar_enter = bar.enter().append("g");

    bar_enter.append("rect")
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
    // .style("fill", function(d,i) {
    //   return that.metaData.priorities[d.type]["item-color"];
    // });

    bar.exit().remove();

    bar
      .transition()
        .attr("y", function(d) { return that.y(d.bikers[index]); })
        .attr("height", function(d) { return that.height - that.y(d.bikers[index]); });
}


