// addTooltips() is from https://www.jqueryscript.net/tooltip/HTML5-Tooltip-Follow-Cursor-jQuery.html
// TOX: slightly modified to suit my needs and my preferred coding style
function addTooltips() 
{
    $('[data-tooltip]').hover(
        function()
        {
            $('<div class="div-tooltip"></div>').html($(this).attr('data-tooltip')).appendTo('body').fadeIn('slow');
            $('#graph').html($(this).attr('data-graph')).fadeIn('slow');
            $('#graph').css({ paddingTop: 10, paddingBottom: 10, height: Config.graphHeight + 25 });
        }, 
        function() 
        { 
            $('.div-tooltip').remove();
          //  $('#graph').remove();
        }
    ).mousemove(
        function(e) 
        {
            $('.div-tooltip').css({ top: e.pageY + 10, left:  e.pageX + 20 });
        }
    );
}

function formatToolTip(dataTable, row)
{
    var fmt = function (label, curr, last) 
    {
        var changeAbs = Math.absoluteChange(last, curr);
        var change    = Math.percentageChange(last, curr);
        var daysUntilDoubled = Math.doublingInXDays(last, curr);
        changeAbs = last.format() + ((parseFloat(changeAbs) >= 0) ? '+' : '') + changeAbs.format()  + " = " + curr.format();

        return "<b>" + label + "</b>: " + changeAbs.replace(/([\-\+\=])/g, ' $1 ') + " (" + (parseFloat(change) > 0 ? '+' : '') + change.toPercent(undefined, 2) + (Number.isFinite(daysUntilDoubled) ? ", "+ (parseFloat(change) > 0 ? 'doubles' : 'halves')+" in approx. "+(parseFloat(change) > 0 ? daysUntilDoubled.toFixed(2) : -daysUntilDoubled.toFixed(2))+" days" : '') + ")";
    };

    var country      = dataTable.cell(row, 0).text();
    
    var population   = Number(dataTable.cell(row, 1).text());
    
    var infCurr      = Number(dataTable.cell(row, 2).text());
    var infLast      = Number(dataTable.cell(row, 3).text());

    var fatCurr      = Number(dataTable.cell(row, 5).text());
    var fatLast      = Number(dataTable.cell(row, 6).text());

    var infStats = Math.entirePopulationAffectedInXDays(population, infLast, infCurr).round(0);

    var data = CoronaTracker.data[Config.alias(country.replace(/(.*)\s+\[.*?\]/g, '$1'))];
    var graph = new Graph(data);
    var gdata = graph.generate();
    var gdataChange = graph.generateChangesGraph();

    var activeCurr = graph.confirmed.last(1) - graph.recovered.last(1);
    var activeLast = graph.confirmed.last(2) - graph.recovered.last(2);

    var tooltipText = "<b>" + country + "</b><br><br>"+
                      "<b>Population</b>: " + population.format() + " (" + (infCurr / population).toPercent() + " have been infected, " + (activeCurr / population).toPercent() + " are active cases, " + (fatCurr / population).toPercent() + " died)<br>" +
                      fmt('Confirmed', infCurr, infLast) + "<br>" + 
                      fmt('Deaths', fatCurr, fatLast) + "<br>" + 
                      (
                        country == 'TOTAL' ? '' : (
                            fmt('Active Cases (estimated)', activeCurr, activeLast) + "<br>" 
                            /*
                            +
                            "<br>"+ 
                            "<b>First infection</b>: " + graph.first.confirmed + " days ago<br>" + 
                            "<b>First death</b>: " + graph.first.death + " days ago<br>" + 
                            "<b>First recovery</b>: " + (graph.first.recovered > 1 ? graph.first.recovered + " days ago" : "N/A")
                            */
                          )
                      ) + 
                      "<br>" + (infStats > 0 && Number.isFinite(infStats) ? "<br>At the current rate the entire population would be infected in approx. " + infStats + " days.<br>" : '');

    $(row).attr('data-tooltip', tooltipText);
    $(row).attr('data-graph', "<div style='width:50%;float:left;'><b style='color:white;'>Total</b><br>" + gdata + "</div><div style='width:50%;float:left;'><b style='color:white;'>Daily Change</b><br>" + gdataChange + "</div>");
}
