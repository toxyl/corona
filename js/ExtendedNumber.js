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
