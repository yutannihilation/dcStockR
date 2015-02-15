HTMLWidgets.widget({

  name: 'dc',

  type: 'output',

  initialize: function(el, width, height) {

    return {
      // TODO: add instance fields as required
    }

  },

  renderValue: function(el, x, instance) {
    var chart   = dc.barChart('#' + el.id),
        data    = crossfilter(HTMLWidgets.dataframeToD3(x.data)),
        params  = x.params,
        dimension = data.dimension(x.dimensionFnc),
        group   = dimension.group().reduceSum(x.groupFnc);
    
    chart
      .dimension(dimension)
      .group(group);
        
    for (var fncName in params){
      // chart.fncName(args) by function name
      chart = chart[fncName](params[fncName]);
    }

    window.chart = chart;
    window.mmm = data;
    
    chart.render();

  },

  resize: function(el, width, height, instance) {

  }

});
