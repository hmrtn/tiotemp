let meta1;
let data1;
let meta;
let data;

HTMLWidgets.widget({

  name: 'timeseriesMap',

  type: 'output',

  factory: function (el, width, height) {

    d3.select("#htmlwidget_container")
      .append("div")
      .attr("id", el.id + "_2")
      .attr("class", "spatempr html-widget html-widget-static-bound")
      .style("width", "100%")
      .style("height", height + "px")
      .style("position", "relative");

    // TODO: define shared variables for this instance

    let map = L
      .map(el.id)
      .setView([35.5, -96.5], 4); // center position + zoom

    // Add a tile to the map = a background. Comes from OpenStreetmap
    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

    // Add a svg layer to the map
    L.svg().addTo(map);


    // We pick up the SVG from the map object
    let svgMap = d3.select("#" + el.id).select("svg").append("g");

    const adj = 30;
    const parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");
    let svgPlot = d3.select("#" + el.id + "_2")
      .append("div")
      .append("svg")
      .style("width", "100%")
      .style("height", height + "px")
      .attr("viewBox", "-" +
        adj + " -" +
        adj + " " +
        (width + adj * 3) + " " +
        (height + adj * 3))
      .classed("svg-content", true);
    /*      .style("padding-top", height+"px")
          .attr("class", "plot");*/

    // Create cursor follower
    let focus = svgPlot.append("g");
    //.append("display", "none");

    // Store mouseover focus data
    let focusDate;
    let focusColor;

    // color ramp map
    let col = d3.scaleThreshold()
      .domain([12, 35, 55, 75, 100])
      // SCAQMD profile
      .range(["#abe3f4", "#118cba", "#286096", "#8659a5", "#6a367a"]);



return {
  renderValue: function (x) {

    // TODO: code to render the widget, e.g.
    meta = d3.csv("https://raw.githubusercontent.com/MazamaScience/timeseries-map/master/meta.csv"); //(x.meta);
    data = d3.csv("https://raw.githubusercontent.com/MazamaScience/timeseries-map/master/data.csv"); //(x.data);

    meta1 = HTMLWidgets.dataframeToD3(x.meta);
    data1 = HTMLWidgets.dataframeToD3(x.data);

    meta.then(function (m) {
      // Add a LatLng object from meta coords
      m.forEach(d => {
        d.LatLng = new L.LatLng(d.latitude, d.longitude)
      });

      let mouseIn = function (d) {
        d3.select(d3.event.target)
          .raise()
          .transition()
          .duration(100)
          .attr("r", 12);
      }

      let mouseOut = function (d) {
        d3.select(d3.event.target)
          .transition()
          .duration(150)
          .attr("r", 8);
      }

      let feature = svgMap.selectAll("mycircle")
        .data(m)
        .enter()
        .append("circle")
        .attr("cx", d => {
          map.latLngToLayerPoint(d.LatLng).x
        })
        .attr("cy", d => {
          map.latLngToLayerPoint(d.LatLng).y
        })
        .attr("r", 8)
        .style("fill", "red")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("fill-opacity", 0.75)
        .attr("stoke-opacity", 0.75)
        .on("mouseover", mouseIn)
        .on("mouseout", mouseOut)
        .attr("pointer-events", "visible");
      //.on("click", onMarkerClick)

      // Function that update circle position if something change
      function updateMap() {
        //g.selectAll("circle")
        feature
          .attr("cx", function (d) {
            return map.latLngToLayerPoint(d.LatLng).x
          })
          .attr("cy", function (d) {
            return map.latLngToLayerPoint(d.LatLng).y
          })
      }

      map.on("moveend", updateMap);

      updateMap();


    });


    // data
    data.then(function (d) {

      // This chunk takes the CSV data, remaps it to a more appropriate format
      let slice = d.columns.slice(1).map(function (id) {
        return {
          id: id,
          values: d.map(function (d) {
            return {
              date: parseDate(d.datetime),
              pm25: +d[id],
              color: col(+d[id])
            };
          })
        }
      });

      // Add custom class id to each line using monitorID
    let i = 0;
    const ids = () => {
        return "line-" + slice[i++].id
    }

      // Scale prep
      const xScale = d3.scaleUtc().range([0, width]);
      const yScale = d3.scaleLinear().rangeRound([height, 0]);

      xScale.domain(d3.extent(d, function (d) {
        return parseDate(d.datetime)
      }));
      yScale.domain([(0), d3.max(slice, function (c) {
        return d3.max(c.values, function (d) {
          return d.pm25 + 4;
        });
      })]);

      // Axis prep
      const xAxis = d3.axisBottom()
        .ticks(d3.timeDay.every(1))
        .tickFormat(d3.timeFormat("%b %d"))
        .scale(xScale);

      const yAxis = d3.axisLeft()
        .ticks((slice[0].values).length)
        .scale(yScale);

         // Add the x axis
    svgPlot.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the y axis
    svgPlot.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

        const line = d3.line()
        .x(d => {
            return xScale(d.date)
        })
        .y(d => {
            return yScale(d.pm25)
        });


    let lines = svgPlot.selectAll("lines")
      .data(slice)
      .enter()
      .append("g");

        lines.append("path")
        .attr("class", ids)
        .attr("d", d => {
            return line(d.values)
        })
        .style("fill", "red");

    });


    //svgPlot.append("circle").attr("cx", 25).attr("cy", 25).attr("r", 25).style("fill", "purple");



  },

  resize: function (width, height) {

    //.select("#" + el.id + "_2").select("svg")
    //svgPlot.attr("width", "100%");


    //force.size([width, height]).resume();
  }

};
}
});
