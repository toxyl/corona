/**
 * This class contains all configurable parameters
 **/
class Config 
{
    static aliasAdd(name, alias)
    {
        if (this.aliases == undefined)
        {
            this.aliases = {};
        }

        this.aliases[name] = alias;
        this.aliases[alias] = name;
    }

    static alias(name)
    {
        return this.aliases.hasOwnProperty(name) ? this.aliases[name] : name;
    }

    static columnAdd(name, type, low, medium, high, updateFunction)
    {
        if (this.cols == undefined)
        {
            this.cols = {
                names:      [ ],
                types:      [ ],
                thresholds: 
                {
                    low:    [ ],
                    medium: [ ],
                    high:   [ ],
                },
                onUpdate: []
            };
        }

        this.cols.names.push(name);
        this.cols.types.push(type);
        this.cols.thresholds.low.push(low);
        this.cols.thresholds.medium.push(medium);
        this.cols.thresholds.high.push(high);
        this.cols.onUpdate.push(updateFunction == undefined ? null : updateFunction);
    }

    static regionAdd(name, country)
    {
        if (this.regions == undefined)
        {
            this.regions = {};
        }

        this.regions[country] = name;
    }

    static region(country)
    {
        return this.regions.hasOwnProperty(country) ? this.regions[country] : 'unknown';
    }

    static columnInfo(index)
    {
        return {
            name:       this.cols.names[index],
            type:       this.cols.types[index],
            low:        this.cols.thresholds.low[index],
            medium:     this.cols.thresholds.medium[index],
            high:       this.cols.thresholds.high[index],
            onUpdate:   this.cols.onUpdate[index],
        }
    }

    static columns()
    {
        var res = [];
        var l = this.cols.names.length;
        for (var i = 0; i < l; i++)
        {
            res.push(this.columnInfo(i));
        }
        return res;
    }
}

/*                stat                                      type        low     medium  high    updateFunction*/
Config.columnAdd('Country',                                 '',         null,   null,   null);
Config.columnAdd('Population',                              'int',      null,   null,   null);
Config.columnAdd('Confirmed<br>(current)',                  'int',      100,    1000,   10000);
Config.columnAdd('Confirmed<br>(last)',                     'int',      100,    1000,   10000);
Config.columnAdd('Confirmed<br>(change)',                   'float',    1,      25,     50,     function(dataTable, row) { return Math.percentageChange(dataTable.cell(row, 3).text(), dataTable.cell(row, 2).text()).toPercent(); } );
Config.columnAdd('Deaths<br>(current)',                     'int',      100,    1000,   10000);
Config.columnAdd('Deaths<br>(last)',                        'int',      100,    1000,   10000);
Config.columnAdd('Deaths<br>(change)',                      'float',    1,      25,     50,     function(dataTable, row) { return Math.percentageChange(dataTable.cell(row, 6).text(), dataTable.cell(row, 5).text()).toPercent(); } );
Config.columnAdd('Case Fatality Rate',                      'float',    1,      10,     25,     function(dataTable, row) { return Math.caseFatalityRate(dataTable.cell(row, 2).text(), dataTable.cell(row, 5).text()).toPercent(); } );
Config.columnAdd('Infection Chance<br>(1 person met)',      'float',    1,      25,     50,     function(dataTable, row) { return Math.infectionChance(dataTable.cell(row, 2).text(), dataTable.cell(row, 5).text(), dataTable.cell(row, 1).text(), 1).toPercent(); });
Config.columnAdd('Infection Chance<br>(10 persons met)',    'float',    1,      25,     50,     function(dataTable, row) { return Math.infectionChance(dataTable.cell(row, 2).text(), dataTable.cell(row, 5).text(), dataTable.cell(row, 1).text(), 10).toPercent(); } );
Config.columnAdd('Infection Chance<br>(50 persons met)',    'float',    1,      25,     50,     function(dataTable, row) { return Math.infectionChance(dataTable.cell(row, 2).text(), dataTable.cell(row, 5).text(), dataTable.cell(row, 1).text(), 50).toPercent(); });
Config.columnAdd('Infection Chance<br>(100 persons met)',   'float',    1,      25,     50,     function(dataTable, row) { return Math.infectionChance(dataTable.cell(row, 2).text(), dataTable.cell(row, 5).text(), dataTable.cell(row, 1).text(), 100).toPercent(); });

