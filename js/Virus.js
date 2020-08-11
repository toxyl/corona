class RecursiveTree 
{
	constructor(name)
	{
		this.name = name;
	}

	isGroup()
	{
		return this.members != undefined && this.members.length > 0;
	}

	add(name)
	{
		var v = new this.constructor(name);
		if (this.members == undefined)
			this.members = [ ];
		this.members.push(v);
		return v;
	}

	addMember(obj)
	{
		if (this.members == undefined)
			this.members = [ ];
		this.members.push(obj);
		return obj;
	}

	increment(key, increment)
	{
		if (this[key] == undefined) 
			this[key] = 0;
		this[key] += increment;
		return this;
	}

	value(key)
	{
		if (this[key] == undefined) 
			return 0;
		return this[key];
	}

	sum(key)
	{
		if (this.members != undefined && this.members.length > 0)
		{
			var v;
			var sum = 0;
			for (var i = 0; i < this.members.length; i++)
			{
				v = this.members[i];
				if (v.isGroup())
					sum += v.sum(key);
				else
					sum += v[key] == undefined ? 0 : v[key];
			}

			return sum;
		}
		return this[key] == undefined ? 0 : this[key];
	}

	keys()
	{
		var keys = Object.keys(this);
		for (var i = 0; i < keys.length; i++)
		{
			if (keys[i] == 'members') // this is a group
			{
				for (var j = 0; j < this.members.length; j++)
				{
					keys = keys.concat(this.members[j].keys());					
				}
				keys = keys.sort().filter((v, i, a) => a.indexOf(v) === i);
			}
		}
		return keys;
	}

	print(depth)
	{
		if (depth == undefined)
			depth = 0;

		var keys = this.keys();
		var sums = [];
		for (var i = 0; i < keys.length; i++)
		{
			if (keys[i] != 'name' && keys[i] != 'members')
				sums.push(keys[i] + ': ' + this.sum(keys[i]))
		}

		console.log("\t".repeat(depth) + this.name + ' (' + sums.join(', ') + ')');

		if (this.members != undefined && this.members.length > 0)
		{
			var v;
			for (var i = 0; i < this.members.length; i++)
			{
				v = this.members[i];
				v.print(depth + 1);					
			}
		}
	}

	json()
	{
		var struct = { };

		struct.name = this.name;
		var keys = this.keys();
		for (var i = 0; i < keys.length; i++)
		{
			if (keys[i] != 'name' && keys[i] != 'members')
				struct[keys[i]] = this.sum(keys[i]);
		}

		if (this.isGroup())
		{
			struct.members = [];

			var v;
			for (var i = 0; i < this.members.length; i++)
			{
				v = this.members[i];
				struct.members.push(v.json());
			}
		}
		return struct;
	}

	find(path)
	{
		path = path.split('.');
		if (path.length == 1 && this.name == path[0])
		{
			return this;
		}
		else
		{
			if (this.name == path[0])
			{
				path.shift();
			}

			var v;
			for (var i = 0; i < this.members.length; i++)
			{
				v = this.members[i];
				if (v.name == path[0])
					return v.find(path.join('.'));
			}
		}
		return null;
	}
}

class Virus extends RecursiveTree
{
	static filter(filter)
	{
		var all = new Virus('World-Wide');
		var consCorona = all.add('Covid-19');
		var cs = [];
		var countries = ObjectUtils.keys(CoronaTracker.data);
		var d = null;

		for (var i = 0; i < countries.length; i++) {

			d = CoronaTracker.data[countries[i]];

			cs.push(consCorona.
				add(countries[i]).
				increment('population', d.latest.population).
				increment('infected', d.latest.confirmed.total.absolute.current).
				increment('infected_change', d.latest.confirmed.change.absolute).
				increment('dead', d.latest.deaths.total.absolute.current).
				increment('dead_change', d.latest.deaths.change.absolute).
				increment('recovered', d.latest.recovered.total.absolute.current).
				increment('recovered_change', d.latest.recovered.change.absolute)
			);
		}

		var selection = new Virus('Selection');

		for (var i = 0; i < cs.length; i++) 
		{
			if (filter != undefined && filter.length > 0 && filter.indexOf(countries[i]) < 0)
				continue;

			if (cs[i].value('population') <= 0)
				continue;

			selection.addMember(cs[i]);
		}

		return {
			all: all,
			selection: selection
		};
	}

	static printToConsole(filter)
	{
		var res = this.filter(filter);

		for (var i = 0; i < res.selection.members.length; i++) 
		{
			res.selection.members[i].printStats();
		}

		res.all.printStats();
		res.selection.printStats();
	}

	static plotData(filter)
	{

	}

	printStats()
	{
		console.log(this.name);
		console.log('='.repeat(this.name.length));
		console.log('Population:             ' + this.totalPopulation() + ' / 100%');
		console.log('Population (infected):  ' + this.totalInfected() + ' / ' + this.infectedPopulation() + ' / +' + this.newInfected());
		console.log('Population (recovered): ' + this.totalRecovered() + ' / ' + this.recoveredPopulation() + ' / +' + this.newRecovered());
		console.log('Population (dead):      ' + this.totalDead() + ' / ' + this.deadPopulation() + ' / +' + this.newDead());

		console.log('Active cases:           ' + this.activeCases());
		console.log('Case Fatality Rate:     ' + this.caseFatalityRate());
		console.log('Infection Chance (10):  ' + this.infectionChance(10));
		console.log('Infection Chance (50):  ' + this.infectionChance(50));
		console.log('Infection Chance (100): ' + this.infectionChance(100));
		console.log('------------------------------------------------------');
	}

	newDead()
	{
		return this.sum('dead_change');
	}

	totalDead()
	{
		return this.sum('dead');
	}

	totalRecovered()
	{
		return -this.sum('recovered');
	}

	newRecovered()
	{
		return -this.sum('recovered_change');
	}

	totalInfected()
	{
		return this.sum('infected');
	}

	newInfected()
	{
		return this.sum('infected_change');
	}

	totalPopulation()
	{
		return this.sum('population');
	}

	caseFatalityRate()
	{
		return Number(this.totalDead() / this.totalInfected()).toPercent();
	}

	activeCases()
	{
		return this.totalInfected() - this.totalDead() + this.totalRecovered();
	}

	infectedPopulation()
	{
		return Number(this.activeCases() / this.totalPopulation()).toPercent();
	}

	deadPopulation()
	{
		return Number(this.totalDead() / this.totalPopulation()).toPercent();
	}

	recoveredPopulation()
	{
		return Number(this.totalRecovered() / this.totalPopulation()).toPercent();
	}

	infectionChance(peopleMet)
	{
		return Number((this.activeCases() / this.totalPopulation()) * peopleMet).toPercent();
	}

}

