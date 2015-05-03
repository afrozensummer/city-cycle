/**
 * Bitches make graphs 
 */

aggregateVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    this.margin = {top: 10, right: 0, bottom: 200, left: 50},
    this.width = 400 - this.margin.left - this.margin.right,
    this.height = 350 - this.margin.top - this.margin.bottom;

    this.titles = ["July 4", "December 1"];
    this.initVis();
}

aggregateVis.prototype.initVis = function(){

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
        console.log(d);
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
    console.log(today_date);

    var index = (60 * parseInt(hour)) + parseInt(minute);
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


