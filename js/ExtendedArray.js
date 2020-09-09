if (!Array.prototype.last)
{
    Array.prototype.last = function(offset)
    {
        if (offset == undefined) offset = 0;
        return this[Math.max(0, this.length - 1 - offset)];
    };
};

if (!Array.prototype.pop)
{
    Array.prototype.pop = function(n)
    {
        if (n == undefined)
            n = 1;
        var elem = null;
        while (n > 0)
        {
            elem = this.pop();
            n--;
        }

        return elem;
    };
};

if (!Array.prototype.max)
{
    Array.prototype.max = function()
    {
        var max = null;
        for (var i = 0; i < this.length; i++) {
            if (max == null || this[i] > max)
                max = this[i];
        }
        return max;
    };
};

if (!Array.prototype.min)
{
    Array.prototype.min = function()
    {
        var min = null;
        for (var i = 0; i < this.length; i++) {
            if (min == null || this[i] < min)
                min = this[i];
        }
        return min;
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

if (!Array.prototype.normalize)
{
    Array.prototype.normalize = function(max)
    {
        if (max == undefined)
            max = this.max();
        
        for (var i = 0; i < this.length; i++) {
            this[i] = this[i] / max;
        }

        return this;
    };
};

if (!Array.prototype.merge)
{
    Array.prototype.merge = function(array)
    {
        if (array == undefined)
            array = [];
        
        var i = 0;        
        var l = Math.min(array.length, this.length);

        for (i; i < l; i++) {
            this[i] += array[i];
        }

        l = array.length;

        for (i; i < l; i++) {
            this[i] = array[i];
        }

        return this;
    };
};

if (!Array.prototype.sum)
{
    Array.prototype.sum = function(start, length)
    {   
        if (start == undefined || start == -0)
            start = 0;
        else if (start < 0)
            start = this.length + start;

        var end = Math.min(start + (length == undefined ? this.length : length), this.length);
        var s = 0;

        for (start; start < end; start++) {
            s += this[start];
        }

        return s;
    };
};

if (!Array.prototype.average)
{
    Array.prototype.average = function(start, length)
    {
        if (start == undefined || start == -0)
            start = 0;
        else if (start < 0)
            start = this.length + start;

        var end = Math.min(start + (length == undefined ? this.length : length), this.length);
        length = end - start;
        var s = 0;

        for (start; start < end; start++) {
            s += this[start];
        }

        return s / length;
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

if (!Array.prototype.delta)
{
    // data is the array to subtract from *this* array
    // offset is the offset between array the arrays
    // fillValue is inserted at the beginning to pad the output array
    Array.prototype.delta = function(data, offset, fillValue)
    {
        if (fillValue == undefined)
            fillValue = 0;

        if (offset == undefined)
            offset = 0;

        var res = [];
        var i = 0;

        for (i; i < offset; i++) {
            res[i] = fillValue;
        }
        
        for (i; i < this.length; i++) {
            res[i] = this[i - offset] - data[i];
        }

        return res;
    }
};
