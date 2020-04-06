class ObjectUtils
{
	static keys(obj)
	{
		return Object.keys(obj);
	}

	static values(obj)
	{
		return Object.values(obj);
	}

	static valuesAsc(obj)
	{
		return Object.values(obj).sort(function(a,b) { return a - b; });
	}

	static valuesDesc(obj)
	{
		return Object.values(obj).sort(function(a,b) { return b - a; });
	}

	static hasKey(obj, key)
	{
		return obj.hasOwnProperty(key);
	}

	static createKey(obj, key, defaultValue, overwrite)
	{
		if (!obj.hasOwnProperty(key) || (obj.hasOwnProperty(key) && overwrite === true))
		{
			obj[key] = defaultValue;
			return true;
		}
		return false;
	}

	static incrementKey(obj, key, amount, startValue)
	{
		if (startValue == undefined)
			startValue = 0;

		this.createKey(obj, key, startValue, false);
		obj[key] += amount;
	}

	static addToKey(obj, key, values)
	{
		if (!this.createKey(obj, key, values, false))
		{
			if (obj[key].length != values.length)
				console.error('ObjectUtils.addToKey: Value arrays should be of the same length');

			var l = Math.min(obj[key].length, values.length);

			for (var i = 0; i < l; i++)
			{
				obj[key].add(i, values[i]);
			}
		}
	}

	static dump(obj)
	{
		var keys = this.keys(obj);
		var dumpobj = {};
		for (var i = 0; i < keys.length; i++)
		{
			dumpobj[keys[i]] = obj[keys[i]];
		}
		console.log(dumpobj);
	}
}
