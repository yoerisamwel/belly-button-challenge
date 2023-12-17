// Setup variable for the json source and using the d3 library for this
const url = 'https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json';
const dataPromise = d3.json(url, d3.autoType);

function setDemographicdata(subjectId) {
    // Select the demographic info divisor tag
    let panelBody = d3.select('.panel-body');
    panelBody.text('');

    // Using json object dataPromise to populate the metadata info 
    dataPromise.then(data => {
        let metaData = data.metadata.filter(sample => sample.id.toString() === subjectId)[0];
    
        Object.entries(metaData).forEach(([k, v]) => {
            panelBody.append('h6').html(`<b>${k}:</b> ${v}`);
        });
    });
};

function setPlotlyGraphs(subjectId) {

    // This is a Sub function tto handle the needed labelings
    function setLabel(arr) {
        return arr.map(value => {
            if (value.match(';')) {
                return value.replace('Bacteria','<b>Bacteria</b>').replace(';', '<br>---------<br>').replaceAll(';', '<br>');
            } else {
                return value;
            }
        });
    };

    // Here I set the variables used to store information pulled with the json caller
    dataPromise.then(data => {
        let samples = data.samples;
        let sample = samples.filter(sample => sample.id.toString() === subjectId)[0];
        let sampleValues = sample.sample_values;
        let sampleIds = sample.otu_ids;

        // Setting up the Plotly bar chart
        let dataA = [{
            type: 'bar',
            x: sampleValues.slice(0, 10).reverse(),
            y: sampleIds.slice(0, 10).reverse().map(v => 'OTU ' + v),
            text: setLabel(sample.otu_labels.slice(0, 10).reverse()),
            orientation: 'h',
            marker: {color: sampleIds, colorscale: 'Greens'}
        }];

        // Set layout for the Plotly Bar chart
        let layoutA = {
            hoverlabel: {align: 'left'},
            margin: {l: 75, r: 0, b: 50, t: 5, pad: 4}
        };
        Plotly.newPlot('bar', dataA, layoutA);

        //Plotly Scatter Plot chart setup, display samples where x: otu_ids, y: sample_values, marker size: sample_values, marker colors: otu_ids, text values: otu_labels
        let dataB = [{
            type: 'scatter', mode: 'markers', x: sampleIds,y: sampleValues,
            text: setLabel(sample.otu_labels),
            marker: {size: sampleValues, color: sampleIds, colorscale: 'Greens'}
        }];
        // Set layout for the Plotly Scatterplot chart
        let layoutB = {
            hoverlabel: {align: 'left'},
            xaxis: {title: 'OTU ID'},
            margin: {l: 50, r: 50, b: 50, t: 50, pad: 4}
        };
        Plotly.newPlot('bubble', dataB, layoutB);

        // Create a Plotly gauge chart to plot the weekly washing frequency
        let wFreq = data.metadata.filter(sample => sample.id.toString() === subjectId)[0].wfreq;
        // Settting up the Plotly guage chart and the labels
        let DataC = [
            // config the arrow base position
            {
                type: 'scatter',
                x: [0],
                y: [0],
                marker: {size: 18, color: '850000'},
                showlegend: false
            },
            // configuring the Plotly gauge chart
            {
                type: 'pie',
                rotation: 90,
                values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
                text: ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9'],
                hole: 0.5,
                textposition: 'inside',
                showlegend: false,
                direction: 'clockwise',
                textinfo: "text",
                marker: {
                    colors: ['rgb(248,243,236)', 'rgb(244,241,228)', 
                        'rgb(233,230,201)', 'rgb(229,232,176)', 
                        'rgb(213,229,153)', 'rgb(183,205,143)', 
                        'rgb(138,192,134)', 'rgb(137,188,141)', 
                        'rgb(132,181,137)', 'white'
                    ],
                    labels: ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', ""],
                    line: {
                        color: 'brown',
                        width: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]
                    }
                }
            }
        ];

        //Set Plotly gauge layout and adding functionality to change the meter
        let LayoutC = {
            title: "<b>Belly Button Washing Frequency</b> <br>Scrubs Per Week</br>",
            shapes: [{
                type: 'path', path: gaugePointer(wFreq),
                fillcolor: '850000', line: { color: '850000' }
            }],
            autosize: true,
            showlegend: false,
            hovermode: false,
            xaxis: { zeroline: false, showgrid: false, visible: false, range: [-1, 1], fixedrange: true },
            yaxis: { zeroline: false, showgrid: false, visible: false, range: [-1, 1], fixedrange: true  }
        };

        Plotly.newPlot('gauge', DataC,LayoutC, {displayModeBar: false});
    })
};

// function to call setDemographicdata and setPlotlyGraphs and run them
function optionChanged(subjectId) {
    setDemographicdata(subjectId);
    setPlotlyGraphs(subjectId);
};

// Trigger to calculate meter point
function gaugePointer(value){
	
    var deg = (180 / 9) * value;
    var radius = 0.5;
    var radians = (deg * Math.PI) / 180;
    var x = -1 * radius * Math.cos(radians);
    var y = radius * Math.sin(radians);
    var mainPath = 'M -.0 -0.035 L .0 0.035 L ',
        pathX = String(x), space = ' ',
        pathY = String(y), pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);
	
	return path;
};

// init function
function init() {
    // Set the Sample ID dropdown list then append the sample id to new option
    let selMenu = d3.select('#selDataset');
    dataPromise.then(data => {
        let names = data.names;
        Object.values(names).forEach(value => {
            selMenu.append('option').attr('value', value).text(value);
        });
        optionChanged(selMenu.property('value'));
    });
};
init();