Config.aliasAdd('US',                   'United States');
Config.aliasAdd('Taiwan*',              'Taiwan');
Config.aliasAdd('Congo (Brazzaville)',  'Republic of the Congo');
Config.aliasAdd('Congo (Kinshasa)',     'DR Congo');
Config.aliasAdd('Gambia, The',          'Gambia');
Config.aliasAdd('Bahamas, The',         'Bahamas');
Config.aliasAdd('Timor-Leste',          'East Timor');
Config.aliasAdd('Cabo Verde',           'Cape Verde');
Config.aliasAdd('Holy See',             'Vatican City');

Config.regionAdd('Africa',              'Angola');
Config.regionAdd('Africa',              'Benin');
Config.regionAdd('Africa',              'Botswana');
Config.regionAdd('Africa',              'Burkina Faso');
Config.regionAdd('Africa',              'Burundi');
Config.regionAdd('Africa',              'Cameroon');
Config.regionAdd('Africa',              'Cabo Verde');
Config.regionAdd('Africa',              'Cape Verde');
Config.regionAdd('Africa',              'Central African Republic');
Config.regionAdd('Africa',              'Chad');
Config.regionAdd('Africa',              'Congo (Brazzaville)');
Config.regionAdd('Africa',              'Republic of the Congo');
Config.regionAdd('Africa',              'Congo (Kinshasa)');
Config.regionAdd('Africa',              'DR Congo');
Config.regionAdd('Africa',              'Cote d\'Ivoire');
Config.regionAdd('Africa',              'Equatorial Guinea');
Config.regionAdd('Africa',              'Eritrea');
Config.regionAdd('Africa',              'Eswatini');
Config.regionAdd('Africa',              'Ethiopia');
Config.regionAdd('Africa',              'Gabon');
Config.regionAdd('Africa',              'Gambia');
Config.regionAdd('Africa',              'Gambia, The');
Config.regionAdd('Africa',              'Ghana');
Config.regionAdd('Africa',              'Guinea');
Config.regionAdd('Africa',              'Guinea-Bissau');
Config.regionAdd('Africa',              'Kenya');
Config.regionAdd('Africa',              'Lesotho');
Config.regionAdd('Africa',              'Liberia');
Config.regionAdd('Africa',              'Madagascar');
Config.regionAdd('Africa',              'Malawi');
Config.regionAdd('Africa',              'Mali');
Config.regionAdd('Africa',              'Mauritius');
Config.regionAdd('Africa',              'Mauritania');
Config.regionAdd('Africa',              'Mozambique');
Config.regionAdd('Africa',              'Namibia');
Config.regionAdd('Africa',              'Niger');
Config.regionAdd('Africa',              'Nigeria');
Config.regionAdd('Africa',              'Rwanda');
Config.regionAdd('Africa',              'Sao Tome and Principe');
Config.regionAdd('Africa',              'Senegal');
Config.regionAdd('Africa',              'Seychelles');
Config.regionAdd('Africa',              'Sierra Leone');
Config.regionAdd('Africa',              'South Africa');
Config.regionAdd('Africa',              'South Sudan');
Config.regionAdd('Africa',              'Tanzania');
Config.regionAdd('Africa',              'Togo');
Config.regionAdd('Africa',              'Uganda');
Config.regionAdd('Africa',              'Western Sahara');
Config.regionAdd('Africa',              'Zambia');
Config.regionAdd('Africa',              'Zimbabwe');
    
Config.regionAdd('Arab States',         'Algeria');
Config.regionAdd('Arab States',         'Bahrain');
Config.regionAdd('Arab States',         'Comoros');
Config.regionAdd('Arab States',         'Djibouti');
Config.regionAdd('Arab States',         'Mauritania');
Config.regionAdd('Arab States',         'Morocco');
Config.regionAdd('Arab States',         'Palestinian Territory');
Config.regionAdd('Arab States',         'Somalia');
Config.regionAdd('Arab States',         'Sudan');
Config.regionAdd('Arab States',         'Tunisia');
Config.regionAdd('Arab States',         'West Bank and Gaza');
    
