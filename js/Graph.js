class Graph
{
	static generateData(title, dataInfected, dataRecovered, dataActive, dataDeaths, yAxisMin, position) 
	{
		var labels = [];
        var NOW = Date.now();
        var d;

        for (var i = 0; i < dataInfected.length; i++) {
            d = new Date(NOW - (dataInfected.length - i) * (1000 * 60 * 60 * 24));
            labels.push(d);
        }

		return {
			type: 'line',
			data: {
				labels: labels,
				datasets: [
					{ 
						pointStyle: 'circle',
						pointRadius: 0,
						pointHoverRadius: 2,
						data: dataInfected,
						label: "Infected",
						borderColor: Config.graphColorConfirmed,
						borderWidth: 1,
						fill: false
					}, 
					{ 
						pointStyle: 'circle',
						pointRadius: 0,
						pointHoverRadius: 2,
						data: dataRecovered,
						label: "Recovered (estimate)",
						borderColor: Config.graphColorRecovered,
						borderWidth: 1,
						fill: false
					}, 
					{ 
						pointStyle: 'circle',
						pointRadius: 0,
						pointHoverRadius: 2,
						data: dataActive,
						label: "Active Cases (estimate)",
						borderColor: Config.graphColorActive,
						borderWidth: 1,
						fill: false

					}, 
					{ 
						pointStyle: 'circle',
						pointRadius: 0,
						pointHoverRadius: 2,
						data: dataDeaths,
						label: "Deaths",
						borderColor: Config.graphColorDeaths,
						borderWidth: 1,
						fill: false
					}
				]
			},
			options: {
				maintainAspectRatio: false,
				title: {
					display: true,
					text: title
				},
				scales: {
	                xAxes: [
		                {
		                    type: 'time',
		                    gridLines: {
		                    	color: Config.graphColorGrid,
		                    },
		                    time: {
		                        unit: 'month'
		                    },
	                    	ticks: {
	                           fontSize: 10,
		                    }
		                }
		            ],
	                yAxes: [
	                	{
		                	position: position == undefined ? 'left' : position,
		                    gridLines: {
		                    	color: Config.graphColorGrid,
		                    },
	                    	ticks: {
	                        	beginAtZero: true,
		                        min: yAxisMin,
		                        fontSize: 10,
		                    }
	                	}
	                ]
	            },
	            events: [],
				tooltips: {
					enabled: false,
				},
				hover: {
					enabled: false,
				},
				legend: {
					position: 'bottom'
				},
		        layout: {
		            padding: {
		                left: 25,
		                right: 25,
		                top: 0,
		                bottom: 0
		            }
		        }
			}
		};            
	}

	constructor(country)
	{
		var data = CoronaTracker.data[Config.alias(country.replace(/(.*)\s+\[.*?\]/g, '$1'))];

		this.confirmed = [];
	    this.deaths = [];
	    this.active = [];
	    this.active3wk = [];
	    this.recovered = [];
		this.confirmedChangeAbs = [];
	    this.deathsChangeAbs = [];
	    this.recoveredChangeAbs = [];
	    this.activeChangeAbs = [];
	    this.estimatedInfectionRate = [];
	    
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
	}
}
