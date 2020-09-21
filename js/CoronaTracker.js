class CoronaTracker
{
    static calculateChanges(country, timeline)
    {
        ObjectUtils.createKey(this.data, country, { confirmed: [], deaths: [], recovered: [], active: [] }, false);
        
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
        ObjectUtils.createKey(
            this.data[country],
            timeline, 
            { 
                absolute: res, 
                relative: resPercent, 
                total: resTotals 
            }, 
            true
        );
    }

    static loadTimelines(loc)
    {
        ObjectUtils.createKey(this.timelines, loc.country, {}, false);
        ObjectUtils.addToKey(this.timelines[loc.country], 'confirmed', ObjectUtils.valuesAsc(loc.timelines.confirmed.timeline));
        ObjectUtils.addToKey(this.timelines[loc.country], 'deaths', ObjectUtils.valuesAsc(loc.timelines.deaths.timeline));
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
        this.calculateChanges(loc.country, 'deaths');
        this.calculateChanges(loc.country, 'confirmed');
        
        var timeline = this.timelines[loc.country];

        timeline.recovered = Array.from(timeline.confirmed.delta(timeline.deaths, 14).exponentialAverage(0.25));
        timeline.active = Array.from(timeline.confirmed.delta(timeline.recovered).exponentialAverage(0.25));
        for (var i = 0; i < timeline.recovered.length; i++) {
            timeline.recovered[i] = Math.round(timeline.recovered[i]);
        }
        for (var i = 0; i < timeline.active.length; i++) {
            timeline.active[i] = Math.round(timeline.active[i]);
        }

        this.timelines[loc.country] = timeline;

        this.calculateChanges(loc.country, 'recovered');
        this.calculateChanges(loc.country, 'active');

        var change = this.data[loc.country];
        this.data[loc.country].latest = {
            countryCode:        loc.country_code,
            population:         loc.country_population,
            r0:                 Math.ratioNewToRecovered(timeline.active.last(1), timeline.recovered.last(1)),
            caseFatalityRate:   Math.caseFatalityRate(timeline.confirmed.last(1), timeline.deaths.last(1)),
            infectionChance:    Math.infectionChance(timeline.active.last(1), 0, loc.country_population, 1),
            confirmed:          this.latestOfTimeline(loc.country, 'confirmed', loc.country_population),
            deaths:             this.latestOfTimeline(loc.country, 'deaths', loc.country_population),
            recovered:          this.latestOfTimeline(loc.country, 'recovered', loc.country_population),
            active:             this.latestOfTimeline(loc.country, 'active', loc.country_population),
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
            r0:               Math.ratioNewToRecovered(this.data[country].active.relative[day], this.data[country].recovered.relative[day]),
            caseFatalityRate: Math.max(0, Math.caseFatalityRate(this.data[country].confirmed.total[day], this.data[country].deaths.total[day])),
            infectionChance:  Math.max(0, Math.infectionChance(this.data[country].active.total[day], 0, this.data[country].latest.population)),
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
            active: {
                previous: this.data[country].active.total[day-1],
                current: this.data[country].active.total[day],
                change: {
                    absolute: this.data[country].active.absolute[day],
                    relative: this.data[country].active.relative[day],
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
            
            d.confirmed.current,
            d.active.current, 
            d.recovered.current, 
            d.deaths.current,
            
            d.confirmed.previous,
            d.active.previous, 
            d.recovered.previous, 
            d.deaths.previous,
            
            d.confirmed.change.relative,
            d.active.change.relative,
            d.recovered.change.relative,
            d.deaths.change.relative,
            
            d.r0,
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
                var i = rowIDs.indexOf(v[Config.colIDs.COUNTRY]);
                CoronaTracker.tblData.updateData(
                    i, 
                    v[Config.colIDs.POPULATION], 
                    v[Config.colIDs.INFECTIONS], 
                    v[Config.colIDs.INFECTIONS_LAST], 
                    v[Config.colIDs.DEATHS], 
                    v[Config.colIDs.DEATHS_LAST], 
                    v[Config.colIDs.RECOVERED], 
                    v[Config.colIDs.RECOVERED_LAST], 
                    v[Config.colIDs.ACTIVE], 
                    v[Config.colIDs.ACTIVE_LAST]);
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
            dead_last: 0,
            active: 0,
            active_last: 0,
            recovered: 0,
            recovered_last: 0
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
                rows[i].style.display  = "";
                totals.population     += CoronaTracker.tblData.valNumeric(rows[i], Config.colIDs.POPULATION);
                totals.infected       += CoronaTracker.tblData.valNumeric(rows[i], Config.colIDs.INFECTIONS);
                totals.infected_last  += CoronaTracker.tblData.valNumeric(rows[i], Config.colIDs.INFECTIONS_LAST);
                totals.dead           += CoronaTracker.tblData.valNumeric(rows[i], Config.colIDs.DEATHS);
                totals.dead_last      += CoronaTracker.tblData.valNumeric(rows[i], Config.colIDs.DEATHS_LAST);
                totals.active         += CoronaTracker.tblData.valNumeric(rows[i], Config.colIDs.ACTIVE);
                totals.active_last    += CoronaTracker.tblData.valNumeric(rows[i], Config.colIDs.ACTIVE_LAST);
                totals.recovered      += CoronaTracker.tblData.valNumeric(rows[i], Config.colIDs.RECOVERED);
                totals.recovered_last += CoronaTracker.tblData.valNumeric(rows[i], Config.colIDs.RECOVERED_LAST);
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
            totals.dead_last,
            totals.recovered,
            totals.recovered_last,
            totals.active,
            totals.active_last
        );

        URL.updateLink();
    }
}

CoronaTracker.timelines = {};
CoronaTracker.data = {};
CoronaTracker.days = 0;
