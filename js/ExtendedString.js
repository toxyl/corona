if (!String.prototype.stripCountryCode)
{
    String.prototype.stripCountryCode = function()
    {
        return this.replace(/(.*)\s+\[.*?\]/g, '$1');
    }
};

if (!String.prototype.appendCountryCode)
{
    String.prototype.appendCountryCode = function(country_code)
    {
        return Config.alias(this.stripCountryCode()) + ' ['+country_code+']';
    }
};

if (!String.prototype.getCountryAlias)
{
    String.prototype.getCountryAlias = function()
    {
        return Config.alias(this.stripCountryCode());
    }
};

if (!String.prototype.isInList)
{
    String.prototype.isInList = function(list)
    {
        if (Array.isArray(list))
            list = list.join(',');
        list = list.replace(' ', '').toUpperCase().split(',');
        var cmp = this.replace(' ', '').toUpperCase();

        for (var i = 0; i < list.length; i++) {
            if (cmp.indexOf(list[i]) > -1)
                return true;
        }

        return false;
    }
};
