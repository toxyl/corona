// addTooltips() is from https://www.jqueryscript.net/tooltip/HTML5-Tooltip-Follow-Cursor-jQuery.html
// TOX: slightly modified to suit my needs and my preferred coding style
function addTooltips() 
{
    $('[data-tooltip]').hover(
        function()
        {
            $('#tooltip').html($(this).attr('data-tooltip')).fadeIn('slow');
            $('#pageTitle').html($(this).attr('data-country')).fadeIn('slow');

            var di = $(this).attr('data-infected').split(',');
            var dr = $(this).attr('data-recovered').split(',');
            var da = $(this).attr('data-active').split(',');
            var dd = $(this).attr('data-deaths').split(',');

            var ddi = $(this).attr('data-daily-infected').split(',');
            var ddr = $(this).attr('data-daily-recovered').split(',');
            var dda = $(this).attr('data-daily-active').split(',');
            var ddd = $(this).attr('data-daily-deaths').split(',');

            ddi.pop();
            ddr.pop();
            dda.pop();
            ddd.pop();

            $('#graphcontainer1').css({ height: Config.graphHeight + 25 });
            $('#graphcontainer2').css({ height: Config.graphHeight + 25 });

            var chartTotals = new Chart(document.getElementById("chartTotals"), Graph.generateData('Totals', di, dr, da, dd, 0, 'right'));            
            var chartDaily  = new Chart(document.getElementById("chartDaily"), Graph.generateData('Daily Change', ddi, ddr, dda, ddd));
        }, 
        function() 
        { 
            // $('.div-tooltip').remove();
        }
    ).mousemove(
        function(e) 
        {
            // $('.div-tooltip').css({ top: e.pageY + 10, left:  e.pageX + 20 });
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
    if (country == 'TOTAL') return;
    
    var population   = Number(dataTable.cell(row, 1).text());
    
    var infCurr      = Number(dataTable.cell(row, 2).text());
    var infLast      = Number(dataTable.cell(row, 3).text());

    var fatCurr      = Number(dataTable.cell(row, 5).text());
    var fatLast      = Number(dataTable.cell(row, 6).text());

    var infStats = Math.entirePopulationAffectedInXDays(population, infLast, infCurr).round(0);

    var graph = new Graph(country);

    var activeCurr = graph.confirmed.last(1) - graph.recovered.last(1);
    var activeLast = graph.confirmed.last(2) - graph.recovered.last(2);

    var tooltipText = "<b>Population</b>: " + population.format() + " (" + (infCurr / population).toPercent() + " have been infected, " + (activeCurr / population).toPercent() + " are active cases, " + (fatCurr / population).toPercent() + " died)<br>" +
                      fmt('Confirmed', infCurr, infLast) + "<br>" + 
                      fmt('Deaths', fatCurr, fatLast) + "<br>" + 
                      fmt('Active Cases (estimated)', activeCurr, activeLast) + "<br>" + 
                      (infStats > 0 && Number.isFinite(infStats) ? "<br>At the current rate the entire population would be infected in approx. " + infStats + " days.<br>" : '');

    $(row).attr('data-tooltip', tooltipText);
    $(row).attr('data-infected', graph.confirmed);
    $(row).attr('data-deaths', graph.deaths);
    $(row).attr('data-recovered', graph.recovered);
    $(row).attr('data-active', graph.active);    
    $(row).attr('data-daily-infected', graph.confirmedChangeAbs);
    $(row).attr('data-daily-deaths', graph.deathsChangeAbs);
    $(row).attr('data-daily-recovered', graph.recoveredChangeAbs);
    $(row).attr('data-daily-active', graph.activeChangeAbs);
    $(row).attr('data-country', country);
}
