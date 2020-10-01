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
        country = country.stripCountryCode();
        return this.regions.hasOwnProperty(country) ? this.regions[country] : 'unknown';
    }
}

Config.data = {
    fields: [
        'infected',
        'active',
        'recovered',
        'deaths',
        'infectedChange',
        'activeChange',
        'recoveredChange',
        'deathsChange',
    ],
    timeToRecoveryOrDeath: 13,
    ema: {
        infected: 0.9,
        deaths: 0.9,
        recovered: 0.2,
        active: 0.2,
    }
};

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
