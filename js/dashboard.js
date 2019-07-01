var dynamicChart;
var channelsLoaded = 0;
var channel = {
  channelNumber: 621494,
  name: 'Broadband Speedtest Logger',
  key: 'XXXXXXXXXXXXXXXX',
  fieldList: [
    { field: 1, axis: 'D' },
    { field: 2, axis: 'U' },
    { field: 3, axis: 'P' }
  ]
};

var tzOffset = new Date().getTimezoneOffset() * 60000;

function getChartDate(d) {
  // get the data using javascript's date object (year, month, day, hour, minute, second)
  // months in javascript start at 0, so remember to subtract 1 when specifying the month
  // offset in minutes is converted to milliseconds and subtracted so that chart's x-axis is correct
  return Date.UTC(
    d.substring(0, 4),
    d.substring(5, 7) - 1,
    d.substring(8, 10),
    d.substring(11, 13),
    d.substring(14, 16),
    d.substring(17, 19)) - tzOffset;
}

$(document).ready(function() {
  $.ajaxSetup({ cache: false });

  var last_date;
  var seriesCounter = 0
  for (var fieldIndex = 0; fieldIndex < channel.fieldList.length; fieldIndex++) {
    channel.fieldList[fieldIndex].series = seriesCounter;
    seriesCounter++;
  }
  channel.loaded = false;
  loadThingSpeakChannel(channel.channelNumber, channel.key, channel.fieldList);

  function loadThingSpeakChannel(channelNumber, key, sentFieldList) {
    var fieldList = sentFieldList;
    $.getJSON('https://api.thingspeak.com/channels/' + channelNumber + '/feed.json?round=3&results=169&api_key=' + key, function(data) {
        if (data == '-1') {
          $('#chart-container').append('This channel is not public.  To embed charts, the channel must be public or a read key must be specified.');
          console.log('Thingspeak Data Loading Error');
        }

        for (var fieldIndex = 0; fieldIndex < fieldList.length; fieldIndex++) {
          fieldList[fieldIndex].data = [];
          var field = "field" + fieldList[fieldIndex].field;
          for (var h = 0; h < data.feeds.length; h++) {
            var v = data.feeds[h][field];
            var p = [getChartDate(data.feeds[h].created_at), parseFloat(v)];
            if (!isNaN(p[1])) {
              fieldList[fieldIndex].data.push(p);
            }
          }
          fieldList[fieldIndex].name = data.channel[field];
        }
        channel.fieldList = fieldList;
        channel.loaded = true;
        $("#controls").show();
        createChart();
      })
      .fail(function() {
        alert('getJSON request failed! ');
      });
  }

  function updateChannel(channel) {
    $.getJSON('https://api.thingspeak.com/channels/' + channel.channelNumber + '/feed/last.json?round=3&location=false&api_key=' + channel.key, function(data) {
      for (var fieldIndex = 0; fieldIndex < channel.fieldList.length; fieldIndex++) {
        var field = "field" + channel.fieldList[fieldIndex].field;
        if (data && data[field]) {
          var chartSeriesIndex = channel.fieldList[fieldIndex].series;
          var v = data[field];
          var p = [getChartDate(data.created_at), parseFloat(v)];
          if (dynamicChart.series[chartSeriesIndex].data.length > 0) {
            last_date = dynamicChart.series[chartSeriesIndex].data[dynamicChart.series[chartSeriesIndex].data.length - 1].x;
          }
          if (!isNaN(p[1]) && p[0] != last_date) {
            dynamicChart.series[chartSeriesIndex].addPoint(p, true, false /* shift */);
          }
        }
      }
    });
  }

  function createChart() {
    var chartOptions = {
      colors: [ '#2b908f33', '#f7a35c', '#492970'],
      chart: {
        renderTo: 'chart-container',
        zoomType: 'xy',
        events: {
          load: function() {
            setInterval(function() {
              // If the update checkbox is checked, get latest data every 300 seconds and add it to the chart
              if (document.getElementById("auto-update").checked) {
                updateChannel(channel);
              }
            }, 300000);
          }
        }
      },
      rangeSelector: {
        buttons: [
          { count:  1, type: 'day',    text: 'D' },
          { count:  1, type: 'week',   text: 'W' },
          { count:  1, type: 'month',  text: 'M' },
          { count:  1, type: 'year',   text: 'Y' },
          {            type: 'all', text: 'All' }
        ],
        inputEnabled: true,
        selected: 2
      },
      plotOptions: {
        line: {
          gapSize: 5
        },
        series: {
          marker: {
            radius: 2
          },
          animation: true,
          step: false,
          turboThrehold: 1000,
          borderWidth: 0
        }
      },
      xAxis: {
        type: 'datetime',
        title: {
          text: 'Time'
        }
      },
      yAxis: [
        { id: 'D', title: { text: 'Speed (Mb/sec)' }, opposite: false, lineWidth: 1, min: 0, max: 120, labels: { format: '{value:.3f}' } },
        { id: 'U', visible: false, title: { text: 'Upload (Mb/sec)' }, opposite: false, lineWidth: 1, min: 0, max: 120, labels: { format: '{value:.3f}' } },
        { id: 'P', title: { text: 'Ping (ms)' }, opposite: true, min: 0, max: 50, labels: { format: '{value:.3f}' } }
      ],
      exporting: {
        enabled: true,
        csv: {
          dateFormat: '%d/%m/%Y %I:%M:%S %p'
        }
      },
      legend: {
        enabled: true
      },
      navigator: {
        baseSeries: 0,
        series: {
          includeInCSVExport: false
        }
      },
      series: []
    };

    for (var fieldIndex = 0; fieldIndex < channel.fieldList.length; fieldIndex++) {
      var field = channel.fieldList[fieldIndex];
      var nameParts = /(.*) \((.*)\)/g.exec(field.name);
      chartOptions.series.push({
        type: field.axis === 'P' ? 'spline' : 'area',
        data: field.data,
        index: field.series,
        yAxis: field.axis,
        name: nameParts[1],
        tooltip: {
          valueDecimals: 3,
          valueSuffix: ' ' + nameParts[2]
        }
      });
    }

    dynamicChart = new Highcharts.StockChart(chartOptions);

    for (var fieldIndex = 0; fieldIndex < channel.fieldList.length; fieldIndex++) {
      for (var seriesIndex = 0; seriesIndex < dynamicChart.series.length; seriesIndex++) {
        if (dynamicChart.series[seriesIndex].name == channel.fieldList[fieldIndex].name) {
          channel.fieldList[fieldIndex].series = seriesIndex;
        }
      }
    }
    loadChannelHistory(channel.channelNumber, channel.key, channel.fieldList);
  }
});

