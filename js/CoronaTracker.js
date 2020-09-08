class CoronaTracker
{
    static calculateChanges(country, timeline)
    {
        ObjectUtils.createKey(this.data, country, { confirmed: [], deaths: [], recovered: [] }, false);
        
        var v = this.timelines[country][timeline];
        var res = [ 0 ];
        var resPercent = [ 0 ];
        var resTotals = [ 0 ];
        var vPercent = 0;
        var vDelta = 0;
        var vCurr = 0;
        var vNext = 0;
        var vTotal = 0;
        for (var i = 0; i < v.length; i++)
        {
            vDelta = v.change(i).absolute;
            vPercent = v.change(i).relative;
            vTotal += vDelta;

            if (!Number.isFinite(vPercent))
                vPercent = 0;

            resTotals.push(vTotal)
            res.push(vDelta);
            resPercent.push(vPercent);
        }
        ObjectUtils.createKey(this.data[country], timeline, 
            { 
                absolute: res, 
                relative: resPercent, 
                total: resTotals 
            }, true);
    }

    static loadTimelines(loc)
    {
        ObjectUtils.createKey(this.timelines, loc.country, {}, false);
        ObjectUtils.addToKey(this.timelines[loc.country], 'confirmed', ObjectUtils.valuesAsc(loc.timelines.confirmed.timeline));
        ObjectUtils.addToKey(this.timelines[loc.country], 'deaths', ObjectUtils.valuesAsc(loc.timelines.deaths.timeline));
        ObjectUtils.addToKey(this.timelines[loc.country], 'recovered', ObjectUtils.valuesAsc(loc.timelines.recovered.timeline));
    }

    static latestOfTimeline(country, timeline, population)
    {
        var l = this.data[country][timeline];
        l.absolute.predict();
        l.relative.predict();
        l.total.predict();

        return {
            change: 
            {
                absolute: l.absolute.last(1),
                relative: l.relative.last(1),
            },
            total: 
            {
                absolute: 
                {
                    previous: l.total.last(2),
                    current: l.total.last(1),
                    next: l.total.last(),
                },
                relative:
                {
                    previous: l.relative.last(2),
                    current: l.relative.last(1),
                    next: l.relative.last(),
                }
            }
        };
    }

    static loadData(loc)
    {
        this.loadTimelines(loc);
        this.calculateChanges(loc.country, 'confirmed');
        this.calculateChanges(loc.country, 'deaths');
        this.calculateChanges(loc.country, 'recovered');
        var timeline = this.timelines[loc.country];
        var change = this.data[loc.country];
        this.data[loc.country].latest = {
            countryCode:        loc.country_code,
            population:         loc.country_population,
            caseFatalityRate:   Math.caseFatalityRate(timeline.confirmed.last(1), timeline.deaths.last(1)),
            infectionChance:    Math.infectionChance(timeline.confirmed.last(1), timeline.deaths.last(1), loc.country_population, 1),
            deaths:             this.latestOfTimeline(loc.country, 'deaths', loc.country_population),
            recovered:          this.latestOfTimeline(loc.country, 'recovered', loc.country_population),
            confirmed:          this.latestOfTimeline(loc.country, 'confirmed', loc.country_population),
        };
    }

    static loadDataSet(data)
    {
        for (var i=0; i < data.locations.length; i++)
        {
            this.loadData(data.locations[i]);
        }
        this.days = this.data.Netherlands.confirmed.total.length;
        this.day = this.days - 1;

        this.timelines = {};
    }

    static dataOfDay(country, day_offset)
    {
        if (day_offset == undefined) day_offset = 0;
        var day = day = this.days - 2 + day_offset;

        return {
            day: day,
            countryCode: this.data[country].latest.countryCode,
            population: this.data[country].latest.population - this.data[country].deaths.total[day],
            caseFatalityRate: Math.max(0, Math.caseFatalityRate(this.data[country].confirmed.total[day], this.data[country].deaths.total[day])),
            infectionChance:  Math.max(0, Math.infectionChance(this.data[country].confirmed.total[day], this.data[country].deaths.total[day], this.data[country].latest.population)),
            confirmed: {
                previous: this.data[country].confirmed.total[day-1],
                current: this.data[country].confirmed.total[day],
                change: {
                    absolute: this.data[country].confirmed.absolute[day],
                    relative: this.data[country].confirmed.relative[day],
                }
            },
            deaths: {
                previous: this.data[country].deaths.total[day-1],
                current: this.data[country].deaths.total[day],
                change: {
                    absolute: this.data[country].deaths.absolute[day],
                    relative: this.data[country].deaths.relative[day],
                }
            },
            recovered: {
                previous: this.data[country].recovered.total[day-1],
                current: this.data[country].recovered.total[day],
                change: {
                    absolute: this.data[country].recovered.absolute[day],
                    relative: this.data[country].recovered.relative[day],
                }
            },
        };
    }

    static yesterday(country) { return this.dataOfDay(country, -1); }
    static today(country)     { return this.dataOfDay(country); }
    static tomorrow(country)  { return this.dataOfDay(country, 1); }

    static tableRow(country)
    {
        var d = this.today(country);

        return [ 
            Config.alias(country) + ' ['+d.countryCode+']', 
            d.population, 
            d.confirmed.current, d.confirmed.previous, d.confirmed.change.relative,
            d.deaths.current, d.deaths.previous, d.deaths.change.relative,
            d.caseFatalityRate,
            d.infectionChance,
            d.infectionChance*10,
            d.infectionChance*50,
            d.infectionChance*100,
        ];
    }

    static mapRowsToIDs()
    {
        var rowMap = [];
        var rows = $('#data').stupidtable()[0].rows;
        var i = 1;
        for (i; i < rows.length; i++) {
            rowMap.push(rows[i].cells[0].textContent);
        }
        return rowMap;
    }

    static table(filter, sortCol, sortAscending)
    {
        $('#datacontainer').html('');
        var countries = Object.keys(this.data);
        var rows = [ ];
        var columns = Config.columns();
        var searchInput = "<input type='text' id='search' placeholder='filter' autofocus value="+filter+"></input>";

        for (var i = 0; i < countries.length; i++)
        {
            if (this.data[countries[i]].latest.population <= 0)
                continue;

            rows.push(this.tableRow(countries[i]));

        }

        if (sortAscending)  { rows.sort((a, b) => a[sortCol] - b[sortCol]); }
        else                { rows.sort((a, b) => b[sortCol] - a[sortCol]); }

        $('#datacontainer').append('<table id="datatotals" style="width:100%" class="shadow"><tbody><tr></tr></tbody></table>');
        $('#datacontainer').append('<table id="data" style="width:100%;margin-top: 10px;" class="shadow"><thead><tr></tr></thead><tbody></tbody></table>');

        for (var i = 0; i < columns.length; i++)
        {
            $('#data thead tr').append('<th data-sort="'+ columns[i].type + '" class="'+(sortCol == i ? 'sorting-' + (sortAscending ? 'asc' : 'desc') : '')+'">'+(i > 0 ? columns[i].name : searchInput)+'</th>');
            $('#datatotals tbody tr').append('<td>'+(i > 0 ? 0 : 'TOTAL')+'</td>');
        }

        for (var i = 0; i < rows.length; i++)
        {
            $('#data tbody').append('<tr><td>'+rows[i].join('</td><td>')+'</td></tr>');
        }

        this.tblTotal = new DataTable('#datatotals');
        this.tblData = new DataTable('#data');

        var rowIDs = this.mapRowsToIDs();
        $.each(rows, 
            function(key, v) 
            {
                var i = rowIDs.indexOf(v[0]);
                CoronaTracker.tblData.updateData(i, v[1], v[2], v[3], v[5], v[6]);
            }
        );

        CoronaTracker.tblData.initStupidTable();

        this.updateSort();

        $('#search').val(filter);
        $('#search').keyup(this.filter);
        $('#search').keyup();
        $(window).on('resize', this.syncTableColumnWidths);

        addTooltips();
    }

    static update(callback)
    {
        var loc;
        var loadData = function (data)
        {
            CoronaTracker.loadDataSet(data);
            callback(data);
        };

        $.getJSON(Config.apiURL, loadData);
    }

    static scheduleUpdate(timeFirst, timeNext)
    {
        setTimeout(function(){
            console.log('Running update...');
            CoronaTracker.update(
                function(data)
                {
                    var url = URL.get();
                    CoronaTracker.table(url.filter, url.sort.column, url.sort.ascending);
                }
            );
            CoronaTracker.scheduleUpdate(timeNext, timeNext);
        }, timeFirst);
    }

    static syncTableColumnWidths()
    {
        var ths = $(this.tblData).find('th'); 
        var cell;
        var cellSrc;
        var w = 0;
        for (var i = 0; i < ths.length; i++) 
        {
            cellSrc = $(ths[i]);
            w = cellSrc.outerWidth();
            cell = $($(this.tblTotal).find('td')[i]);
            cell.outerWidth(w); 
            cellSrc.outerWidth(w); 
        }
    }

    static updateSort(dontSort)
    {
        var sortInfo = this.tblData.getSortInfo();
        if (dontSort != true) this.tblData.sort(sortInfo.index, sortInfo.direction);
        URL.updateLink(sortInfo);
        $('#search').keyup();
        this.syncTableColumnWidths();
    }

    static filter(event)
    {
        var totals = {
            population: 0,
            infected: 0,
            infected_last: 0,
            dead: 0,
            dead_last: 0
        };

        var inList = function(text, list)
        {
            for (var i = 0; i < list.length; i++)
            {
                if (text.indexOf(list[i].trim()) > -1)
                    return true;    
            }
            return false;
        };
        
        var filter = event.target.value.toUpperCase().split(',');
        var rows = CoronaTracker.tblData.rows();

        for (var i = 0; i < rows.length; i++) 
        {
            if (inList(CoronaTracker.tblData.val(rows[i], 0).toUpperCase(), filter)) 
            {
                rows[i].style.display = "";
                totals.population    += CoronaTracker.tblData.valNumeric(rows[i], 1);
                totals.infected      += CoronaTracker.tblData.valNumeric(rows[i], 2);
                totals.infected_last += CoronaTracker.tblData.valNumeric(rows[i], 3);
                totals.dead          += CoronaTracker.tblData.valNumeric(rows[i], 5);
                totals.dead_last     += CoronaTracker.tblData.valNumeric(rows[i], 6);
            }
            else 
            {
                rows[i].style.display = "none";
            }      
        }
        
        CoronaTracker.tblTotal.updateData(0,     
            totals.population, 
            totals.infected,
            totals.infected_last,
            totals.dead,
            totals.dead_last
        );

        URL.updateLink();
    }
}

CoronaTracker.timelines = {};
CoronaTracker.data = {};
CoronaTracker.days = 0;
