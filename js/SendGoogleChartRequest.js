//SEND REQUEST FOR DATA

function initialize() {
  var opts = {sendMethod: 'auto'};
  // Replace the data source URL on next line with your data source URL.
  var query = new google.visualization.Query('https://docs.google.com/spreadsheets/d/1iBZowsCfXKO-g_Dc1xz8FJG_5m5q6ngPAmbb1XcdHXM/edit#gid=0', opts);

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

  var data = response.getDataTable();
  var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
  chart.draw(data, {width: 400, height: 240, is3D: true});
}