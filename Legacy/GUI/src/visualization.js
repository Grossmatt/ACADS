var Chart = require('chart.js');
var vtx = document.getElementById('feedbackVoltageChart').getContext('2d');
var ptx = document.getElementById('feedbackPositionChart').getContext('2d');


var feedbackVoltageChart = new Chart(vtx, {
    type: 'line',
    data: {
        labels: ['Supply Voltage 1', 'Supply Voltage 2', 'Braking Voltage'],
        datasets: [{
            label: ['Supply Voltage 1'],
            data: [{
                x: 0.0,
                y: 0.0
            }],
            fill: false,
            yAxisID: 'Voltage',
            borderWidth: 2,
            borderColor: '#ff6384',
            backgroundColor: '#ff6384'
            },
            {label: 'Supply Voltage 2',
            data: [{
            }],
            fill: false,
            yAxisID: 'Voltage',
            borderWidth: 2,
            borderColor: '#36a2eb',
            backgroundColor: '#36a2eb'
            },
            {label: 'Braking Voltage',
            data: [{
                x: 0.0,
                y: 0.0
            }],
            fill: false,
            yAxisID: 'Voltage',
            borderWidth: 2,
            borderColor: '#cc65fe',
            backgroundColor: '#cc65fe'
            }
    ]},
    options: {
        scales: {
           xAxes: [{
               type: 'linear',
               beginAtZero: true,
               ticks: {
                   min: 0,
                   stepSize: .2
               },
               scaleLabel: {
                   display: true, 
                   labelString: "Time (Seconds)"
               }
           }] ,  
           yAxes: [{
               id: 'Voltage',
               type: 'linear',
               position: 'left',
               min: 0,
               max: 3.5,
               scaleLabel: {
                display: true, 
                labelString: "Voltage (Volts)"
            }

           }]
        },
        responsive: true,
        maintainAspectRatio: false,
    }
});

var feedbackPositionChart = new Chart(ptx, {
    type: 'line',
    data: {
        labels: ['Position 1'],
        datasets: [{
            label: 'Position 1',
            data: [{
                x: 0.0,
                y: 0.0
            }],
            fill: false,
            xAxisID: 'Time',
            yAxisID: 'Position',
            borderWidth: 1,
            borderColor: '#16a975',
            backgroundColor: '#16a975'
            },
            {label: 'Position 2',
            data: [{
                x: 0.0,
                y: 0.0
            }],
            fill: false,
            xAxesID: 'Time',
            yAxisID: 'Position',
            borderWidth: 1,
            borderColor: '#003366',
            backgroundColor: '#003366'
            }
    ]},
    options: {
        scales: {
           xAxes: [{
               id: 'Time',
               type: 'linear',
               beginAtZero: true,
               ticks: {
                   min: 0,
                   stepSize: .2
               },
               scaleLabel: {
                display: true, 
                labelString: "Time (Seconds)"
            }
           }] ,  
           yAxes: [{
               id: 'Position',
               type: 'linear',
               position: 'left',
               min: -40,
               max: 40,
               scaleLabel: {
                display: true, 
                labelString: "Position (Degrees)"
            }

           }]
        },
        responsive: true,
        maintainAspectRatio: false,
    }
});

function addData(chart, label, data){
    chart.data.datasets.forEach((dataset) => {
        if(dataset.label == label)
            dataset.data.push(data);
    });
    chart.update();
}

function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
}

