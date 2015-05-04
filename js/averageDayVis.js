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

    this.titles = ["Jul 4", "Dec 1"];
    this.initVis();
}

/**
 * Method that sets up the SVG and the variables
 */
averageDayVis.prototype.initVis = function(){

  //console.log(this.data);  

  var no_filter = [];
  var gender_filter = [];
  var subsc_filter = []

  //var day_array = d3.range(24).map(function () { return 0; });


  this.data.forEach(function(d){

    var formatHour = d3.time.format("%H");
    var formatDate = d3.time.format("%a, %b %e");
    var formatTitle = d3.time.format("%b %e");

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
    no_filter.push({"date": formatTitle(date), "bikers":day_array});
    gender_filter.push({"date": formatTitle(date), "gender": "male", "bikers":male_array});
    gender_filter.push({"date": formatTitle(date), "gender": "female", "bikers":female_array});
    subsc_filter.push({"date": formatTitle(date), "type": "subscriber", "bikers":yes_subscribe});
    subsc_filter.push({"date": formatTitle(date), "type": "customer", "bikers":no_subscribe});
  });
  //console.log(no_filter);
  //console.log(gender_filter);
  //console.log(subsc_filter);

  this.nofilter_data = no_filter;
  this.gender_filter_data = gender_filter;
  this.subsc_filter_data = subsc_filter;

  console.log(this);

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
    this.updateVis("00", "Jul 4");
}

averageDayVis.prototype.filter_called = function(filter, hour, today_date) {

    all_data = [];
    console.log(this);
    //var day_array = d3.range(24).map(function () { return 0; });

    // filter the data here
    // if(filter == "gender") {

    //     this.data.forEach(function(d){

    //     })
    //     var female_array = d3.range(24).map(function () { return 0; });
    //     var male_array = d3.range(24).map(function () { return 0; });


    // }

    if(filter == "subscription") {
        //sort the data this way
    }

    if(filter == "none") {
        //sort the data this way
    }

    // remove all the bars
     this.svg.select("bar").remove();

    // call updateVis
    this.updateVis(hour, today_date);
}
/**
 * the drawing function - should use the D3 selection, enter, exit
 */
averageDayVis.prototype.updateVis = function(hour, today_date) {

    var index = parseInt(hour);
    //console.log(index);
    var that = this;
    this.data = this.nofilter_data;
    console.log(this.nofilter_data);
    console.log(this.titles);
    //console.log(today_date);
    //console.log(this.data)
    // updates scales

    //this.y.domain([0, d3.max(this.data.map(function(d) {return d.bikers[index];}))]);
    //this.y.domain([0, d3.max(this.displayData.map(function (d) {return d.count;}))]);
    //this.x.domain(this.data(function(d) {return d.date;}));
    this.x.domain(this.titles);
    this.y.domain([0, 2000]);
   
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

   /* catagorie: 1,2
    gender: 1(dont move),2(move over)
    none: 0

    {day, bikers, filter:0}, {day, bikers, filter:1}*/

    bar_enter.append("rect")
      .attr("class", "bar")
      .attr("y", function(d) {console.log(d.bikers[index]); return that.y(d.bikers[index]);}) // or something like that
      .attr("x", function(d, i) {console.log(d.date); return that.x(d.date);})
    .attr("width", this.x.rangeBand())
    .attr("height", function(d, i) {
        return that.height - that.y(d.bikers[index]);
    })
     // .style("fill", function(d,i) {
     //    if (d.date == today_date) {
     //        return "teal";
     //    }
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
