
/*
 *
 * ======================================================
 * We follow the vis template of init - wrangle - update
 * ======================================================
 *
 * */

/**
 * AgeVis object for HW3 of CS171
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @param _metaData -- the meta-data / data description object
 * @constructor
 */
averageDayVis = function(_parentElement, _data) {

    //console.log("age Vis is being called");

    //console.log(_data.length);
    this.parentElement = _parentElement;
    this.data = _data;
    //console.log(this.data.length);
    //console.log(this.data);
    //this.metaData = _metaData;
    //this.eventHandler = _eventHandler;
    this.displayData = [];

    this.margin = {top: 20, right: 0, bottom: 20, left: 100},
    this.width = 550 - this.margin.left - this.margin.right,
    this.height = 300 - this.margin.top - this.margin.bottom;
    this.length = _data.length;

    this.titles = ["average this hour"]

    //console.log("about to call initVis");
    this.initVis();

}


/**
 * Method that sets up the SVG and the variables
 */
averageDayVis.prototype.initVis = function(){

    //var that = this; // read about the this

    //TODO: construct or select SVG

    // constructs SVG layout
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // creates axis and scales
    this.y = d3.scale.linear()
      .range([this.height,0]);

    this.x = d3.scale.ordinal()
      .rangeRoundBands([0, this.width], .1);

    //this.color = d3.scale.category20();  

    //this.color = d3.scale.category20();  
    //TODO: create axis and scales

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left");

    this.xAxis = d3.svg.axis()
       .scale(this.x)
       .orient("bottom")
   

    // // Need to filter the data for just this range.
    // this.area = d3.svg.area()
    //    .interpolate("monotone")
    //    .x(function(d) {return that.x(d.counts); })
    //    .y0(this.height)
    //      .y1(function(d) { return that.y(d.key); });  

    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")

    this.svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0,0)");      
    // this.svg.append("g")
    //     .attr("class", "y axis")
    //   .append("text")
    //     .attr("transform", "rotate(0)")
    //     .attr("y", 6)
    //     .attr("dy", ".71em")
    //     .style("text-anchor", "beginning")
    //     .text("Age distribution");
     

    // filter, aggregate, modify data

    //console.log("init vis is finished except wrangle data");
    this.wrangleData(null); 
    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
averageDayVis.prototype.wrangleData= function(_filterFunction){

    // displayData should hold the data which is visualized
    this.displayData = this.filterAndAggregate(_filterFunction);

    //// you might be able to pass some options,
    //// if you don't pass options -- set the default options
    //// the default is: var options = {filter: function(){return true;} }
    //var options = _options || {filter: function(){return true;}};
}



/**
 * the drawing function - should use the D3 selection, enter, exit
 */
averageDayVis.prototype.updateVis = function(){

  //console.log("update vis begins");

	var that = this;

	//console.log(that.titles);
    this.x.domain(that.titles);
    this.y.domain([0, 200]);
    //this.y.domain([0, d3.max(this.displayData, function(d){ return d})]);
    //this.color.domain(that.titles);

    //console.log("here1");
    //this.y.domain(d3.extent(this.displayData, function(d) { return d.key; }));

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "translate(0,0)")
        .attr("transform", function(d){
        	return "rotate(-60) translate (0,-10)"
        })

    this.svg.select(".y.axis")
      .call(this.yAxis)    


    var bar = this.svg.selectAll(".bar")
      .data(this.displayData);

    var bar_enter = bar.enter().append("g");
      
    bar_enter.append("rect");
    bar_enter.append("text"); 

    //console.log(bar);
    bar
      .attr("class", "bar")
      .transition()
       .attr("transform", function(d, i) { 
       	//console.log(i);
        //console.log(that.x(that.titles[i]));
       	return "translate("+that.x(that.titles[i])+",0)"; })

    // Remove the extra bars
    bar.exit()
      .remove();

    //console.log(bar); 
    //var count = -1; 

    bar.select("rect")
      .attr("x", 0)
      .attr("y", function(d) {

      	return that.y(d);
      })
      .attr("width", this.x.rangeBand())
      .transition()
      .attr("height", function(d, i) {

      		//console.log(that.height);
      		//console.log(that.y(d));
            return that.height - that.y(d);
      });

      //console.log("end of update vis");

     

}


/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
averageDayVis.prototype.onSelectionChange= function (day){

    //sconsole.log("this is time");

    var formatDayHour = d3.time.format("%a, %b %e, %H");
    var format_day_only = d3.time.format("%a, %b %e");

    //var data = new Date (this.data[0].starttime);
    //var formatted_date = formatDayHour(data);
    day = formatDayHour(day);

    //console.log(this.data[0].starttime);
    var k = 0;

    // Filter for only events on this day
    this.wrangleData(function(d){

      var data = new Date (d.starttime);
      var formatted_date = formatDayHour(data);
      //console.log(formatted_date == day)
      return (formatted_date == day);
    });

    console.log(this.data.length);



    // console.log("data is wrangled")
    this.updateVis();


}


/*
*
* ==================================
* From here on only HELPER functions
* ==================================
*
* */



/**
 * The aggregate function that creates the counts for each age for a given filter.
 * @param _filter - A filter can be, e.g.,  a function that is only true for data of a given time range
 * @returns {Array|*}
 */
averageDayVis.prototype.filterAndAggregate = function(_filter){

    // console.log("in filter and aggregate");


    // Set filter to a function that accepts all items
    // ONLY if the parameter _filter is NOT null use this parameter
    var filter = function(){return true;}
    if (_filter != null){
        filter = _filter;
    } 

    var that = this;

    //Dear JS hipster, a more hip variant of this construct would be:
    // var filter = _filter || function(){return true;}

    // Initialize res to an array of 0s. 
    var res = d3.range(1).map(function () {
        return 0;
    });

    //console.log(this);
    //res[0] += this.length;

     this.data.filter(filter).forEach(function(j){
         d3.range(0,1).forEach(function(k){
             res[k] += 1;
         })
     })

     //console.log("about to print res");
     //console.log(res);


    return res;

}

