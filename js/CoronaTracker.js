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
			countryCode: 		loc.country_code,
			population: 		loc.country_population,
			caseFatalityRate: 	timeline.deaths.last(1) / timeline.confirmed.last(1),
			infectionChance: 	timeline.confirmed.last(1) / loc.country_population,
			deaths: 			this.latestOfTimeline(loc.country, 'deaths', loc.country_population),
			recovered: 			this.latestOfTimeline(loc.country, 'recovered', loc.country_population),
			confirmed: 			this.latestOfTimeline(loc.country, 'confirmed', loc.country_population),
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
			caseFatalityRate: Math.max(0, this.data[country].deaths.total[day] / this.data[country].confirmed.total[day]),
			infectionChance:  Math.max(0, this.data[country].confirmed.total[day] / this.data[country].latest.population),
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
			(this.nameMap.hasOwnProperty(country) ? this.nameMap[country] : country) + ' ['+d.countryCode+']', 
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

	static table(filter, sortCol, sortAscending)
	{
		$('#datacontainer').html('');
		var countries = Object.keys(this.data);
		var rows = [ ];
		var headers = [ 
			"Country", 
			"Population", 
			"Confirmed<br>(current)",
			"Confirmed<br>(last)",
			"Confirmed<br>(change)",
			"Deaths<br>(current)",
			"Deaths<br>(last)",
			"Deaths<br>(change)",
			"Case Fatality Rate",
			"Infection Chance<br>(1 person met)",
			"Infection Chance<br>(10 persons met)",
			"Infection Chance<br>(50 persons met)",
			"Infection Chance<br>(100 persons met)",
		];

		var sortTypes = ['', 'int', 'int', 'int', 'float', 'int', 'int', 'float', 'float', 'float', 'float', 'float', 'float' ];
		var searchInput = "<input type='text' id='search' placeholder='filter' autofocus value="+filter+"></input>";

		for (var i = 0; i < countries.length; i++)
		{
			if (this.data[countries[i]].latest.population <= 0)
				continue;

			rows.push(this.tableRow(countries[i]));

		}
		if (sortAscending)
		{
			rows.sort((a, b) => a[sortCol] - b[sortCol]);
		}
		else
		{
			rows.sort((a, b) => b[sortCol] - a[sortCol]);
		}

		$('#datacontainer').append('<table id="datatotals" style="width:100%" class="shadow"><tbody><tr></tr></tbody></table>');

		$('#datacontainer').append('<table id="data" style="width:100%;margin-top: 10px;" class="shadow"><thead><tr></tr></thead><tbody></tbody></table>');
		for (var i = 0; i < headers.length; i++)
		{
			$('#data thead tr').append('<th data-sort="'+ sortTypes[i] + '" class="'+(sortCol == i ? 'sorting-' + (sortAscending ? 'asc' : 'desc') : '')+'">'+(i > 0 ? headers[i] : searchInput)+'</th>');
			$('#datatotals tbody tr').append('<td>'+(i > 0 ? 0 : 'TOTAL')+'</td>');
		}

		for (var i = 0; i < rows.length; i++)
		{
			$('#data tbody').append('<tr><td>'+rows[i].join('</td><td>')+'</td></tr>');
		}

		var rowIDs = mapRowsToIDs();
		$.each(rows, 
			function(key, v) 
			{
				updateData(rowIDs.indexOf(v[0]), v[1], v[2], v[3], v[5], v[6]);
			}
		);
		$('#data').stupidtable_build();
		updateSort('#data');
		$('#search').val(filter);
		$('#search').keyup(filterTable);
		$('#search').keyup();

		addTooltips();

		return {
			headers: headers,
			rows: rows
		};
	}

	static update(callback)
	{
		var loc;
		var loadData = function (data)
		{
			CoronaTracker.loadDataSet(data);
			callback(data);
		};

		$.getJSON(
			'https://coronavirus-tracker-api.herokuapp.com/v2/locations?timelines=true',
			loadData
		);
	}

	static scheduleUpdate(timeFirst, timeNext)
	{
		setTimeout(function(){
			console.log('Running update...');
			CoronaTracker.update(
				function(data)
				{
					var filter = $.urlParam('c');
					var sortCol = $.urlParam('s');
					var sortAscending = $.urlParam('d').toLowerCase() == 'asc';
					if (sortCol == '') sortCol = 8;

					CoronaTracker.table(filter, sortCol, sortAscending);
				}
			);
			CoronaTracker.scheduleUpdate(timeNext, timeNext);
		}, timeFirst);
	}
}

CoronaTracker.timelines = {};
CoronaTracker.data = {};
CoronaTracker.days = 0;

CoronaTracker.nameMap = {
	"US": "United States",
	"Taiwan*": "Taiwan",
	"Congo (Brazzaville)": "Republic of the Congo",
	"Congo (Kinshasa)": "DR Congo",
	"Gambia, The": "Gambia",
	"Bahamas, The": "Bahamas",
	"Timor-Leste": "East Timor",
	"Cabo Verde": "Cape Verde",
	"Holy See": "Vatican City"
};

$.urlParam = function (name) 
{
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(location.href);
	return results == null ? '' : results[1];
}

$(function(){
	CoronaTracker.scheduleUpdate(1, 60000*15); // 15 minutes
});
