class TimelinesAdapterOWID 
{
    /*  Just for reference the data model of OWID:
        
        static apiModel = [
              "iso_code": {
                "continent": "North America",
                "country": "Aruba",
                "population": {
                  "total": 106766,
                  "density": 584.8,
                  "age_distribution": {
                    "median": 41.2,
                    "above_65": 13.085,
                    "above_70": 7.452
                  },
                  "life_expectancy": 76.29,
                  "human_development_index": 0
                },
                "hospital_beds": 0,
                "stringency_index": {
                  "total": []
                },
                "cases": {
                  "total": [],
                  "new": [],
                  "new_smoothed": [],
                },
                "active": {
                  "total": [],
                  "new": [],
                  "new_smoothed": [],
                },
                "recovered": {
                  "total": [],
                  "new": [],
                  "new_smoothed": [],
                },
                "deaths": {
                  "total": [],
                  "new": [],
                  "new_smoothed": [],
                },
                "tests": {
                  "total": [],
                  "new": [],
                  "new_smoothed": [],
                  "per_case": [],
                  "positive_rate": [],
                }
            ]
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
        var iso_codes = ObjectUtils.keys(input);
        var data;

        for (var i = 0; i < iso_codes.length; i++) {
            data = input[iso_codes[i]];

            Config.addISOCode(data.country, iso_codes[i]);

            // insert default item if undefined
            if (this[data.country] == undefined) {
                this[data.country] = {
                    country: data.country,
                    country_code: iso_codes[i],
                    population: data.population.total,
                    population_infected: data.cases.total.last() / data.population.total,
                    population_active: data.active.total.last() / data.population.total,
                    population_recovered: data.recovered.total.last() / data.population.total,
                    population_deaths: data.deaths.total.last() / data.population.total,
                    region: data.continent,
                    hospital_beds: data.hospital_beds,
                };
            }

            TimelinesAdapterOWID.appendTimeline(this[data.country], 'infected', data.cases.total.exponentialAverage(Config.data.ema.infected).round());
            TimelinesAdapterOWID.appendTimeline(this[data.country], 'deaths', data.deaths.total.exponentialAverage(Config.data.ema.deaths).round());
            TimelinesAdapterOWID.appendTimeline(this[data.country], 'recovered', data.recovered.total.exponentialAverage(Config.data.ema.recovered).round());
            TimelinesAdapterOWID.appendTimeline(this[data.country], 'active', data.active.total.exponentialAverage(Config.data.ema.active).round());
            TimelinesAdapterOWID.appendTimeline(this[data.country], 'tests', data.tests.total.exponentialAverage(Config.data.ema.tests).round());
            TimelinesAdapterOWID.appendTimeline(this[data.country], 'positive_rate', data.tests.positive_rate);
            TimelinesAdapterOWID.appendTimeline(this[data.country], 'hosp_patients', data.hosp_patients.total.exponentialAverage(Config.data.ema.hosp).round());
            TimelinesAdapterOWID.appendTimeline(this[data.country], 'icu_patients', data.icu_patients.total.exponentialAverage(Config.data.ema.icu).round());
        }

        var countries = ObjectUtils.keys(this);
        var c;
        for (var i = 0; i < countries.length; i++) {
            c = countries[i];
            TimelinesAdapterOWID.appendTimeline(this[c], 'case_fatality_rate',          this.getDeathsTotal(c).divide(this.getInfectedTotal(c)).array(), false);
            TimelinesAdapterOWID.appendTimeline(this[c], 'infection_chance',            this.getActiveTotal(c).divide(this[c].population).array(), false);
            TimelinesAdapterOWID.appendTimeline(this[c], 'infection_chance_10',         this.getActiveTotal(c).divide(this[c].population).multiply(10).array(), false);
            TimelinesAdapterOWID.appendTimeline(this[c], 'infection_chance_50',         this.getActiveTotal(c).divide(this[c].population).multiply(50).array(), false);
            TimelinesAdapterOWID.appendTimeline(this[c], 'infection_chance_100',        this.getActiveTotal(c).divide(this[c].population).multiply(100).array(), false);
            TimelinesAdapterOWID.appendTimeline(this[c], 'new_cases_per_recovered',     this.getActiveChange(c).divide(this.getRecoveredChange(c)).exponentialAverage(Config.data.ema.new_cases_per_recovered).array(), false);
        }
    }
}
