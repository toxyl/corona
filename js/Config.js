/**
 * This class contains all configurable parameters
 **/
class Config 
{
    static addISOCode(country, iso_code) {
        if (this.isoCodes == undefined)
            this.isoCodes = {};
        if (this.countries == undefined)
            this.countries = {};

        this.isoCodes[country] = iso_code;
        this.countries[iso_code] = country;
    }

    static country(iso_code) {
        return this.countries[iso_code] == undefined ? "N/A" : this.countries[iso_code];
    }

    static isoCode(country) {
        return this.isoCodes[country] == undefined ? "N/A" : this.isoCodes[country];
    }
}

Config.data = {
    ema: {
        infected: 0.9,
        deaths: 0.9,
        recovered: 0.2,
        active: 0.2,
        tests: 0.2,
        hosp: 0.15,
        icu: 0.15,
        new_cases_per_recovered: 0.1,
    }
};

Config.apiURL = 'data.php';
Config.updateInterval = 15; // in minutes

Config.graphColorGrid = '#666666';
Config.graphColorGrid2 = '#0066667F';
Config.graphColorConfirmed = '#cccc00';
Config.graphColorDeaths = '#cc0000';
Config.graphColorActive = '#00ccff';
Config.graphColorRecovered = '#00cc00';
Config.graphColorNewPerRecovered = '#33cccc';
Config.graphColorHospitalPatients = '#FCA346';
Config.graphColorICUPatients = '#FC4D46';
