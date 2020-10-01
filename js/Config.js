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
    }
};

Config.apiURL = 'https://cors-anywhere.herokuapp.com/http://cvtapi.nl/latest.json';
// Config.apiURL = 'https://cvtapi.nl/v2/locations?timelines=true';
Config.updateInterval = 15; // in minutes

Config.graphColorGrid = '#666666';
Config.graphColorConfirmed = '#cccc00';
Config.graphColorDeaths = '#cc0000';
Config.graphColorActive = '#00ccff';
Config.graphColorRecovered = '#00cc00';
Config.graphColorActive3wk = '#0099cc7f';
Config.graphColorRecovered3wk = '#009900';