Config.regionAdd('Asia & Pacific',      'Afghanistan');
Config.regionAdd('Asia & Pacific',      'American Samoa');
Config.regionAdd('Asia & Pacific',      'Antarctica');
Config.regionAdd('Asia & Pacific',      'Australia');
Config.regionAdd('Asia & Pacific',      'Azerbaijan');
Config.regionAdd('Asia & Pacific',      'Bangladesh');
Config.regionAdd('Asia & Pacific',      'Bhutan');
Config.regionAdd('Asia & Pacific',      'British Indian Ocean Territory');
Config.regionAdd('Asia & Pacific',      'Brunei');
Config.regionAdd('Asia & Pacific',      'Burma');
Config.regionAdd('Asia & Pacific',      'Cambodia');
Config.regionAdd('Asia & Pacific',      'China');
Config.regionAdd('Asia & Pacific',      'Christmas Island');
Config.regionAdd('Asia & Pacific',      'Cocos (Keeling) Islands');
Config.regionAdd('Asia & Pacific',      'Cook Islands');
Config.regionAdd('Asia & Pacific',      'Fiji');
Config.regionAdd('Asia & Pacific',      'French Polynesia');
Config.regionAdd('Asia & Pacific',      'French Southern Territories');
Config.regionAdd('Asia & Pacific',      'Guam');
Config.regionAdd('Asia & Pacific',      'Heard Island and McDonald Islands');
Config.regionAdd('Asia & Pacific',      'Hong Kong');
Config.regionAdd('Asia & Pacific',      'India');
Config.regionAdd('Asia & Pacific',      'Indonesia');
Config.regionAdd('Asia & Pacific',      'Japan');
Config.regionAdd('Asia & Pacific',      'Kazakhstan');
Config.regionAdd('Asia & Pacific',      'Kiribati');
Config.regionAdd('Asia & Pacific',      'Korea, South');
Config.regionAdd('Asia & Pacific',      'Kyrgyzstan');
Config.regionAdd('Asia & Pacific',      'Laos');
Config.regionAdd('Asia & Pacific',      'Macau');
Config.regionAdd('Asia & Pacific',      'Malaysia');
Config.regionAdd('Asia & Pacific',      'Maldives');
Config.regionAdd('Asia & Pacific',      'Marshall Islands');
Config.regionAdd('Asia & Pacific',      'Micronesia');
Config.regionAdd('Asia & Pacific',      'Mongolia');
Config.regionAdd('Asia & Pacific',      'Myanmar');
Config.regionAdd('Asia & Pacific',      'Nauru');
Config.regionAdd('Asia & Pacific',      'Nepal');
Config.regionAdd('Asia & Pacific',      'New Caledonia');
Config.regionAdd('Asia & Pacific',      'New Zealand');
Config.regionAdd('Asia & Pacific',      'Niue');
Config.regionAdd('Asia & Pacific',      'Norfolk Island');
Config.regionAdd('Asia & Pacific',      'Northern Mariana Islands');
Config.regionAdd('Asia & Pacific',      'Pakistan');
Config.regionAdd('Asia & Pacific',      'Palau');
Config.regionAdd('Asia & Pacific',      'Papua New Guinea');
Config.regionAdd('Asia & Pacific',      'Philippines');
Config.regionAdd('Asia & Pacific',      'Pitcairn Islands');
Config.regionAdd('Asia & Pacific',      'Reunion');
Config.regionAdd('Asia & Pacific',      'Samoa');
Config.regionAdd('Asia & Pacific',      'Singapore');
Config.regionAdd('Asia & Pacific',      'Solomon Islands');
Config.regionAdd('Asia & Pacific',      'Sri Lanka');
Config.regionAdd('Asia & Pacific',      'Syria');
Config.regionAdd('Asia & Pacific',      'Taiwan');
Config.regionAdd('Asia & Pacific',      'Taiwan*');
Config.regionAdd('Asia & Pacific',      'Tajikistan');
Config.regionAdd('Asia & Pacific',      'Thailand');
Config.regionAdd('Asia & Pacific',      'Timor-Leste');
Config.regionAdd('Asia & Pacific',      'East Timor');
Config.regionAdd('Asia & Pacific',      'Tokelau');
Config.regionAdd('Asia & Pacific',      'Tonga');
Config.regionAdd('Asia & Pacific',      'Turkmenistan');
Config.regionAdd('Asia & Pacific',      'Tuvalu');
Config.regionAdd('Asia & Pacific',      'United States Minor Outlying Islands');
Config.regionAdd('Asia & Pacific',      'Uzbekistan');
Config.regionAdd('Asia & Pacific',      'Vanuatu');
Config.regionAdd('Asia & Pacific',      'Vietnam');
Config.regionAdd('Asia & Pacific',      'Wallis and Futuna');
    
