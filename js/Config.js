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
Config.columnAdd('Confirmed<br>(change)',                   'float',    1,      25,     50,     function(dataTable, row) { return ((dataTable.cell(row, 2).text() / dataTable.cell(row, 3).text()) - 1).toPercent(); } );
Config.columnAdd('Deaths<br>(current)',                     'int',      100,    1000,   10000);
Config.columnAdd('Deaths<br>(last)',                        'int',      100,    1000,   10000);
Config.columnAdd('Deaths<br>(change)',                      'float',    1,      25,     50,     function(dataTable, row) { return (( dataTable.cell(row, 5).text() / dataTable.cell(row, 6).text()) - 1).toPercent(); } );
Config.columnAdd('Case Fatality Rate',                      'float',    1,      10,     25,     function(dataTable, row) { return (  dataTable.cell(row, 5).text() / dataTable.cell(row, 2).text()).toPercent(); } );
Config.columnAdd('Infection Chance<br>(1 person met)',      'float',    1,      25,     50,     function(dataTable, row) { return (  dataTable.cell(row, 2).text() / dataTable.cell(row, 1).text()).toPercent(); });
Config.columnAdd('Infection Chance<br>(10 persons met)',    'float',    1,      25,     50,     function(dataTable, row) { return (( dataTable.cell(row, 2).text() / dataTable.cell(row, 1).text()) * 10).toPercent(); } );
Config.columnAdd('Infection Chance<br>(50 persons met)',    'float',    1,      25,     50,     function(dataTable, row) { return (( dataTable.cell(row, 2).text() / dataTable.cell(row, 1).text()) * 50).toPercent(); });
Config.columnAdd('Infection Chance<br>(100 persons met)',   'float',    1,      25,     50,     function(dataTable, row) { return (( dataTable.cell(row, 2).text() / dataTable.cell(row, 1).text()) * 100).toPercent(); });

Config.aliasAdd('US',                   'United States');
Config.aliasAdd('Taiwan*',              'Taiwan');
Config.aliasAdd('Congo (Brazzaville)',  'Republic of the Congo');
Config.aliasAdd('Congo (Kinshasa)',     'DR Congo');
Config.aliasAdd('Gambia, The',          'Gambia');
Config.aliasAdd('Bahamas, The',         'Bahamas');
Config.aliasAdd('Timor-Leste',          'East Timor');
Config.aliasAdd('Cabo Verde',           'Cape Verde');
Config.aliasAdd('Holy See',             'Vatican City');

Config.apiURL = 'https://cvtapi.nl/v2/locations?timelines=true';
// Config.apiURL = 'https://coronavirus-tracker-api.herokuapp.com/v2/locations?timelines=true';
Config.updateInterval = 15; // in minutes
