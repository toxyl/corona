if (!Array.prototype.last)
{
    Array.prototype.last = function(offset)
    {
        if (offset == undefined) offset = 0;
        return this[Math.max(0, this.length - 1 - offset)];
    };
};

if (!Array.prototype.add)
{
    Array.prototype.add = function(index, value)
    {
        this[index] += value;
        return this[index];
    };
};

if (!Array.prototype.subtract)
{
    Array.prototype.subtract = function(index, value)
    {
        this[index] -= value;
        return this[index];
    };
};

if (!Array.prototype.multiply)
{
    Array.prototype.multiply = function(index, value)
    {
        this[index] *= value;
        return this[index];
    };
};

if (!Array.prototype.divide)
{
    Array.prototype.divide = function(index, value)
    {
        this[index] /= value;
        return this[index];
    };
};

if (!Array.prototype.change)
{
    Array.prototype.change = function(index)
    {
        return {
            relative: this[index] / this[Math.max(0,index-1)] - 1,
            absolute: this[index] - this[Math.max(0,index-1)],
        };
    }
};

if (!Array.prototype.predict)
{
    Array.prototype.predict = function(days)
    {
        if (days == undefined) days = 1;
        var index = this.length - 1;
        var change = this.change(index+i).relative;

        for (var i = 0; i < days; i++)
        {
            change = this.change(index+i).relative;
            if (!Number.isFinite(change))
                change = 0;

            this.push(this[index+i] + this[index+i] * change);   
        }
        return this.last();
    }
};

if (!Array.prototype.predictUntil)
{
    Array.prototype.predictUntil = function(min, max, maxDays)
    {
        var days = 0;
        var prediction;
        var predictionPre;
        while (days < maxDays)
        {
            predictionPre = this.last();
            prediction = this.predict();

            if (prediction <= min || prediction >= max)
                break;

            days++;
        }

        return {
            "days": days,
            "prediction": predictionPre,
        };
    }
};

if (!Array.prototype.estimateInfectionRate)
{
    Array.prototype.estimateInfectionRate = function(incubationPeriod)
    {
        return this.last(1) / this.last(1+incubationPeriod);
    }
};