Config.regionAdd('Europe',              'Aland Islands');
Config.regionAdd('Europe',              'Albania');
Config.regionAdd('Europe',              'Andorra');
Config.regionAdd('Europe',              'Armenia');
Config.regionAdd('Europe',              'Austria');
Config.regionAdd('Europe',              'Belarus');
Config.regionAdd('Europe',              'Belgium');
Config.regionAdd('Europe',              'Bosnia and Herzegovina');
Config.regionAdd('Europe',              'Bulgaria');
Config.regionAdd('Europe',              'Croatia');
Config.regionAdd('Europe',              'Cyprus');
Config.regionAdd('Europe',              'Czechia');
Config.regionAdd('Europe',              'Denmark');
Config.regionAdd('Europe',              'Estonia');
Config.regionAdd('Europe',              'Faroe Islands');
Config.regionAdd('Europe',              'Finland');
Config.regionAdd('Europe',              'France');
Config.regionAdd('Europe',              'Georgia');
Config.regionAdd('Europe',              'Germany');
Config.regionAdd('Europe',              'Gibraltar');
Config.regionAdd('Europe',              'Greece');
Config.regionAdd('Europe',              'Greenland');
Config.regionAdd('Europe',              'Guernsey');
Config.regionAdd('Europe',              'Holy See');
Config.regionAdd('Europe',              'Vatican City');
Config.regionAdd('Europe',              'Hungary');
Config.regionAdd('Europe',              'Iceland');
Config.regionAdd('Europe',              'Ireland');
Config.regionAdd('Europe',              'Isle of Man');
Config.regionAdd('Europe',              'Israel');
Config.regionAdd('Europe',              'Italy');
Config.regionAdd('Europe',              'Jersey');
Config.regionAdd('Europe',              'Kosovo');
Config.regionAdd('Europe',              'Latvia');
Config.regionAdd('Europe',              'Liechtenstein');
Config.regionAdd('Europe',              'Lithuania');
Config.regionAdd('Europe',              'Luxembourg');
Config.regionAdd('Europe',              'Macedonia');
Config.regionAdd('Europe',              'Malta');
Config.regionAdd('Europe',              'Moldova');
Config.regionAdd('Europe',              'Monaco');
Config.regionAdd('Europe',              'Montenegro');
Config.regionAdd('Europe',              'Netherlands');
Config.regionAdd('Europe',              'Norway');
Config.regionAdd('Europe',              'North Macedonia');
Config.regionAdd('Europe',              'Poland');
Config.regionAdd('Europe',              'Portugal');
Config.regionAdd('Europe',              'Romania');
Config.regionAdd('Europe',              'Russia');
Config.regionAdd('Europe',              'San Marino');
Config.regionAdd('Europe',              'Serbia');
Config.regionAdd('Europe',              'Slovakia');
Config.regionAdd('Europe',              'Slovenia');
Config.regionAdd('Europe',              'Spain');
Config.regionAdd('Europe',              'Svalbard and Jan Mayen');
Config.regionAdd('Europe',              'Sweden');
Config.regionAdd('Europe',              'Switzerland');
Config.regionAdd('Europe',              'Turkey');
Config.regionAdd('Europe',              'Ukraine');
Config.regionAdd('Europe',              'United Kingdom');
    
