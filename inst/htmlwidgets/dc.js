HTMLWidgets.widget({

  name: 'dc',

  type: 'output',

  initialize: function(el, width, height) {
    
    window.onload = function(x) {
      dc.renderAll();
    }

    return {
      // TODO: add instance fields as required
    }

  },

  renderValue: function(el, x, instance) {
    var data = HTMLWidgets.dataframeToD3(x.data);
    window.data = data;
    
    dcStock(data, x.chartRecipe, el.id, el.offsetWidth, el.offsetHeight, x.xlim);
  },

  resize: function(el, width, height, instance) {

  }

});
