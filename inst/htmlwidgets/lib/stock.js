'use strict';

/* jshint globalstrict: true */
/* global dc,d3,crossfilter,colorbrewer */

var dcStock = function(datahash, chartRecipe, divElem, width, height) {    
    var dateFormat = d3.time.format('%Y-%m-%d');
    var numberFormat = d3.format('.2f');

    var radius = Math.min(width, height) / 2;

    var divId = divElem.id;
        
    var ndx = window.__ndx[datahash];
    var all = ndx.groupAll();

    if(!window.__dimension['yearlyDimension' + datahash]) {
      window.__dimension['yearlyDimension' + datahash] = ndx.dimension(function(d) {
        return d3.time.year(d.dd).getFullYear();
      });
    }
    var yearlyDimension = window.__dimension['yearlyDimension' + datahash];
    
    var yearlyPerformanceGroup = yearlyDimension.group().reduce(
        function(p, v) {
            ++p.count;
            p.absGain += v.close - v.open;
            p.fluctuation += Math.abs(v.close - v.open);
            p.sumIndex += (v.open + v.close) / 2;
            p.avgIndex = p.sumIndex / p.count;
            p.percentageGain = (p.absGain / p.avgIndex) * 100;
            p.fluctuationPercentage = (p.fluctuation / p.avgIndex) * 100;
            return p;
        },
        function(p, v) {
            --p.count;
            p.absGain -= v.close - v.open;
            p.fluctuation -= Math.abs(v.close - v.open);
            p.sumIndex -= (v.open + v.close) / 2;
            p.avgIndex = p.sumIndex / p.count;
            p.percentageGain = (p.absGain / p.avgIndex) * 100;
            p.fluctuationPercentage = (p.fluctuation / p.avgIndex) * 100;
            return p;
        },
        function() {
            return {
                count: 0,
                absGain: 0,
                fluctuation: 0,
                fluctuationPercentage: 0,
                sumIndex: 0,
                avgIndex: 0,
                percentageGain: 0
            };
        }
    );
    
    if(!window.__dimension['dateDimension' + datahash]) {
      window.__dimension['dateDimension' + datahash] = ndx.dimension(function(d) {
        return d.dd;
      });
    }
    var dateDimension = window.__dimension['dateDimension' + datahash];

    var dd_extent = [dateDimension.bottom(1)[0].dd, dateDimension.top(1)[0].dd];
    
    if(!window.__dimension['moveMonths' + datahash]) {
      window.__dimension['moveMonths' + datahash] = ndx.dimension(function(d) {
        return d.month;
      });
    }
    var moveMonths = window.__dimension['moveMonths' + datahash];

    var monthlyMoveGroup = moveMonths.group().reduceSum(function(d) {
        return Math.abs(d.close - d.open);
    });

    var volumeByMonthGroup = moveMonths.group().reduceSum(function(d) {
        return d.volume / 500000;
    });

    var indexAvgByMonthGroup = moveMonths.group().reduce(
        function(p, v) {
            ++p.days;
            p.total += (v.open + v.close) / 2;
            p.avg = Math.round(p.total / p.days);
            return p;
        },
        function(p, v) {
            --p.days;
            p.total -= (v.open + v.close) / 2;
            p.avg = p.days ? Math.round(p.total / p.days) : 0;
            return p;
        },
        function() {
            return {
                days: 0,
                total: 0,
                avg: 0
            };
        }
    );
    
    if(!window.__dimension['gainOrLoss' + datahash]) {
      window.__dimension['gainOrLoss' + datahash] = ndx.dimension(function(d) {
        return d.open > d.close ? 'Loss' : 'Gain';
      });
    }
    var gainOrLoss = window.__dimension['gainOrLoss' + datahash];

    var gainOrLossGroup = gainOrLoss.group();


    if(!window.__dimension['fluctuation' + datahash]) {
      window.__dimension['fluctuation' + datahash] = ndx.dimension(function(d) {
        return Math.round((d.close - d.open) / d.open * 100);
      });
    }
    var fluctuation = window.__dimension['fluctuation' + datahash];
    
    var fluctuationGroup = fluctuation.group();


    if(!window.__dimension['quarter' + datahash]) {
      window.__dimension['quarter' + datahash] = ndx.dimension(function(d) {
        var month = d.dd.getMonth();
        if (month <= 2) {
            return 'Q1';
        } else if (month > 2 && month <= 5) {
            return 'Q2';
        } else if (month > 5 && month <= 8) {
            return 'Q3';
        } else {
            return 'Q4';
        }
      });
    }
    var quarter = window.__dimension['quarter' + datahash];
    
    var quarterGroup = quarter.group().reduceSum(function(d) {
        return d.volume;
    });

    if(!window.__dimension['dayOfWeek' + datahash]) {
      window.__dimension['dayOfWeek' + datahash] = ndx.dimension(function(d) {
        var day = d.dd.getDay();
        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return day + '.' + name[day];
      });
    }
    var dayOfWeek = window.__dimension['dayOfWeek' + datahash];
    
    var dayOfWeekGroup = dayOfWeek.group();

    if (chartRecipe == "yearlyBubbleChart") {

        dc.bubbleChart('#' + divId)
            .width(width)
            .height(height)
            .transitionDuration(1500)
            .margins({
                top: 10,
                right: 50,
                bottom: 30,
                left: 40
            })
            .dimension(yearlyDimension)
            .group(yearlyPerformanceGroup)
            .colors(colorbrewer.RdYlGn[9])
            .colorDomain([-500, 500])
            .colorAccessor(function(d) {
                return d.value.absGain;
            })
            .keyAccessor(function(p) {
                return p.value.absGain;
            })
            .valueAccessor(function(p) {
                return p.value.percentageGain;
            })
            .radiusValueAccessor(function(p) {
                return p.value.fluctuationPercentage;
            })
            .maxBubbleRelativeSize(0.3)
            .x(d3.scale.linear().domain([-2500, 2500]))
            .y(d3.scale.linear().domain([-100, 100]))
            .r(d3.scale.linear().domain([0, 4000]))
            .elasticY(true)
            .elasticX(true)
            .yAxisPadding(100)
            .xAxisPadding(500)
            .renderHorizontalGridLines(true)
            .renderVerticalGridLines(true)
            .xAxisLabel('Index Gain')
            .yAxisLabel('Index Gain %')
            .renderLabel(true)
            .label(function(p) {
                return p.key;
            })
            .renderTitle(true)
            .title(function(p) {
                return [
                    p.key,
                    'Index Gain: ' + numberFormat(p.value.absGain),
                    'Index Gain in Percentage: ' + numberFormat(p.value.percentageGain) + '%',
                    'Fluctuation / Index Ratio: ' + numberFormat(p.value.fluctuationPercentage) + '%'
                ].join('\n');
            })
            .yAxis().tickFormat(function(v) {
                return v + '%';
            });

    } else if (chartRecipe == "gainOrLossChart") {

        var gainOrLossChart = dc.pieChart('#' + divId);
        gainOrLossChart
            .width(width)
            .height(height)
            .radius(radius)
            .dimension(gainOrLoss)
            .group(gainOrLossGroup)
            .label(function(d) {
                if (gainOrLossChart.hasFilter() && !gainOrLossChart.hasFilter(d.key)) {
                    return d.key + '(0%)';
                }
                var label = d.key;
                if (all.value()) {
                    label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
                }
                return label;
            })
            /*
            .renderLabel(true)
            .innerRadius(40)
            .transitionDuration(500)
            .colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
            .colorDomain([-1750, 1644])
            .colorAccessor(function(d, i){return d.value;})
            */
        ;
    } else if (chartRecipe == "quarterChart") {

        dc.pieChart('#' + divId)
            .width(width)
            .height(height)
            .radius(radius)
            .innerRadius(radius / 3)
            .dimension(quarter)
            .group(quarterGroup);

    } else if (chartRecipe == "dayOfWeekChart") {

        dc.rowChart('#' + divId)
            .width(width)
            .height(height)
            .margins({
                top: 20,
                left: 10,
                right: 10,
                bottom: 20
            })
            .group(dayOfWeekGroup)
            .dimension(dayOfWeek)
            .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
            .label(function(d) {
                return d.key.split('.')[1];
            })
            .title(function(d) {
                return d.value;
            })
            .elasticX(true)
            .xAxis().ticks(4);

    } else if (chartRecipe == "fluctuationChart") {

        var fluctuationChart = dc.barChart('#' + divId);
        fluctuationChart
            .width(width)
            .height(height)
            .margins({
                top: 10,
                right: 50,
                bottom: 30,
                left: 40
            })
            .dimension(fluctuation)
            .group(fluctuationGroup)
            .elasticY(true)
            .centerBar(true)
            .gap(1)
            .round(dc.round.floor)
            .alwaysUseRounding(true)
            .x(d3.scale.linear().domain([-25, 25]))
            .renderHorizontalGridLines(true)
            .filterPrinter(function(filters) {
                var filter = filters[0],
                    s = '';
                s += numberFormat(filter[0]) + '% -> ' + numberFormat(filter[1]) + '%';
                return s;
            });


        fluctuationChart.xAxis().tickFormat(
            function(v) {
                return v + '%';
            });
        fluctuationChart.yAxis().ticks(5);

    } else if (chartRecipe == "moveChart") {
        
        var moveChartElem = document.createElement('div');
        moveChartElem.id = divId + 'moveChart';
        divElem.appendChild(moveChartElem);

        var volumeChartElem = document.createElement('div');
        volumeChartElem.id = divId + 'volumeChart';
        divElem.appendChild(volumeChartElem);

        var moveChart = dc.lineChart('#' + moveChartElem.id);
        var volumeChart = dc.barChart('#' + volumeChartElem.id);

        moveChart
            .renderArea(true)
            .width(width)
            .height(height - 40)
            .transitionDuration(1000)
            .margins({
                top: 30,
                right: 50,
                bottom: 25,
                left: 40
            })
            .dimension(moveMonths)
            .mouseZoomable(true)
            .rangeChart(volumeChart)
            .x(d3.time.scale().domain(dd_extent))
            .round(d3.time.month.round)
            .xUnits(d3.time.months)
            .elasticY(true)
            .renderHorizontalGridLines(true)
            .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
            .brushOn(false)
            .group(indexAvgByMonthGroup, 'Monthly Index Average')
            .valueAccessor(function(d) {
                return d.value.avg;
            })
            .stack(monthlyMoveGroup, 'Monthly Index Move', function(d) {
                return d.value;
            })
            .title(function(d) {
                var value = d.value.avg ? d.value.avg : d.value;
                if (isNaN(value)) {
                    value = 0;
                }
                return dateFormat(d.key) + '\n' + numberFormat(value);
            });

        volumeChart
            .width(width)
            .height(40)
            .margins({
                top: 0,
                right: 50,
                bottom: 20,
                left: 40
            })
            .dimension(moveMonths)
            .group(volumeByMonthGroup)
            .centerBar(true)
            .gap(1)
            .x(d3.time.scale().domain(dd_extent))
            .round(d3.time.month.round)
            .alwaysUseRounding(true)
            .xUnits(d3.time.months);

    } else if (chartRecipe == "dataCount") {

        dc.dataCount('#' + divId)
            .dimension(ndx)
            .group(all)
            .html({
                some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                    ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>Reset All</a>',
                all: 'All records selected. Please click on the graph to apply filters.'
            });

    } else if (chartRecipe == "dataTable") {
        var dataTableElem = document.createElement('table');
        dataTableElem.id = divId + 'dataTable';
        dataTableElem.className = 'table table-hover';
        
        divElem.appendChild(dataTableElem);

        dc.dataTable('#' + dataTableElem.id)
            .dimension(dateDimension)
            .group(function(d) {
                var format = d3.format('02d');
                return d.dd.getFullYear() + '/' + format((d.dd.getMonth() + 1));
            })
            .size(10)
            .columns([
                'date',
                'open',
                'close', {
                    label: 'Change',
                    format: function(d) {
                        return numberFormat(d.close - d.open);
                    }
                },
                'volume'
            ])
            .sortBy(function(d) {
                return d.dd;
            })
            .order(d3.ascending)
            .renderlet(function(table) {
                table.selectAll('.dc-table-group').classed('info', true);
            });

    } else {

        console.log("No such chartRecipe ", chartRecipe);

    }

    /*
    dc.geoChoroplethChart('#us-chart')
        .width(990)
        .height(500)
        .transitionDuration(1000)
        .dimension(states)
        .group(stateRaisedSum)
        .colors(['#ccc', '#E2F2FF','#C4E4FF','#9ED2FF','#81C5FF','#6BBAFF','#51AEFF','#36A2FF','#1E96FF','#0089FF',
            '#0061B5'])
        .colorDomain([-5, 200])
        .colorAccessor(function(d, i){return d.value;})
        .overlayGeoJson(statesJson.features, 'state', function(d) {
            return d.properties.name;
        })
        .title(function(d) {
            return 'State: ' + d.key + '\nTotal Amount Raised: ' + numberFormat(d.value ? d.value : 0) + 'M';
        });
        
        dc.bubbleOverlay('#bubble-overlay')
            .svg(d3.select('#bubble-overlay svg'))
            .width(990)
            .height(500)
            .transitionDuration(1000)
            .dimension(states)
                layer
            .group(stateRaisedSum)
            .keyAccessor(function(p) {return p.value.absGain;})
            .valueAccessor(function(p) {return p.value.percentageGain;})
            .colors(['#ccc', '#E2F2FF','#C4E4FF','#9ED2FF','#81C5FF','#6BBAFF','#51AEFF','#36A2FF','#1E96FF','#0089FF',
                '#0061B5'])
            .colorDomain([-5, 200])
            .colorAccessor(function(d, i){return d.value;})
            .radiusValueAccessor(function(p) {return p.value.fluctuationPercentage;})
            .r(d3.scale.linear().domain([0, 3]))
            .renderLabel(true)
            .label(function(p) {return p.key.getFullYear();})
            .renderTitle(true)
            .title(function(d) {
                return 'Title: ' + d.key;
            })
            .point('California', 100, 120)
            .point('Colorado', 300, 120)
            .debug(true);
    */

    dc.renderAll();
    /*

    dc.renderAll('group');


    dc.redrawAll();

    dc.redrawAll('group');
    */



    d3.selectAll('#version').text(dc.version);
};