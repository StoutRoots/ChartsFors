//var dataSource = [],
    //max = 100;

//SEND REQUEST FOR DATA

function initialize() {
  var opts = {sendMethod: 'auto'};
  // Replace the data source URL on next line with your data source URL.
  var query = new google.visualization.Query('https://docs.google.com/spreadsheets/d/1iBZowsCfXKO-g_Dc1xz8FJG_5m5q6ngPAmbb1XcdHXM/edit?usp=sharing', opts);

  // Optional request to return only column C and the sum of column B, grouped by C members.
  query.setQuery('select A, B');

  // Send the query with a callback function.
  query.send(handleQueryResponse);
}

//PROCESSING THE RESPONSE
function handleQueryResponse(response) {

  if (response.isError()) {
    alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    return;
  }

  var dataSource = response.getDataTable();
//  var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
//  chart.draw(data, {width: 400, height: 240, is3D: true});
}


var html = [
    '<div id="zoomedChart" style="height: 335px;margin: 0 0 15px"></div>',
    '<div id="range" data-bind="dxRangeSelector: rangeOptions" style="height: 80px"></div>'
].join('');

$("#container").append(html);
$("#zoomedChart").dxChart({
    dataSource: dataSource,
    argumentAxis: {
        valueMarginsEnabled: false,
        type: "logarithmic",
        label: { format: "exponential" },
        grid: {
            visible: true 
        },
        minorGrid: {
            visible: true 
        },
        minorTickCount: 10
    },
    valueAxis: {
        placeholderSize: 50
    },
    legend: {
        visible: false
    },

    series: {}
});
$("#range").dxRangeSelector({
    size: {
        height: 120
    },
    dataSource: dataSource,
    chart: {
        series: {},
    },
    scale: {
        type: "logarithmic",
        label: { format: "exponential" },
        minRange: 1,
        minorTickCount: 10
    },
    sliderMarker: {
        format: 'exponential'
    },
    behavior: {
        callSelectedRangeChanged: "onMoving",
        snapToTicks: false
    },
    onSelectedRangeChanged: function (e) {
        var zoomedChart = $("#container #zoomedChart").dxChart("instance");
        zoomedChart.zoomArgument(e.startValue, e.endValue);
    }
});