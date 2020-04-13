if (!Number.prototype.toPercent)
{
    Number.prototype.toPercent = function(max, decimals)
    {
        if (decimals == undefined)
            decimals = 4;

        if (max == undefined)
            max = 10000;

        value = this * 100;

        if (Number.isNaN(value))
            value = 0;
        else if (!Number.isFinite(value))
            value = value > Number.MAX_VALUE ? 100 : Number.MIN_VALUE;

        value = Math.max(-max, Math.min(value, max));

        return value.toFixed(decimals) + '%';
    }
};

if (!Number.prototype.format)
{
    Number.prototype.format = function(thousands, fractions)
    {
        if (thousands == undefined)
            thousands = ',';

        if (fractions == undefined)
            fractions = '.';
        
        return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1[thousands]').replace(/\./g, fractions).replace(/\[thousands\]/g, thousands);
    }
};

if (!Number.prototype.round)
{
    Number.prototype.round = function(decimals)
    {
        if (decimals == undefined)
            decimals = 0;

        decimals = Math.pow(10, decimals);

        return Math.round(this * decimals) / decimals;
    }
};
