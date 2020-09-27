class TimelinesAdapter 
{
	/*	Just for reference the data model of the CoronaTracker API:
		
		static apiModel = {
			latest: {
				confirmed: 0,
				deaths: 0,
				recovered: 0,
			},
			locations: [
				{
					id: 186,
					country: "Netherlands",
					country_code: "NL",
					country_population: 17444381,
					last_updated: "2020-09-26T10:06:45.859649Z",
					latest: {
						confirmed: 3799,
						deaths: 25,
						recovered: 0,
					},
					province: "Aruba",
					timelines: {
						confirmed: {
							latest: 3799,
							timeline: {
								"2020-08-06T00:00:00Z": 263,
								"2020-08-07T00:00:00Z": 396,
								"2020-08-08T00:00:00Z": 509
							}
						},
						deaths: {
							latest: 25,
							timeline: {
								"2020-08-06T00:00:00Z": 3,
								"2020-08-07T00:00:00Z": 3,
								"2020-08-08T00:00:00Z": 3
							}
						},
						recovered: {
							latest: 0,
							timeline: {
								"2020-08-06T00:00:00Z": 0,
								"2020-08-07T00:00:00Z": 0,
								"2020-08-08T00:00:00Z": 0
							}
						}
					}
				}
			]
		};
	*/

	static appendTotal(dataset, name, data, merge) {
		if (dataset[name] == undefined)
			dataset[name] = { total: [], change: [], relative_change: [] };

		if (dataset[name].total == undefined || merge == false)
			dataset[name].total = data;
		else
			dataset[name].total.merge(data);

		if (dataset.latest == undefined)
			dataset.latest = { total: {}, change: {}, relative_change: {} };

		dataset.latest.total[name] = dataset[name].total.last();
	}

	static appendChanges(dataset, name, data) {
		if (dataset[name] == undefined)
			dataset[name] = { total: [], change: [], relative_change: [] };

		dataset[name].change = data.getChanges();
		dataset[name].relative_change = data.relativeChange();

		if (dataset.latest == undefined)
			dataset.latest = { total: {}, change: {}, relative_change: {} };

		dataset.latest.change[name] = dataset[name].change.last();
		dataset.latest.relative_change[name] = dataset[name].relative_change.last();
	}

	static appendTimeline(dataset, name, data, merge) {
		this.appendTotal(dataset, name, data, merge);
		this.appendChanges(dataset, name, data);
	}

	getTotal(country, field) {
		return this[country][field].total;
	}

	getChange(country, field) {
		return this[country][field].change;
	}

	getDeathsTotal(country) {
		return this.getTotal(country, 'deaths');
	}

	getInfectedTotal(country) {
		return this.getTotal(country, 'infected');
	}

	getRecoveredTotal(country) {
		return this.getTotal(country, 'recovered');
	}

	getActiveTotal(country) {
		return this.getTotal(country, 'active');
	}

	getDeathsChange(country) {
		return this.getChange(country, 'deaths');
	}

	getInfectedChange(country) {
		return this.getChange(country, 'infected');
	}

	getRecoveredChange(country) {
		return this.getChange(country, 'recovered');
	}

	getActiveChange(country) {
		return this.getChange(country, 'active');
	}

	constructor(input) {
		var location;

		for (var i = 0; i < input.locations.length; i++) {
			location = input.locations[i];
			location.country = Config.alias(location.country);

	        // insert default item if undefined
			if (this[location.country] == undefined) {
				this[location.country] = {
					country: location.country.appendCountryCode(location.country_code),
					country_code: location.country_code,
					population: location.country_population
				};
			}

			TimelinesAdapter.appendTimeline(this[location.country], 'infected', ObjectUtils.valuesAsc(location.timelines.confirmed.timeline).exponentialAverage(Config.data.ema.infected).round());
			TimelinesAdapter.appendTimeline(this[location.country], 'deaths', ObjectUtils.valuesAsc(location.timelines.deaths.timeline).exponentialAverage(Config.data.ema.deaths).round());
		}

		var countries = ObjectUtils.keys(this);
		var c;
		for (var i = 0; i < countries.length; i++) {
			c = countries[i];
			TimelinesAdapter.appendTimeline(this[c], 'recovered', 					this.getInfectedTotal(c).delta(this.getDeathsTotal(c), Config.data.timeToRecoveryOrDeath).exponentialAverage(Config.data.ema.recovered).exponentialAverage(Config.data.ema.recovered).round().array(), false);
			TimelinesAdapter.appendTimeline(this[c], 'active', 						this.getInfectedTotal(c).subtract(this.getRecoveredTotal(c)).exponentialAverage(Config.data.ema.active).round().array(), false);
			TimelinesAdapter.appendTimeline(this[c], 'case_fatality_rate', 			this.getDeathsTotal(c).divide(this.getInfectedTotal(c)).array(), false);
			TimelinesAdapter.appendTimeline(this[c], 'infection_chance', 			this.getActiveTotal(c).divide(this[c].population).array(), false);
			TimelinesAdapter.appendTimeline(this[c], 'infection_chance_10', 		this.getActiveTotal(c).divide(this[c].population).multiply(10).array(), false);
			TimelinesAdapter.appendTimeline(this[c], 'infection_chance_50', 		this.getActiveTotal(c).divide(this[c].population).multiply(50).array(), false);
			TimelinesAdapter.appendTimeline(this[c], 'infection_chance_100', 		this.getActiveTotal(c).divide(this[c].population).multiply(100).array(), false);
			TimelinesAdapter.appendTimeline(this[c], 'new_cases_per_recovered', 	this.getActiveChange(c).divide(this.getRecoveredChange(c)).array(), false);
		}
	}
}
