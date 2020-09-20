class Graph
{
	constructor(data)
	{
		this.width = Config.graphWidth;
		this.height = Config.graphHeight;

		this.confirmed = [];
	    this.deaths = [];
	    this.active = [];
	    this.recovered = [];
		this.confirmedChangeAbs = [];
	    this.deathsChangeAbs = [];
	    this.recoveredChangeAbs = [];
	    this.activeChangeAbs = [];
	    this.estimatedInfectionRate = [];

	    this.first = {};
	    
	    if (data != undefined)
	    {
	        this.confirmed = data.confirmed.total;
	        this.deaths = data.deaths.total;
	        this.active = data.active.total;
	        this.recovered = data.recovered.total;
	        this.confirmedChangeAbs = data.confirmed.absolute;
	        this.deathsChangeAbs = data.deaths.absolute;
	        this.recoveredChangeAbs = data.recovered.absolute;
	        this.activeChangeAbs = data.active.absolute;
	    }

	    this.scale = Math.ceil(this.width / (this.confirmed.length-1));
	    this.scaleH = 1 / this.confirmed.last(1);
	}

	grid()
	{
	    var grid = "";
	    for (var i = 0; i < this.confirmed.length; i++)
	    {
	        grid += this.verticalLine(i * this.scale, Config.graphColorGrid);
	    }
	    return grid;
	}

	verticalLine(x, color) 
    {
        return '<polyline points="' + x +',0 ' + x + ',' + (this.height + 2) + '" style="stroke:' + color + '; stroke-width:1; fill:none"/>';
    }

    dataLine(name, data, color, strokeThickness, scale) 
    {
	    var path = '';
	    this.first[name] = 0;

	    for (var i = 0; i < data.length; i++)
	    {
	        path += (i * this.scale) + ',' + (this.height - (parseFloat(data[i]) * (scale == undefined ? this.scaleH : scale)) * this.height + 1).round() + " ";
	        if (data[i] <= 0) this.first[name]++;
	    }
	    this.first[name]--;
		
		var firstLine = this.verticalLine(this.first[name] * this.scale, color);	    
	    this.first[name] = data.length - this.first[name];

        return /* firstLine +*/ '<polyline points="' + path + '" style="stroke:' + color + '; stroke-width:' + (strokeThickness == undefined ? 2 : strokeThickness) + '; fill:none"/>';
    }

    generate()
    {
    	return 	"<svg width=\"" + ((this.confirmed.length - 1) * this.scale) + "\" height=\"" + (this.height + 2) + "\" style=\"border: 2px solid " + Config.graphColorGrid + "\">" + 
		        this.grid() + 
		        this.dataLine('death', this.deaths, Config.graphColorDeaths) + 
		        this.dataLine('confirmed', this.confirmed, Config.graphColorConfirmed) + 
		        this.dataLine('recovered', this.recovered, Config.graphColorRecovered, 1) + 
		        this.dataLine('active', this.active, Config.graphColorActive, 1) + 
		        "</svg>";
    }

    generateChangesGraph()
    {
    	var avgFactor = 0.25;
    	var dataDeath = this.deathsChangeAbs;
    	var dataConfirmed = this.confirmedChangeAbs;
    	var dataRecovered = this.recoveredChangeAbs.exponentialAverage(avgFactor);
    	var dataEstimatedActiveCases = this.activeChangeAbs.exponentialAverage(avgFactor);

    	dataDeath.pop();
    	dataConfirmed.pop();
    	dataRecovered.pop();
    	dataEstimatedActiveCases.pop();

	    var s = 1 / Math.max(dataDeath.max(), dataConfirmed.max(), dataEstimatedActiveCases.max());

    	return 	"<svg width=\"" + ((dataDeath.length - 1) * this.scale) + "\" height=\"" + (this.height + 2) + "\" style=\"border: 2px solid " + Config.graphColorGrid + "\">" + 
		        this.grid() + 
		        this.dataLine('deathChangeAbs', dataDeath, Config.graphColorDeaths, 2, s) + 
		        this.dataLine('confirmedChangeAbs', dataConfirmed, Config.graphColorConfirmed, 2, s) + 
		        this.dataLine('recovered', dataRecovered, Config.graphColorRecovered, 1, s) + 
		        this.dataLine('active', dataEstimatedActiveCases, Config.graphColorActive, 1, s) + 
		        "</svg>";
    }

}