Config.regionAdd('Middle East',         'Egypt');
Config.regionAdd('Middle East',         'Iran');
Config.regionAdd('Middle East',         'Iraq');
Config.regionAdd('Middle East',         'Jordan');
Config.regionAdd('Middle East',         'Kuwait');
Config.regionAdd('Middle East',         'Lebanon');
Config.regionAdd('Middle East',         'Libya');
Config.regionAdd('Middle East',         'Oman');
Config.regionAdd('Middle East',         'Qatar');
Config.regionAdd('Middle East',         'Saudi Arabia');
Config.regionAdd('Middle East',         'United Arab Emirates');
Config.regionAdd('Middle East',         'Yemen');
    
Config.regionAdd('North America',       'Bermuda');
Config.regionAdd('North America',       'Canada');
Config.regionAdd('North America',       'Saint Pierre and Miquelon');
Config.regionAdd('North America',       'US');
Config.regionAdd('North America',       'United States');
    
Config.regionAdd('South America',       'Anguilla');
Config.regionAdd('South America',       'Antigua and Barbuda');
Config.regionAdd('South America',       'Argentina');
Config.regionAdd('South America',       'Aruba');
Config.regionAdd('South America',       'Bahamas');
Config.regionAdd('South America',       'Bahamas, The');
Config.regionAdd('South America',       'Barbados');
Config.regionAdd('South America',       'Belize');
Config.regionAdd('South America',       'Bolivia');
Config.regionAdd('South America',       'Bouvet Island');
Config.regionAdd('South America',       'Brazil');
Config.regionAdd('South America',       'Cayman Islands');
Config.regionAdd('South America',       'Chile');
Config.regionAdd('South America',       'Colombia');
Config.regionAdd('South America',       'Costa Rica');
Config.regionAdd('South America',       'Cuba');
Config.regionAdd('South America',       'Dominica');
Config.regionAdd('South America',       'Dominican Republic');
Config.regionAdd('South America',       'Ecuador');
Config.regionAdd('South America',       'El Salvador');
Config.regionAdd('South America',       'Falkland Islands');
Config.regionAdd('South America',       'French Guiana');
Config.regionAdd('South America',       'Grenada');
Config.regionAdd('South America',       'Guadeloupe');
Config.regionAdd('South America',       'Guatemala');
Config.regionAdd('South America',       'Guyana');
Config.regionAdd('South America',       'Haiti');
Config.regionAdd('South America',       'Honduras');
Config.regionAdd('South America',       'Jamaica');
Config.regionAdd('South America',       'Martinique');
Config.regionAdd('South America',       'Mexico');
Config.regionAdd('South America',       'Montserrat');
Config.regionAdd('South America',       'Netherlands Antilles');
Config.regionAdd('South America',       'Nicaragua');
Config.regionAdd('South America',       'Panama');
Config.regionAdd('South America',       'Paraguay');
Config.regionAdd('South America',       'Peru');
Config.regionAdd('South America',       'Puerto Rico');
Config.regionAdd('South America',       'Saint Barthelemy');
Config.regionAdd('South America',       'Saint Kitts and Nevis');
Config.regionAdd('South America',       'Saint Lucia');
Config.regionAdd('South America',       'Saint Martin');
Config.regionAdd('South America',       'Saint Vincent and the Grenadines');
Config.regionAdd('South America',       'South Georgia and the South Sandwich Islands');
Config.regionAdd('South America',       'Suriname');
Config.regionAdd('South America',       'Trinidad and Tobago');
Config.regionAdd('South America',       'Turks and Caicos Islands');
Config.regionAdd('South America',       'Uruguay');
Config.regionAdd('South America',       'Venezuela');
Config.regionAdd('South America',       'Virgin Islands, British');
Config.regionAdd('South America',       'Virgin Islands, U.S.');
    
Config.regionAdd('Other',               'Diamond Princess');
Config.regionAdd('Other',               'MS Zaandam');

Config.apiURL = 'https://cvtapi.nl/v2/locations?timelines=true';
// Config.apiURL = 'https://coronavirus-tracker-api.herokuapp.com/v2/locations?timelines=true';
Config.updateInterval = 15; // in minutes

Config.graphHeight = 100;
Config.graphWidth = 500;
Config.graphColorGrid = '#666666';
Config.graphColorConfirmed = '#cccc00';
Config.graphColorDeaths = '#cc0000';
Config.graphColorAvgR = '#0000cc';
