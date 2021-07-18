class Graph
{
    static generateData(title, population, dataInfected, dataRecovered, dataActive, dataDeaths, dataPositiveRate, dataHospPatients, dataICUPatients, showSeverity, yAxisMin, position) 
    {
        population = parseInt(population);
        var labels = [];
        var NOW = Date.now();
        var d;

        for (var i = 0; i < dataInfected.length; i++) {
            d = new Date(NOW - (dataInfected.length - i) * (1000 * 60 * 60 * 24));
            labels.push(d);
        }

        var severityIndex = [];
        var da = dataActive.array().normalize();
        var darel = dataActive.array().divide(population).normalize();
        var di = dataInfected.array().normalize();
        var direl = dataInfected.array().divide(population).normalize();
        var dr = dataRecovered.array().normalize();
        var dd = dataDeaths.array().normalize();
        var ddrel = dataDeaths.array().divide(population).normalize();
        var dp = (dataPositiveRate != null ? dataPositiveRate.array() : []);
        var dh = dataHospPatients.array().normalize();
        var dhi = dataICUPatients.array().normalize();

        if (showSeverity) {
            for (var i = 0; i < dataInfected.length - 1; i++) {
                severityIndex.push(//Math.min(0.25,
                        (
                              (parseFloat(di[i+1]) - parseFloat(di[i])) * (1 + darel[i]) // delta normalized infections (%population) * 3
                            + (parseFloat(dd[i+1]) - parseFloat(dd[i])) * (1 + ddrel[i]) // delta normalized deaths (%population) * 3
                            + parseFloat(dp[i])/6                                        // positive test rate (1/6)
                            + darel[i]                                                   // active cases (%population)
                            // + direl[i]                                                   // total cases (%population)
                            // + ddrel[i]                                                   // total deaths (%population)
                        ) * 2.0
                   // )
                );
            }
            for (var i = 0; i < 1; i++)
            {
                severityIndex.push(severityIndex[severityIndex.length-1]);
            }

            severityIndex = severityIndex.exponentialAverage(0.1).multiply(5);
        }

        var norm = $('#cbnorm').prop('checked');

        var datasets = [
             { 
                pointStyle: 'circle',
                pointRadius: 0,
                pointHoverRadius: 2,
                data: norm ? di : dataInfected,
                label: "Infected",
                borderColor: Config.graphColorConfirmed,
                borderWidth: 1,
                fill: false
            }, 
            { 
                pointStyle: 'circle',
                pointRadius: 0,
                pointHoverRadius: 2,
                data: norm ? dr : dataRecovered,
                label: "Recovered (estimate)",
                borderColor: Config.graphColorRecovered,
                borderWidth: 1,
                fill: false
            }, 
            { 
                pointStyle: 'circle',
                pointRadius: 0,
                pointHoverRadius: 2,
                data: norm ? da : dataActive,
                label: "Active Cases (estimate)",
                borderColor: Config.graphColorActive,
                borderWidth: 1,
                fill: false

            }, 
            { 
                pointStyle: 'circle',
                pointRadius: 0,
                pointHoverRadius: 2,
                data: norm ? dd : dataDeaths,
                label: "Deaths",
                borderColor: Config.graphColorDeaths,
                borderWidth: 1,
                fill: false
            }, 
            { 
                pointStyle: 'circle',
                pointRadius: 0,
                pointHoverRadius: 2,
                data: norm ? dh : dataHospPatients,
                label: "Patients (hospital)",
                borderColor: Config.graphColorHospitalPatients,
                borderWidth: 1,
                fill: false
            },
            { 
                pointStyle: 'circle',
                pointRadius: 0,
                pointHoverRadius: 2,
                data: norm ? dhi : dataICUPatients,
                label: "Patients (ICU)",
                borderColor: Config.graphColorICUPatients,
                borderWidth: 1,
                fill: false
            },
        ];

        if (showSeverity && norm)
            datasets.push({ 
                display: showSeverity,
                pointStyle: 'circle',
                pointRadius: 0,
                pointHoverRadius: 2,
                data: dp,
                label: "Positive Test Rate",
                borderColor: '#cc00ff',
                borderWidth: 1,
                fill: false
            }, { 
                display: showSeverity,
                pointStyle: 'circle',
                pointRadius: 0,
                pointHoverRadius: 2,
                data: severityIndex,
                label: "Severity",
                borderColor: '#0000ff',
                borderWidth: 1,
                fill: false
            });

        return {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                animation: {
                    duration: 0
                },
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
                                color: norm ? Config.graphColorGrid2 : Config.graphColorGrid,
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
        var data = CoronaTracker.data[country];

        this.confirmed = [];
        this.deaths = [];
        this.active = [];
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
