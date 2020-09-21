if (!Math.caseFatalityRate)
{
    Math.caseFatalityRate = function(infections, deaths)
    {
        return parseFloat(deaths) / parseFloat(infections);
    }
};

if (!Math.ratioNewToRecovered)
{
    Math.ratioNewToRecovered = function(active, recovered)
    {
        return parseFloat(active) / parseFloat(recovered);
    }
};

if (!Math.infectionChance)
{
    Math.infectionChance = function(infections, deaths, population, peopleMet)
    {
        return ((parseFloat(infections) - parseFloat(deaths)) / parseFloat(population)) * peopleMet;
    }
};

if (!Math.absoluteChange)
{
    Math.absoluteChange = function(last, curr)
    {
        return parseFloat(curr) - parseFloat(last);
    }
};

if (!Math.percentageChange)
{
    Math.percentageChange = function(last, curr)
    {
        return this.absoluteChange(last, curr) / parseFloat(last);
    }
};

if (!Math.doublingInXDays)
{
    Math.doublingInXDays = function(last, curr)
    {
        return this.log(2) / this.log(parseFloat(curr) / parseFloat(last));
    }
};

if (!Math.entirePopulationAffectedInXDays)
{
    Math.entirePopulationAffectedInXDays = function(population, last, curr)
    {
        population = parseFloat(population);
        curr = parseFloat(curr);
        last = parseFloat(last);
        return this.log(population / curr) / this.log(curr / last);
    }
};
