if (!String.prototype.stripCountryCode)
{
    String.prototype.stripCountryCode = function()
    {
        return this.replace(/(.*)\s+\[.*?\]/g, '$1');
    }
};

if (!String.prototype.appendCountryCode)
{
    String.prototype.appendCountryCode = function()
    {
        var s = this.stripCountryCode();

        return s + ' ['+Config.isoCode(s)+']';
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
