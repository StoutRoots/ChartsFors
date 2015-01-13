function setZoom(s, e) {
    var zoomedChart = $("#lineChartContainer #zoomedChart").dxChart("instance");
    zoomedChart.zoomArgument(s, e);
}

(function () {
    testmode = false;

//    function CSVToArray(strData, strDelimiter) {
//        strDelimiter = (strDelimiter || ",");
//        var objPattern = new RegExp(("(\\" + strDelimiter + "|\\r?\\n|\\r|^)(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
//        var arrData = [
//            []
//        ];

// New function reads data from google charts

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

        var arrMatches = null;
        while (arrMatches = objPattern.exec(strData)) {
            var strMatchedDelimiter = arrMatches[ 1 ];
            if (
                strMatchedDelimiter.length &&
                    (strMatchedDelimiter != strDelimiter)
                ) {
                arrData.push([]);
            }
            if (arrMatches[ 2 ]) {
                var strMatchedValue = arrMatches[ 2 ].replace(new RegExp("\"\"", "g"), "\"");
            } else {
                var strMatchedValue = arrMatches[ 3 ];
            }
            arrData[ arrData.length - 1 ].push(strMatchedValue);
        }
        return( arrData );
    }

    function getFileAsText(file, onload) {
        var reader = new FileReader();
        /*read into memory*/
        reader.readAsText(file);

        //handle success
        if (typeof  onload === 'function') {
            reader.onload = function (e) {
                onload(CSVToArray(e.target.result));
            };
        } else {
            reader.onload = function (e) {
                csvData.main = {data: CSVToArray(e.target.result)};
                drawMainChart();
            };
        }

        //handle errors
        reader.onerror = function (e) {
            console.log(e);
        };
    }

    function drawSmallChart(data, $target) {
        if (data.length) {

            var processedData = [];
            var k = data.length;

            for (var i = 1; i < k; i++)
                processedData.push({arg: parseFloat(data[i][0]), y1: parseFloat(data[i][1])});

            var logarithmic = isLogScale();
            var arrData = [];
            for (var i in processedData) {
                if (logarithmic) {
                    var filtered = {arg: processedData[i].arg}
                    for (var k in processedData[i]) {
                        if (processedData[i][k] >= 0) {
                            filtered[k] = processedData[i][k];
                        }
                    }
                    arrData.push(filtered);
                } else if (!logarithmic) {
                    arrData.push(processedData[i]);
                }
            }

            var color = getChartColor($target);
            var model = {
                chartOptions: {
                    dataSource: arrData,
                    useAggregation: true,
                    commonSeriesSettings: {
                        argumentField: 'arg',
                        point: {
                            visible: false
                        }
                    },
                    series: [
                        {
                            valueField: 'y1',
                            color: color
                        }
                    ],
                    legend: {
                        visible: false
                    },
                    argumentAxis: {
                        grid: { visible: false }
                    }
                }
            };

            if (logarithmic) {
                model.chartOptions.argumentAxis = {type: 'logarithmic'};
            }

            ko.cleanNode($target[0]);
            ko.applyBindings(model, $target[0]);

            $target
                .css({'background': '#F1F1F1', 'cursor': 'pointer'})
                .data('chartLineColor', color)
                .click(function () {
                    var $el = $(this);
                    csvData[$el.attr('id')] = {data: data, color: $el.data('chartLineColor')};
                    drawMainChart();
                });
        }
    }

    function changeGaugeValue(data, start, end) {
        var gauge = $("#gaugeChartContainer").dxCircularGauge("instance");

        var max = 0, min = 0;
        var n = data.length;
        for (var i = 0; i < n; i++) {
            if (data[i].arg > start && data[i].arg < end) {
                for (var s in data[i]) {
                    if (s !== 'arg') {
                        max = Math.max(max, data[i][s]);
                        min = Math.min(min, data[i][s]);
                    }
                }
            }

        }
        gauge.value(Math.max(Math.abs(min), Math.abs(max)));
    }

    var csvData = {};

    function drawMainChart() {
        var data = [], minMaxForSeries = {}, customChartsSeries = [];
        for (var s in csvData) {
            var l = csvData[s].data.length;
            minMaxForSeries[s] = {min: 0, max: 0};

            customChartsSeries.push({valueField: s, color: csvData[s].color});

            for (var i = 1; i < l; i++) {
                var v = csvData[s].data[i];

                data[v[0]] = data[v[0]] || {};
                data[v[0]].arg = data[v[0]][v[0]] || parseFloat(v[0]);
                data[v[0]][s] = parseFloat(v[1]);
            }
        }

        if (!customChartsSeries.length)
            return;

        var logarithmic = isLogScale();

        var arrData = [];
        for (var i in data) {
            var d = null;

            if (logarithmic) {
                var filtered = {arg: data[i].arg}
                for (var k in data[i]) {
                    if (data[i][k] >= 0) {
                        filtered[k] = data[i][k];
                    }
                }
                d = filtered;
            } else if (!logarithmic) {
                d = data[i];
            }

            for (var j in d) {
                if (j !== 'arg') {
                    minMaxForSeries[j].max = Math.max(minMaxForSeries[j].max, d[j]);
                }
            }

            arrData.push(d);
        }

        minMaxForSeries[s].max = Math.max(minMaxForSeries[s].max, v[1]);

        var model = {
            chartOptions: {
                useAggregation: true,
                commonSeriesSettings: {
                    argumentField: "arg",
                    point: {
                        visible: false
                    }
                },
                argumentAxis: {
                    minValueMargin: 0,
                    maxValueMargin: 0
                },
                dataSource: arrData,
                series: customChartsSeries,
                legend: {
                    visible: false
                },
                done: function () {
                    var $mainChartContainer = $("#lineChartContainer");
                    $mainChartContainer.append('<div id="rangeSelector" data-bind="dxRangeSelector: rangeOptions" style="height: 80px"></div>');

                    var data = $mainChartContainer.find("#zoomedChart").dxChart("instance")._dataSource._items
                    var model = {};
                    model.rangeOptions = {
                        size: {height: 120},
                        margin: {left: 10},
                        dataSource: data,
                        chart: {
                            commonSeriesSettings: {
                                argumentField: "arg",
                                point: {
                                    visible: false
                                }
                            },
                            series: customChartsSeries,
                            valueAxis: {type: 'logarithmic'}
                        },
                        behavior: {
                            animationEnabled: false,
                            snapToTicks: false,
                            allowSlidersSwap: false,
                            callSelectedRangeChanged: "onMoving"
                        },
                        selectedRangeChanged: function (e) {
                            var zoomedChart = $("#lineChartContainer #zoomedChart").dxChart("instance");
                            zoomedChart.zoomArgument(e.startValue, e.endValue);

                            changeGaugeValue(arrData, e.startValue, e.endValue);
                        }
                    };

                    ko.applyBindings(model, $('#rangeSelector')[0]);
                }
            }
        };

        if (logarithmic) {
            model.chartOptions.argumentAxis = {
                type: 'logarithmic'
            };
        }

        if (showGridLines()) {
            model.chartOptions.argumentAxis.grid = {};
            model.chartOptions.argumentAxis.grid.visible = true;
        }


        var $chartContainer = $("#lineChartContainer");
        $chartContainer.html('<div id="zoomedChart" data-bind="dxChart: chartOptions" style="height: 335px;margin: 0 0 15px"></div>');
        ko.cleanNode($chartContainer[0]);
        ko.applyBindings(model, $chartContainer[0]);


        var max = minMaxForSeries.main.max;
        /*gauge*/
        $('#gaugeChartContainer').dxCircularGauge({
            scale: {
                startValue: 0, endValue: max
            },
            value: max,
            title: {
                text: 'PGA',
                font: { size: 28 }
            }
        });

    }

    (function resizeCsvChartCanvas() {
        var $el = $('#csv-chart');
        var $parent = $el.parents('.third');
        $el.attr("width", $parent.width()).attr("height", $parent.height())
    })();


    function getChartColor($target) {
        var targetId = $target.attr('id');
        if (typeof targetId !== 'undefined' && chartsColors !== 'undefined' && chartsColors[targetId] !== 'undefined') {
            return  chartsColors[targetId];
        }
        return null;
    }

    function isLogScale() {
        return $('#chart-form #chart-regression-type').val() === 'log' ? true : false;
    }

    function showGridLines() {
        return $('#chart-form #chart-gridlines').is(':checked');
    }

    $('body')
        .on('change', '#chart-file', function () {
            getFileAsText($(this).prop('files')[0]);
        })
        .on('drawMainChart', function () {
            drawMainChart();
        })
        .on('change', '#chart-form #chart-regression-type', function () {
            $('body').trigger('drawMainChart');
            $('body').trigger('drawSmallChart');
        })
        .on('change', '#chart-form #chart-gridlines', function () {
            var chart = $('#zoomedChart').dxChart('instance');
            if (chart.option) {
                chart.option({
                    argumentAxis: {
                        grid: { visible: this.checked }
                    },
                    synchronizeMultiAxes: true
                });
            }
        });

    /*small charts*/
    $('.chart-file-input').change(function () {
        var $el = $(this);

        var color = $el.attr('data-color');
        var $target = $('#' + $el.attr('data-target'));

        if ($target.length) {
            getFileAsText($el.prop('files')[0], function (data) {

                $('body').on('drawSmallChart', function () {
                    drawSmallChart(data, $target, color);
                })

                drawSmallChart(data, $target, color);
            });
        } else {
            console.log('target for current file not found');
        }
    });

}());
