Slider = function(_parentElement, _data, _eventHandler) {
  var formatDate = d3.time.format("%a, %b %e, %H:%M"); //date and time

  // parameters
  var margin = {
      top: 10,
      right: 50,
      bottom: 10,
      left: 150
    },
    width = 800 - margin.left - margin.right,
    height = 50 - margin.bottom - margin.top;


  // scale function
  var timeScale = d3.time.scale()
    .domain([new Date('2014-12-01 0:00:00'), new Date('2014-12-01 11:59:59')])
    .range([0, width])
    .clamp(true);


  // initial value
  var startValue = timeScale(new Date('2014-12-01 0:00:00'));
  startingValue = new Date('2014-12-01 0:00:00');

  //////////

  // defines brush
  var brush = d3.svg.brush()
    .x(timeScale)
    .extent([startingValue, startingValue])
    .on("brush", brushed);

  var svg = _parentElement.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    // classic transform to position g
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
    .attr("class", "x axis")
  // put in middle of screen
  .attr("transform", "translate(0," + height / 2 + ")")
  // inroduce axis
  .call(d3.svg.axis()
    .scale(timeScale)
    .orient("bottom")
    .tickFormat(function(d) {
      return formatDate(d);
    })
    .tickSize(0)
    .tickPadding(12)
    .tickValues([timeScale.domain()[0], timeScale.domain()[1]]))
    .select(".domain")
    .select(function() {
      //console.log(this);
      return this.parentNode.appendChild(this.cloneNode(true));
    })
    .attr("class", "halo");

  var slider = svg.append("g")
    .attr("class", "slider")
    .call(brush);

  slider.selectAll(".extent,.resize")
    .remove();

  slider.select(".background")
    .attr("height", height);

  var handle = slider.append("g")
    .attr("class", "handle")

  handle.append("path")
    .attr("transform", "translate(0," + height / 2 + ")")
    .attr("d", "M 0 -20 V 20")

  /*handle.append('text')
    .text(startingValue)
    .attr("transform", "translate(" + (-18) + " ," + (height / 2 - 25) + ")");*/

  slider
    .call(brush)

  function brushed() {
    var value = brush.extent()[0];
    if (d3.event.sourceEvent) { // not a programmatic event
      value = timeScale.invert(d3.mouse(this)[0]);
      brush.extent([value, value]);
    }
    $(_eventHandler).trigger("selectionChanged", {time:value});

    handle.attr("transform", "translate(" + timeScale(value) + ",0)");
    //handle.select('text').text(formatDate(value));
  }
}