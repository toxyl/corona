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

    static aliasesAdd(aliases)
    {
        var keys = ObjectUtils.keys(aliases);
        for (var i = 0; i < keys.length; i++) {
            Config.aliasAdd(keys[i], aliases[keys[i]]);
        }
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

    static columnsAdd(cols)
    {
        for (var i = 0; i < cols.length; i++) {
            Config.columnAdd(cols[i][0], cols[i][1], cols[i][2], cols[i][3], cols[i][4], cols[i][5]);
        }
    }

    static regionAdd(name, country)
    {
        if (this.regions == undefined)
        {
            this.regions = {};
        }

        this.regions[country] = name;
    }

    static regionsAdd(regions)
    {
        var keys = ObjectUtils.keys(regions);
        for (var i = 0; i < keys.length; i++) {
            for (var j = 0; j < regions[keys[i]].length; j++) {
                Config.regionAdd(keys[i], regions[keys[i]][j]);
            }
        }
    }

    static region(country)
    {
        country = country.replace(/(.*?)\s*\[\w+\]\s*/, '$1');
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

Config.colIDs = {
    COUNTRY: 0,
    POPULATION: 1,
    INFECTIONS: 2,
    ACTIVE: 3,
    RECOVERED: 4,
    DEATHS: 5,
    INFECTIONS_LAST: 6,
    ACTIVE_LAST: 7,
    RECOVERED_LAST: 8,
    DEATHS_LAST: 9,
    INFECTIONS_CHANGE: 10,
    ACTIVE_CHANGE: 11,
    RECOVERED_CHANGE: 12,
    DEATHS_CHANGE: 13,
    R0: 14,
    CASE_FATALITY_RATE: 15,
    INFECTION_CHANCE_1: 16,
    INFECTION_CHANCE_10: 17,
    INFECTION_CHANCE_50: 18,
    INFECTION_CHANCE_100: 19,
}

Config.columnsAdd(
    [   /* stat                                      type        low     medium  high       updateFunction*/
        [ 'Country',                                 '',         null,   null,   null,      undefined ],  
        [ 'Population',                              'int',      null,   null,   null,      undefined ],  
        [ 'Infections<br>(total)',                   'int',      100,    1000,   10000,     undefined ], 
        [ 'Active<br>(total, est.)',                 'int',      100,    1000,   10000,     undefined ], 
        [ 'Recovered<br>(total, est.)',              'int',      100,    1000,   10000,     undefined ], 
        [ 'Deaths<br>(total)',                       'int',      100,    1000,   10000,     undefined ], 
        [ 'Infections (last)',                       'int',      100,    1000,   10000,     undefined ], 
        [ 'Active (last)',                           'int',      100,    1000,   10000,     undefined ], 
        [ 'Recovered (last)',                        'int',      100,    1000,   10000,     undefined ], 
        [ 'Deaths (last)',                           'int',      100,    1000,   10000,     undefined ], 
        [ 'Infections<br>(change)',                  'float',    1,      25,     50,        function(dataTable, row) { return Math.percentageChange(dataTable.cell(row, Config.colIDs.INFECTIONS_LAST).text(), dataTable.cell(row, Config.colIDs.INFECTIONS).text()).toPercent(); } ],
        [ 'Active<br>(change, est.)',                'float',    1,      25,     50,        function(dataTable, row) { return Math.percentageChange(dataTable.cell(row, Config.colIDs.ACTIVE_LAST).text(), dataTable.cell(row, Config.colIDs.ACTIVE).text()).toPercent(); } ],
        [ 'Recovered<br>(change, est.)',             'float',    1,      25,     50,        function(dataTable, row) { return Math.percentageChange(dataTable.cell(row, Config.colIDs.RECOVERED_LAST).text(), dataTable.cell(row, Config.colIDs.RECOVERED).text()).toPercent(); } ],
        [ 'Deaths<br>(change)',                      'float',    1,      25,     50,        function(dataTable, row) { return Math.percentageChange(dataTable.cell(row, Config.colIDs.DEATHS_LAST).text(), dataTable.cell(row, Config.colIDs.DEATHS).text()).toPercent(); } ],
        [ 'New cases per<br>recovered case',         'float',    0.5,    0.75,   1.0,       function(dataTable, row) { return Math.max(0, dataTable.ratioNewToRecovered(row)).round(2); } ],
        [ 'Case Fatality Rate',                      'float',    1,      10,     25,        function(dataTable, row) { return Math.caseFatalityRate(dataTable.cell(row, Config.colIDs.INFECTIONS).text(), dataTable.cell(row, Config.colIDs.DEATHS).text()).toPercent(); } ],
        [ 'Inf. Chance<br>(1+ ppl)',                 'float',    1,      25,     50,        function(dataTable, row) { return Math.infectionChance(dataTable.cell(row, Config.colIDs.ACTIVE).text(), 0, dataTable.cell(row, Config.colIDs.POPULATION).text(), 1).toPercent(); } ],
        [ 'Inf. Chance<br>(10+ ppl)',                'float',    1,      25,     50,        function(dataTable, row) { return Math.infectionChance(dataTable.cell(row, Config.colIDs.ACTIVE).text(), 0, dataTable.cell(row, Config.colIDs.POPULATION).text(), 10).toPercent(); } ],
        [ 'Inf. Chance<br>(50+ ppl)',                'float',    1,      25,     50,        function(dataTable, row) { return Math.infectionChance(dataTable.cell(row, Config.colIDs.ACTIVE).text(), 0, dataTable.cell(row, Config.colIDs.POPULATION).text(), 50).toPercent(); } ],
        [ 'Inf. Chance<br>(100+ ppl)',               'float',    1,      25,     50,        function(dataTable, row) { return Math.infectionChance(dataTable.cell(row, Config.colIDs.ACTIVE).text(), 0, dataTable.cell(row, Config.colIDs.POPULATION).text(), 100).toPercent(); } ],
    ]
);

Config.aliasesAdd({
    'US':                   'United States',
    'Taiwan*':              'Taiwan',
    'Congo (Brazzaville)':  'Republic of the Congo',
    'Congo (Kinshasa)':     'DR Congo',
    'Gambia, The':          'Gambia',
    'Bahamas, The':         'Bahamas',
    'Timor-Leste':          'East Timor',
    'Cabo Verde':           'Cape Verde',
    'Holy See':             'Vatican City',
});

Config.regionsAdd({
    'Africa': [
        'Angola', 
        'Benin', 
        'Botswana', 
        'Burkina Faso', 
        'Burundi', 
        'Cameroon', 
        'Cabo Verde', 
        'Cape Verde',
        'Central African Republic',
        'Chad',
        'Congo (Brazzaville)',
        'Republic of the Congo',
        'Congo (Kinshasa)',
        'DR Congo',
        'Cote d\'Ivoire',
        'Equatorial Guinea',
        'Eritrea',
        'Eswatini',
        'Ethiopia',
        'Gabon',
        'Gambia',
        'Gambia,The',
        'Ghana',
        'Guinea',
        'Guinea-Bissau',
        'Kenya',
        'Lesotho',
        'Liberia',
        'Madagascar',
        'Malawi',
        'Mali',
        'Mauritius',
        'Mauritania',
        'Mozambique',
        'Namibia',
        'Niger',
        'Nigeria',
        'Rwanda',
        'Sao Tome and Principe',
        'Senegal', 
        'Seychelles', 
        'Sierra Leone',
        'South Africa', 
        'South Sudan',
        'Tanzania',
        'Togo',
        'Uganda',
        'Western Sahara',
        'Zambia',
        'Zimbabwe'
    ],
    'Arab States': [
        'Algeria',
        'Bahrain',
        'Comoros',
        'Djibouti',
        'Mauritania',
        'Morocco',
        'Palestinian Territory',
        'Somalia',
        'Sudan',
        'Tunisia',
        'West Bank and Gaza'
    ],
    'Asia & Pacific': [
        'Afghanistan',
        'American Samoa',
        'Antarctica',
        'Australia',
        'Azerbaijan',
        'Bangladesh',
        'Bhutan',
        'British Indian Ocean Territory',
        'Brunei',
        'Burma',
        'Cambodia',
        'China',
        'Christmas Island',
        'Cocos (Keeling) Islands',
        'Cook Islands',
        'Fiji',
        'French Polynesia',
        'French Southern Territories',
        'Guam',
        'Heard Island and McDonald Islands',
        'Hong Kong',
        'India',
        'Indonesia',
        'Japan',
        'Kazakhstan',
        'Kiribati',
        'Korea, South',
        'Kyrgyzstan',
        'Laos',
        'Macau',
        'Malaysia',
        'Maldives',
        'Marshall Islands',
        'Micronesia',
        'Mongolia',
        'Myanmar',
        'Nauru',
        'Nepal',
        'New Caledonia',
        'New Zealand',
        'Niue',
        'Norfolk Island',
        'Northern Mariana Islands',
        'Pakistan',
        'Palau',
        'Papua New Guinea',
        'Philippines',
        'Pitcairn Islands',
        'Reunion',
        'Samoa',
        'Singapore',
        'Solomon Islands',
        'Sri Lanka',
        'Syria',
        'Taiwan',
        'Taiwan*',
        'Tajikistan',
        'Thailand',
        'Timor-Leste',
        'East Timor',
        'Tokelau',
        'Tonga',
        'Turkmenistan',
        'Tuvalu',
        'United States Minor Outlying Islands',
        'Uzbekistan',
        'Vanuatu',
        'Vietnam',
        'Wallis and Futuna',
    ],
    'Europe': [
        'Aland Islands',
        'Albania',
        'Andorra',
        'Armenia',
        'Austria',
        'Belarus',
        'Belgium',
        'Bosnia and Herzegovina',
        'Bulgaria',
        'Croatia',
        'Cyprus',
        'Czechia',
        'Denmark',
        'Estonia',
        'Faroe Islands', 
        'Finland',
        'France',
        'Georgia',
        'Germany',
        'Gibraltar', 
        'Greece',
        'Greenland', 
        'Guernsey',
        'Holy See',
        'Vatican City',
        'Hungary',
        'Iceland',
        'Ireland',
        'Isle of Man',
        'Israel',
        'Italy', 
        'Jersey',
        'Kosovo',
        'Latvia',
        'Liechtenstein', 
        'Lithuania', 
        'Luxembourg',
        'Macedonia', 
        'Malta', 
        'Moldova',
        'Monaco',
        'Montenegro',
        'Netherlands',
        'Norway',
        'North Macedonia',
        'Poland',
        'Portugal',
        'Romania',
        'Russia',
        'San Marino',
        'Serbia',
        'Slovakia',
        'Slovenia',
        'Spain', 
        'Svalbard and Jan Mayen',
        'Sweden',
        'Switzerland',
        'Turkey',
        'Ukraine',
        'United Kingdom'
    ],
    'Middle East': [
        'Egypt',
        'Iran',
        'Iraq',
        'Jordan',
        'Kuwait',
        'Lebanon',
        'Libya',
        'Oman',
        'Qatar',
        'Saudi Arabia',
        'United Arab Emirates',
        'Yemen',
    ],
    'North America': [
        'Bermuda',
        'Canada', 
        'Saint Pierre and Miquelon', 
        'US', 
        'United States'
    ],
    'South America': [
        'Anguilla',
        'Antigua and Barbuda',
        'Argentina',
        'Aruba',
        'Bahamas',
        'Bahamas, The',
        'Barbados',
        'Belize',
        'Bolivia',
        'Bouvet Island',
        'Brazil',
        'Cayman Islands',
        'Chile',
        'Colombia',
        'Costa Rica',
        'Cuba',
        'Dominica',
        'Dominican Republic',
        'Ecuador',
        'El Salvador',
        'Falkland Islands',
        'French Guiana',
        'Grenada',
        'Guadeloupe',
        'Guatemala',
        'Guyana',
        'Haiti',
        'Honduras',
        'Jamaica',
        'Martinique',
        'Mexico',
        'Montserrat',
        'Netherlands Antilles',
        'Nicaragua',
        'Panama',
        'Paraguay',
        'Peru',
        'Puerto Rico',
        'Saint Barthelemy',
        'Saint Kitts and Nevis',
        'Saint Lucia',
        'Saint Martin',
        'Saint Vincent and the Grenadines',
        'South Georgia and the South Sandwich Islands',
        'Suriname',
        'Trinidad and Tobago',
        'Turks and Caicos Islands',
        'Uruguay',
        'Venezuela',
        'Virgin Islands, British',
        'Virgin Islands, U.S.'
    ],
    'Other': [
        'Diamond Princess',
        'MS Zaandam'
    ]
});

Config.apiURL = 'https://cvtapi.nl/v2/locations?timelines=true';
// Config.apiURL = 'https://coronavirus-tracker-api.herokuapp.com/v2/locations?timelines=true';
Config.updateInterval = 15; // in minutes

Config.graphColorGrid = '#666666';
Config.graphColorConfirmed = '#cccc00';
Config.graphColorDeaths = '#cc0000';
Config.graphColorActive = '#00ccff';
Config.graphColorRecovered = '#00cc00';
Config.graphColorActive3wk = '#0099cc7f';
Config.graphColorRecovered3wk = '#009900';