function loadOneChannel() {
  loadChannelHistory(channel.channelNumber, channel.key, channel.fieldList);
}

function loadChannelHistory(channelNumber, key, sentFieldList) {
  dynamicChart.showLoading("Loading History..." );
  var fieldList = sentFieldList;
  var first_Date = new Date();
  if (typeof fieldList[0].data[0] != "undefined")      first_Date.setTime(fieldList[0].data[0][0]);
  else if (typeof fieldList[1].data[0] != "undefined") first_Date.setTime(fieldList[1].data[0][0]);
  else if (typeof fieldList[2].data[0] != "undefined") first_Date.setTime(fieldList[2].data[0][0]);
  else if (typeof fieldList[3].data[0] != "undefined") first_Date.setTime(fieldList[3].data[0][0]);
  else if (typeof fieldList[4].data[0] != "undefined") first_Date.setTime(fieldList[4].data[0][0]);
  else if (typeof fieldList[5].data[0] != "undefined") first_Date.setTime(fieldList[5].data[0][0]);
  else if (typeof fieldList[6].data[0] != "undefined") first_Date.setTime(fieldList[6].data[0][0]);
  else if (typeof fieldList[7].data[0] != "undefined") first_Date.setTime(fieldList[7].data[0][0]);
  var end = first_Date.toJSON();
  $.getJSON('https://api.thingspeak.com/channels/' + channelNumber + '/feed.json?round=3&start=2016-11-23T00:00:00&end=' + end + '&api_key=' + key, function(data) {
    dynamicChart.hideLoading();
    // if no access
    if (data == '-1') {
      $('#chart-container').append('This channel is not public.  To embed charts, the channel must be public or a read key must be specified.');
      console.log('Thingspeak Data Loading Error');
    }
    for (var fieldIndex = 0; fieldIndex < fieldList.length; fieldIndex++) {
      for (var h = 0; h < data.feeds.length; h++) {
        var field = "field" + fieldList[fieldIndex].field;
        var v = data.feeds[h][field];
        var p = [getChartDate(data.feeds[h].created_at), parseFloat(v)];
        if (!isNaN(p[1])) {
          fieldList[fieldIndex].data.push(p);
        }
      }
      fieldList[fieldIndex].data.sort(function(a, b) {
        return a[0] - b[0]
      });
      dynamicChart.series[fieldList[fieldIndex].series].setData(fieldList[fieldIndex].data, false);
    }
    channel.fieldList = fieldList;
    dynamicChart.redraw()
  });
}
