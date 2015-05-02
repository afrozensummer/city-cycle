/**
 * Bitches make graphs 
 */


//TODO: DO IT ! :) Look at agevis.js for a useful structure
averageDayVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    this.margin = {top: 10, right: 0, bottom: 200, left: 45},
    this.width = 500 - this.margin.left - this.margin.right,
    this.height = 405 - this.margin.top - this.margin.bottom;

    this.titles = ["Day 1", "Day 2"];
    this.initVis();
}

/**
 * Method that sets up the SVG and the variables
 */
averageDayVis.prototype.initVis = function(){

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
        return that.titles[d]})
        .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left");

    // add axes visual elements
    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")");

    this.svg.append("g")
      .attr("class", "y axis");

    // filter, aggregate, modify data
    //this.wrangleData(null);

    // call the update method
    this.updateVis("00");
}

/**
 * the drawing function - should use the D3 selection, enter, exit
 */
averageDayVis.prototype.updateVis = function(hour) {

    var index = parseInt(hour);
    //console.log(index);
    var that = this;
    //console.log(this.data)
    // updates scales

    this.y.domain([0, d3.max(this.data.map(function(d) {return d.bikers[index];}))]);
    //this.y.domain([0, d3.max(this.displayData.map(function (d) {return d.count;}))]);
    //this.x.domain(this.data(function(d) {return d.date;}));
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
      .data(this.data);

    var bar_enter = bar.enter().append("g");

    bar_enter.append("rect")
      .attr("class", "bar")
      .attr("y", function(d) { return that.y(d.bikers[index]);}) // or something like that
      .attr("x", function(d, i) {console.log(that.x(d.date)); return that.x(d.date);})
    .attr("width", this.x.rangeBand())
    .attr("height", function(d, i) {
        return that.height - that.y(d.bikers[index]);
    })
    // .style("fill", function(d,i) {
    //   return that.metaData.priorities[d.type]["item-color"];
    // });

    bar.exit().remove();

    bar
      .transition()
        .attr("y", function(d) { return that.y(d.bikers[index]); })
        .attr("height", function(d) { return that.height - that.y(d.bikers[index]); });
}


/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
// PrioVis.prototype.onSelectionChange = function (selectionStart, selectionEnd, is_empty){

//     // TODO: call wrangle function
//     if(is_empty) {
//         this.wrangleData(null);
//     } else {
//         this.wrangleData(function (d) {
//             return (d.time >= selectionStart && d.time <= selectionEnd);
//         });
//     }
//     this.updateVis();
// }


// PrioVis.prototype.doesLabelFit = function(datum, label) {
//   var pixel_per_character = 6;  // obviously a (rough) approximation
//   return datum.type.length * pixel_per_character < this.x(datum.count);
// }



/**
 * The aggregate function that creates the counts for each age for a given filter.
 * @param _filter - A filter can be, e.g.,  a function that is only true for data of a given time range
 * @returns {Array|*}
 */
// PrioVis.prototype.filterAndAggregate = function(_filter){

//     // Set filter to a function that accepts all items
//     // ONLY if the parameter _filter is NOT null use this parameter
//     var filter = function(){return true;}
//     if (_filter != null){
//         filter = _filter;
//     }
//     //Dear JS hipster, a more hip variant of this construct would be:
//     // var filter = _filter || function(){return true;}

//     var that = this;
//     var res = d3.range(16).map(function (d,i) {
//         return {type:i, count:0};
//     });

//     // Convert data into summary count format
//     this.data.filter(filter).forEach( function (d) {
//         d.prios.forEach( function (e,i) {
//             res[i].count += e;
//         })
//     });
//     return res;
// }
