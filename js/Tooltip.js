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

            // $('#graphcontainer1').css({ height: Config.graphHeight + 25 });
            // $('#graphcontainer2').css({ height: Config.graphHeight + 25 });

            var chartTotals = new Chart(document.getElementById("chartTotals"), Graph.generateData('Totals', di, dr, da, dd, 0, 'right'));            
            var chartDaily  = new Chart(document.getElementById("chartDaily"), Graph.generateData('Daily Change', ddi, ddr, dda, ddd));
        }
    );
}

function formatToolTip(dataTable, row)
{
    var fmtRow = function (label, column1, column2, column3, column4) 
    {
        return "<div><span class='tooltipColumnLabel'><b>" + label + "</b></span>" + 
               "<span class='tooltipColumn1'>" + column1 + "</span>" +
               "<span class='tooltipColumn2'>" + column2 + "</span>" +
               "<span class='tooltipColumn3'>" + column3 + "</span>" +
               "<span class='tooltipColumn4'>" + column4 + "</span></div>";
    };

    var fmt = function (label, curr, last, pop) 
    {
        var changeAbs = Math.absoluteChange(last, curr);
        var change    = Math.percentageChange(last, curr);
        var daysUntilDoubled = Math.doublingInXDays(last, curr);
        changeAbs = last.format() + ((parseFloat(changeAbs) >= 0) ? '+' : '') + changeAbs.format()  + " = " + curr.format();

        return fmtRow(
            label, 
            (curr / pop).toPercent(),
            changeAbs.replace(/([\-\+\=])/g, ' $1 '), 
            (parseFloat(change) > 0 ? '+' : '-') + Math.abs(change).toPercent(undefined, 2), 
            (Number.isFinite(daysUntilDoubled) ? (parseFloat(change) > 0 ? 'doubles' : 'halves') + " in "+(parseFloat(change) > 0 ? daysUntilDoubled.toFixed(2) : -daysUntilDoubled.toFixed(2))+" days" : '')
        );
    };

    var country      = dataTable.cell(row, Config.colIDs.COUNTRY).text();
    if (country == 'TOTAL') return;
    
    var population   = Number(dataTable.cell(row, Config.colIDs.POPULATION).text());
    
    var infCurr      = Number(dataTable.cell(row, Config.colIDs.INFECTIONS).text());
    var infLast      = Number(dataTable.cell(row, Config.colIDs.INFECTIONS_LAST).text());

    var fatCurr      = Number(dataTable.cell(row, Config.colIDs.DEATHS).text());
    var fatLast      = Number(dataTable.cell(row, Config.colIDs.DEATHS_LAST).text());

    var recCurr      = Number(dataTable.cell(row, Config.colIDs.RECOVERED).text());
    var recLast      = Number(dataTable.cell(row, Config.colIDs.RECOVERED_LAST).text());

    var actCurr      = Number(dataTable.cell(row, Config.colIDs.ACTIVE).text());
    var actLast      = Number(dataTable.cell(row, Config.colIDs.ACTIVE_LAST).text());

    var infStats     = Math.entirePopulationAffectedInXDays(population, infLast, infCurr).round(0);

    var graph        = new Graph(country);


    var tooltipText = fmtRow('Population', '', population.format(), '', '') +
                      fmt('Infections', infCurr, infLast, population) + 
                      fmt('Active Cases (estimated)', actCurr, actLast, population) + 
                      fmt('Recovered (estimated)', recCurr, recLast, population) + 
                      fmt('Deaths', fatCurr, fatLast, population) + 
                      (infStats > 0 && Number.isFinite(infStats) ? "<br>At the current rate the entire population would be infected in approx. " + infStats + " days.<br>" : '');

    $(row).attr('data-country',         country);
    $(row).attr('data-tooltip',         tooltipText);
    $(row).attr('data-infected',        graph.confirmed);
    $(row).attr('data-deaths',          graph.deaths);
    $(row).attr('data-recovered',       graph.recovered);
    $(row).attr('data-active',          graph.active);    
    $(row).attr('data-daily-infected',  graph.confirmedChangeAbs);
    $(row).attr('data-daily-deaths',    graph.deathsChangeAbs);
    $(row).attr('data-daily-recovered', graph.recoveredChangeAbs);
    $(row).attr('data-daily-active',    graph.activeChangeAbs);
}
