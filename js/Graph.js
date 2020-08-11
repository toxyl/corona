class Graph
{
	constructor(data)
	{
		this.width = Config.graphWidth;
		this.height = Config.graphHeight;

		this.confirmed = [];
	    this.deaths = [];
		this.confirmedChangeAbs = [];
	    this.deathsChangeAbs = [];
	    this.estimatedInfectionRate = [];

	    this.first = {};
	    
	    if (data != undefined)
	    {
	        this.confirmed = data.confirmed.total;
	        this.deaths = data.deaths.total;
	        this.confirmedChangeAbs = data.confirmed.absolute;
	        this.deathsChangeAbs = data.deaths.absolute;
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

        return firstLine + '<polyline points="' + path + '" style="stroke:' + color + '; stroke-width:' + (strokeThickness == undefined ? 2 : strokeThickness) + '; fill:none"/>';
    }

    generate()
    {
    	return 	"<svg width=\"" + ((this.confirmed.length - 1) * this.scale) + "\" height=\"" + (this.height + 2) + "\" style=\"border: 2px solid " + Config.graphColorGrid + "\">" + 
		        this.grid() + 
		        this.dataLine('death', this.deaths, Config.graphColorDeaths) + 
		        this.dataLine('confirmed', this.confirmed, Config.graphColorConfirmed) + 
		        this.dataLine('deathChangeAbs', this.deathsChangeAbs, Config.graphColorDeaths, 1) + 
		        this.dataLine('confirmedChangeAbs', this.confirmedChangeAbs, Config.graphColorConfirmed, 1) + 
		        "</svg>";
    }

}
