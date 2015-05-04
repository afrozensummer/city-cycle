/**
 * Bitches make graphs 
 */


//TODO: DO IT ! :) Look at agevis.js for a useful structure
averageDayVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.nofilter_data = [];
    this.gender_filter_data = [];
    this.subsc_filter_data = [];

    this.margin = {top: 10, right: 0, bottom: 100, left: 45},
    this.width = 350 - this.margin.left - this.margin.right,
    this.height = 250 - this.margin.top - this.margin.bottom;

    this.titles = [ "Jul  4", "Dec  1"];
    this.initVis();
}

/**
 * Method that sets up the SVG and the variables
 */
averageDayVis.prototype.initVis = function() {

  //console.log(this.data);  

  var no_filter = [];
  var gender_filter = [];
  var subsc_filter = []

  //var day_array = d3.range(24).map(function () { return 0; });

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
    var date = new Date (d[1000].starttime);
    var true_date = formatDate(date);

    //console.log(d);

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

        // Now add to where the gender is filtered
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

    //console.log(day_array);
    no_filter.push({"date": formatTitle(date), "type": 0, "bikers":day_array, "color":"black"});
    gender_filter.push({"date": formatTitle(date), "type": 1, "bikers":male_array, "color":"blue"});
    gender_filter.push({"date": formatTitle(date), "type": 2, "bikers":female_array, "color":"red"}); 
    subsc_filter.push({"date": formatTitle(date), "type": 1, "bikers":yes_subscribe, "color":"#ffa500"});
    subsc_filter.push({"date": formatTitle(date), "type": 2, "bikers":no_subscribe, "color":"#0080ff"});
  });
  //console.log(no_filter);
  //console.log(gender_filter);
  //console.log(subsc_filter);

  this.nofilter_data = no_filter;
  this.gender_filter_data = gender_filter;
  this.subsc_filter_data = subsc_filter;
  // Create the regular data


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
         
         //.attr("transform", "translate(0, 100)", "")
         .attr("transform", "translate(100,0)")
         .attr("y", 6)
         .attr("dy", ".71em")
         .style("text-anchor", "beginning")
         .text("Average Bikers This Hour");

    // filter, aggregate, modify data
    //this.wrangleData(null);

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
    // call updateVis
    this.updateVis(hour);
}
/**
 * the drawing function - should use the D3 selection, enter, exit
 */
averageDayVis.prototype.updateVis = function(hour) {


    var index = parseInt(hour);
    //console.log(index);
    var that = this;
   
    //console.log(today_date);
    //console.log(this.data)
    // updates scales

    //this.y.domain([0, d3.max(this.data.map(function(d) {return d.bikers[index];}))]);
    //this.y.domain([0, d3.max(this.displayData.map(function (d) {return d.count;}))]);
    //this.x.domain(this.data(function(d) {return d.date;}));

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

   /* catagorie: 1,2
    gender: 1(dont move),2(move over)
    none: 0

    {day, bikers, filter:0}, {day, bikers, filter:1}*/

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
