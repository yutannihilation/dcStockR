HTMLWidgets.widget({

  name: 'dc',

  type: 'output',

  initialize: function(el, width, height) {
    
    if(!window.__ndx) {
      window.__ndx = {};
    }
    
    if(!window.__dimension) {
      window.__dimension = {};
    }
    
    window.onload = function() {
      dc.renderAll();
    }

    return {
      // TODO: add instance fields as required
    }

  },

  renderValue: function(el, x, instance) {
    var data = HTMLWidgets.dataframeToD3(x.data);
    var dateFormat = d3.time.format('%Y-%m-%d');
    var numberFormat = d3.format('.2f');

    if(!window.__ndx[x.datahash]) {
      data.forEach(function(d) {
        d.dd = dateFormat.parse(d.date);
        d.month = d3.time.month(d.dd);
        d.close = +d.close;
        d.open = +d.open;
      });
      window.__ndx[x.datahash] = crossfilter(data);
    }
    
    var maybe_title = el.getElementsByClassName('title');
    if(maybe_title.length == 1) {
      maybe_title[0].textContent = x.title;
    }
    
    dcStock(x.datahash, x.chartRecipe, el, el.offsetWidth - 20, el.offsetHeight - 20);
  },

  resize: function(el, width, height, instance) {

  }

});
