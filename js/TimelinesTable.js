class TimelinesTable
{
    static filter(event)
    {       
        TimelinesTable.generate(CoronaTracker.timelinesData.sort().filter(0, event.target.value));
    }

    static loadDataAttributes() {
        $('#tooltip').html($(this).attr('data-tooltip')).fadeIn('slow');
        $('#pageTitle').html($(this).attr('data-country')).fadeIn('slow');
        $('#pageTitleRegion').html($(this).attr('data-region')).fadeIn('slow');
        $('#pageTitlePopulation').html(Number($(this).attr('data-population')).format() + " ppl").fadeIn('slow');

        var chartTotals = new Chart(
            document.getElementById("chartTotals"), 
            Graph.generateData(
                'Totals', 
                $(this).attr('data-infected').split(','), 
                $(this).attr('data-recovered').split(','), 
                $(this).attr('data-active').split(','), 
                $(this).attr('data-deaths').split(','), 
                0, 
                'right'
            )
        );            
        var chartDaily  = new Chart(
            document.getElementById("chartDaily"), 
            Graph.generateData(
                'Daily Change', 
                $(this).attr('data-daily-infected').split(','), 
                $(this).attr('data-daily-recovered').split(','), 
                $(this).attr('data-daily-active').split(','),
                $(this).attr('data-daily-deaths').split(','),
            )
        );
    }

    static generateOverviewText(c) {
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
                pop.toPercent(),
                changeAbs.replace(/([\-\+\=])/g, ' $1 '), 
                (parseFloat(change) > 0 ? '+' : '-') + Math.abs(change).toPercent(undefined, 2), 
                (Number.isFinite(daysUntilDoubled) ? (parseFloat(change) > 0 ? 'doubles' : 'halves') + " in "+(parseFloat(change) > 0 ? daysUntilDoubled.toFixed(2) : -daysUntilDoubled.toFixed(2))+" days" : '')
            );
        };

        var infStats = Math.entirePopulationAffectedInXDays(c.population, c.infected.total.last(1), c.infected.total.last()).round(0);

        return  fmtRow('Population', '', c.population.format(), '', '') +
                fmt('Infections', c.infected.total.last(), c.infected.total.last(1), c.population_infected) + 
                fmt('Active Cases (estimated)', c.active.total.last(), c.active.total.last(1), c.population_active) + 
                fmt('Recovered (estimated)', c.recovered.total.last(), c.recovered.total.last(1), c.population_recovered) + 
                fmt('Deaths', c.deaths.total.last(), c.deaths.total.last(1), c.population_deaths) + 
                (infStats > 0 && Number.isFinite(infStats) ? "<br>At the current rate the entire population would be infected in approx. " + infStats + " days.<br>" : '');
    }

    static setDataAttributes(c) {
        return  ' data-region="' + c.region + '" ' +
                ' data-population="' + c.population + '" ' +
                ' data-country="' + c.country + '" ' +
                ' data-infected="' + c.infected.total + '" ' +
                ' data-deaths="' + c.deaths.total + '" ' +
                ' data-recovered="' + c.recovered.total + '" ' +
                ' data-active="' + c.active.total + '" ' +
                ' data-daily-infected="' + c.infected.change + '" ' +
                ' data-daily-deaths="' + c.deaths.change + '" ' +
                ' data-daily-recovered="' + c.recovered.change + '" ' +
                ' data-daily-active="' + c.active.change + '" ' +
                ' data-tooltip="' + this.generateOverviewText(c) + '" ';
    }

    static generateHeaderGroups(timelines) {
        var headerGroups = [];

        for (var i = 0; i < timelines.headerGroups.length; i++) {
            headerGroups.push(timelines.headerGroups[i].html());
        }
        return headerGroups.join('');
    }

    static generateHeader(timelines) {
        var header = [];

        for (var i = 0; i < timelines.header.length; i++) {
            header.push('<th>' +  timelines.header[i] + '</th>');
        }
        return header.join('');
    }

    static updateHeader(timelines) {
        var cols = $('#data > thead > tr:nth-child(2) > th');
        for (var i = 0; i < cols.length; i++) {
            $(cols[i]).removeClass('sort-asc').removeClass('sort-desc');
            if (timelines.sortInfo.index == i)
                $(cols[i]).addClass('sort-' + timelines.sortInfo.direction);

            $(cols[i]).off("click").click(
                { 
                    oldIndex: timelines.sortInfo.index,
                    index: i, 
                    direction: timelines.sortInfo.direction
                }, 
                function (event) { 
                    if (event.data.oldIndex == event.data.index)
                        event.data.direction = event.data.direction == 'asc' ? 'desc' : 'asc';

                    URL.updateLink(event.data);
                    TimelinesTable.generate(CoronaTracker.timelinesData.sort().filter(0));
                }
            );
        }
    }

    static generateBody(timelines) {
        var body = [];
        var country;
        var c;
        var row;
        for (var i = 0; i < timelines.data.length; i++) {
            country = timelines.data[i][0];
            c = CoronaTracker.timelines[country];

            row = [ '<tr' + TimelinesTable.setDataAttributes(c) + '>' ];
            for (var j = 0; j < TimelinesDataColumns.columns.length; j++) {
                row.push(TimelinesDataColumns.columns[j].html(timelines.data[i][j]));
            }
            row.push('</tr>');
            body.push(row.join(''));
        }
        return body.join('');
    }

    static updateBody(timelines) {
        var rows = $('#data > tbody > tr');
        var rowsNew = [];
        var country;
        var j;

        for (var i = 0; i < timelines.data.length; i++) {
            country = timelines.data[i][0];
            j = 0;
            for (j; j < rows.length; j++) {
                if ($(rows[j]).attr('data-country') == country)
                    break; 
            }
            $(rows[j]).attr('data-hidden', !timelines.visible[i]);
            rowsNew.push(rows[j].outerHTML);
        }

        $("#data > tbody").html(rowsNew.join(''));
    }

    static generate(timelines, fullUpdate) {
        if (fullUpdate == undefined)
            fullUpdate = false;
        
        var t = $('#data');

        if (t.length == 0)
        {
            $('#datacontainer').html("<table id='data'><thead></thead><tbody></tbody></table>"); 
            $('#data > thead').html(
                '<tr>' + TimelinesTable.generateHeaderGroups(timelines) + '</tr>' +
                '<tr>' + TimelinesTable.generateHeader(timelines) + '</tr>'
            );
            // $('#data > thead > tr').html(TimelinesTable.generateHeader(timelines));
            $('#search').val(URL.get().filter);
            $('#search').keyup(TimelinesTable.filter);
        }
        TimelinesTable.updateHeader(timelines);
        
        if (t.length == 0 || fullUpdate)
            $('#data > tbody').html(TimelinesTable.generateBody(timelines));
        
        TimelinesTable.updateBody(timelines);

        $('[data-country]').hover(TimelinesTable.loadDataAttributes);

        URL.updateLink(timelines.sortInfo);
    }
}
