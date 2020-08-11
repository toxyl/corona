// addTooltips() is from https://www.jqueryscript.net/tooltip/HTML5-Tooltip-Follow-Cursor-jQuery.html
// TOX: slightly modified to suit my needs and my preferred coding style
function addTooltips() 
{
    $('[data-tooltip]').hover(
        function()
        {
            $('<div class="div-tooltip"></div>').html($(this).attr('data-tooltip')).appendTo('body').fadeIn('slow');
        }, 
        function() 
        { 
            $('.div-tooltip').remove();
        }
    ).mousemove(
        function(e) 
        {
            $('.div-tooltip').css({ top: e.pageY + 10, left:  e.pageX + 20 })
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

        return "<b>" + label + "</b>: " + changeAbs.replace(/([\-\+\=])/g, ' $1 ') + " (" + (parseFloat(change) > 0 ? '+' : '') + change.toPercent(undefined, 2) + (Number.isFinite(daysUntilDoubled) ? ", doubles in approx. "+daysUntilDoubled.toFixed(2)+" days" : '') + ")";
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
    
    var tooltipText = "<b>" + country + "</b><br><br>"+
                      "<b>Population</b>: " + population.format() + " (" + (infCurr / population).toPercent() + " infected, " + (fatCurr / population).toPercent() + " died)<br>" +
                      fmt('Confirmed', infCurr, infLast) + "<br>" + 
                      fmt('Deaths', fatCurr, fatLast) + "<br>" + 
                      (infStats > 0 && Number.isFinite(infStats) ? "<br>At the current rate the entire population would be infected in approx. " + infStats + " days.<br>" : '') + "<br>"+
                      graph.generate() + 
                      "<br><br>" + 
                      "First infection was registered " + graph.first.confirmed + " days ago.<br>" + 
                      "First death was registered " + graph.first.death + " days ago.<br><br>";

    $(row).attr('data-tooltip', tooltipText);
}
