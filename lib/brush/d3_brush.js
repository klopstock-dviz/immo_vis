function brush_scatterPlot(params_chart, htmlNode, sharedParams) {
    const chart_instance = params_chart.chart_instance

    //set margin bottom
    htmlNode.style="margin-bottom: 60px"
    const htmlNode_name = '#'+htmlNode.id
    const margin = { top: chart_instance.chartArea.top, right: chart_instance.chartArea.right, 
                    bottom: chart_instance.chartArea.bottom, left: chart_instance.chartArea.left };
    params_chart.chartArea = _.cloneDeep(margin)
    const outerWidth = chart_instance.width;
    const outerHeight = chart_instance.height;

    const width = margin.right
    const height = margin.bottom


    //adjust the dimensions of the parent container to the svg area
    htmlNode.style.height = height + 'px';
    htmlNode.style.width = width + 'px';


    const container = d3.select(htmlNode_name);
    // Init SVG
    const svgChart = container.append('svg:svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'svg-plot' + '_' + htmlNode.id)
        .attr('style', 'position: absolute')
        //.attr('style', 'margin-top: ' + margin.top + 'px')
        .append('g')
        .attr('id', 'transformer' + '_' + htmlNode.id)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
        

    
    var canvasChart_id = chart_instance.canvas.id
    var canvasChart = document.getElementById(canvasChart_id)//.getContext('2d');



    //const svgSceen = document.getElementsByClassName('svg-plot')[0]
    //const svgSceen = document.getElementById('transformer' + '_' + htmlNode.id)
    const svgSceen = document.getElementsByClassName('svg-plot' + '_' + htmlNode.id)[0]
    
    svgSceen.style.display = 'none'
    
    Object.assign(sharedParams.interaction_events, {[canvasChart_id]: {type_event: {click: false}, brushed: false}})
    

    canvasChart.onmousedown = function(evt) {
        var canvasChart_id = chart_instance.canvas.id

        //if the click occurs only inside the plot area (out of the legends area), activate the svg screen
        if (evt.clientY > chart_instance.chartArea.top) {
            //const svgSceen = document.getElementsByClassName('svg-plot')[0]
            //const svgSceen = document.getElementById('transformer' + '_' + htmlNode.id)
             const svgSceen = document.getElementsByClassName('svg-plot'+ '_' + htmlNode.id)[0]
            if (svgSceen.style.display === 'none') {
                svgSceen.style.display = 'block'
                //var svgChart = svg-plot
                /*var brushSvg = document.getElementsByClassName('brush');
                brushSvg.call(brush);*/
            }
        }
    }

    //on double click, exit the svg screen and show the canvas chart
    svgSceen.ondblclick = function(evt) {
        //const svgSceen = document.getElementsByClassName('svg-plot')[0]
        if (svgSceen.style.display === 'block') {
            svgSceen.style.display = 'none';
            sharedParams.interaction_events[canvasChart_id].brushed = false
            restorColors(params_chart, sharedParams)
        }

    }

    



    const brush = d3.brush().extent([[0, 0], [width-margin.left + 7, height-margin.top]])
        .on("start", () => { brush_startEvent(); })
        .on("brush", () => { brush_brushEvent(); })
        .on("end", () => { brush_endEvent(); })
        .on("start.nokey", function() {
            d3.select(window).on("keydown.brush keyup.brush", null);
        });

    const brushSvg = svgChart
        .append("g")
        .attr("class", "brush")
        .attr("id", "brush_" + canvasChart_id)
        .call(brush);


    
    //get scales of the chart
    function getChartScales(chart_instance) {
        //axis x
        var minValue = chart_instance.scales["x-axis-1"]["min"]
        var maxValue = chart_instance.scales["x-axis-1"]["max"]
        var width = chart_instance.scales["x-axis-1"]["width"]

        var axis_x = {minValue, maxValue, width}

        //axis y
        var minValue = chart_instance.scales["y-axis-1"]["min"]
        var maxValue = chart_instance.scales["y-axis-1"]["max"]
        var height = chart_instance.scales["y-axis-1"]["height"]

        var axis_y = {minValue, maxValue, height}

        return {axis_x: axis_x, axis_y: axis_y}
    }


    let brushStartPoint = null;

    function brush_startEvent() {
        console.log('start');
        var s = d3.event.selection

        var check_brush_state = d3.sum(s[0]) - d3.sum(s[1])
        
        //if the brush is inactiv, restore original colors
        if (check_brush_state === 0) {
            restorColors(params_chart, sharedParams);
            params_chart.brush_values = {}
            params_chart.brush_keys_values = {}
        }
    }

    function brush_brushEvent() {
        const s = d3.event.selection;
        if (s && params_chart.selection_params.brush.mode === 'brushEvent') {
            activate_brush(s)

        }        
    }


    function brush_endEvent() {
        const s = d3.event.selection;
        console.log(s)
        if (s) {
            activate_brush(s)

        }
    }


    //save the pos of the svg screen components
    var id = params_chart.chart_instance.canvas.parentNode.id;var querySelectorOverlay = '#' + id + ' > svg > g > g > rect.overlay';
    var overlay = document.querySelector(querySelectorOverlay)
    params_chart.brush_area = {overlay: {x: overlay.x.baseVal.value, y: overlay.y.baseVal.value, width: overlay.width.baseVal.value, height: overlay.height.baseVal.value},
                                gap_left:0, gap_top: 0}



    function activate_brush(s) {
        const axis_params = getChartScales(chart_instance)
        var axis_x = [s[0][0], s[1][0]].sort(function(a, b){return a-b}), axis_y = [s[0][1], s[1][1]].sort(function(a, b){return a-b});
        var x1_px = axis_x[0], x2_px = axis_x[1], y1_px = axis_y[0], y2_px = axis_y[1];

        //adjustments to the chart area
        //calculate the gap between the previous left position of the chart area and the current left position        
        /*var gap_left = params_chart.chartArea.left - params_chart.chart_instance.chartArea.left; var gap_top = params_chart.chartArea.top - params_chart.chart_instance.chartArea.top;
        x1_px = x1_px + gap_left; x2_px = x2_px + gap_left; y1_px = y1_px + gap_top; y2_px = y2_px + gap_top*/


        var x1_value = (x1_px * axis_params.axis_x.maxValue) / axis_params.axis_x.width, x2_value = (x2_px * axis_params.axis_x.maxValue) / axis_params.axis_x.width;
        var y1_value = axis_params.axis_y.maxValue - ((y1_px * axis_params.axis_y.maxValue) / axis_params.axis_y.height)
        var y2_value = axis_params.axis_y.maxValue - ((y2_px * axis_params.axis_y.maxValue) / axis_params.axis_y.height)
        var axis_x = [x1_value, x2_value].sort(function(a, b){return a-b}); axis_y = [y1_value, y2_value].sort(function(a, b){return a-b});        
        var brush_values = {x1: axis_x[0], x2: axis_x[1], y1: axis_y[0], y2: axis_y[1]}
        params_chart.brush_values = brush_values

        //translate brush values coordinates into store format
        var x = (Math.round(params_chart.brush_values.x1 * 10000) / 10000).toString() + "-" + (Math.round(params_chart.brush_values.x2 * 10000) / 10000).toString()
        var y = (Math.round(params_chart.brush_values.y1 * 10000) / 10000).toString() + "-" + (Math.round(params_chart.brush_values.y2 * 10000) / 10000).toString()
        params_chart.brush_keys_values[params_chart.x_field + "_brushed"] = [x]; params_chart.brush_keys_values[params_chart.y_field + "_brushed"] = [y];

        console.log("brush_endEvent s: "+s); console.log(params_chart.brush_keys_values)



        
        restorColors(params_chart, sharedParams)
        //highlight brushed zone
        highlight_brush(params_chart)

        sharedParams.interaction_events[canvasChart_id].brushed = true        
    }   


}





function adapt_brush_v2(params_chart) {
    //refresh colors
    //restorColors()
    //highlight brushed zone
    highlight_brush(params_chart)



    //get the sizes of the brush box
    //get the id of the parent node
    var id = params_chart.chart_instance.canvas.parentNode.id



    //adjustments to the chart area after it's first init
    reposition_brushTransformer(params_chart)
    reposition_brush(params_chart)

}


function reposition_brushTransformer(params_chart) {


        if (params_chart.chartArea) {
            //get the scales and values of the current scatterplot
            var scaleWidth = params_chart.chart_instance.scales["x-axis-1"].width; var scale_x_MaxValue = params_chart.chart_instance.scales["x-axis-1"].end// - params_chart.chart_instance.scales["x-axis-1"].start;
            var scaleHeight = params_chart.chart_instance.scales["y-axis-1"].height; var scale_y_MaxValue = params_chart.chart_instance.scales["y-axis-1"].end// - params_chart.chart_instance.scales["y-axis-1"].start

            //calculate the gap between the previous left position of the chart area and the current left position
            var gap_left = params_chart.chartArea.left - params_chart.chart_instance.chartArea.left; var gap_top = params_chart.chartArea.top - params_chart.chart_instance.chartArea.top;

            if (gap_top > 0) {params_chart.brush_area.gap_top = gap_top}

            //apply the adjustment to the overlay
            if (!isNaN(gap_left)) {
                var id = params_chart.chart_instance.canvas.parentNode.id; var querySelector = '#transformer_' + id; transformer_brush = d3.select(querySelector)
                
                
                if (gap_left > 0 ) { //&& (gap_left + overlay.x.baseVal.value) !== 0
                    transformer_brush.attr('transform', `translate(${params_chart.chartArea.left - gap_left}, ${params_chart.chartArea.top})`);
                    //brushBox.call(d3.brush().extent([[0, 0], [530, 253]]))
                    var width = params_chart.chartArea.right - params_chart.chartArea.left + gap_left
                    transformer_brush.attr('width', width)
                    params_chart.brush_area.gap_left = gap_left
                }
                else if (gap_left === 0) {
                    transformer_brush.attr('transform', `translate(${params_chart.chartArea.left}, ${params_chart.chartArea.top})`);
                }


            }
        }
}




function reposition_brush(params_chart) {
    if (params_chart.chartArea) {
        //get the scales and values of the current scatterplot
        var scaleWidth = params_chart.chart_instance.scales["x-axis-1"].width;
        var scaleHeight = params_chart.chart_instance.scales["y-axis-1"].height; 
        
        
        //check if the plot has hidden datasets before getting max values
        var check_plot_rendered = params_chart.chart_instance.legend.legendItems.filter(t=> t.text !=="").map(h=> h.hidden).filter(h=> h === false).length
        if (check_plot_rendered === 0) {
            //if the plot has hidden datasets, turn them on & get the data scales
            //get the indexes of the hidden datasets
            var datasetIndex = params_chart.chart_instance.legend.legendItems.filter(t=> t.text !=="").map(d=> d.datasetIndex)
            //show all hidden datasets
            datasetIndex.map(d=> params_chart.chart_instance.getDatasetMeta(d).hidden = false);
            params_chart.chart_instance.update(0);
            
            //var scale_x_MaxValue = params_chart.scale_x_MaxValue; var scale_y_MaxValue = params_chart.scale_y_MaxValue
            var scale_x_MaxValue = params_chart.chart_instance.scales["x-axis-1"].end// - params_chart.chart_instance.scales["x-axis-1"].start;
            var scale_y_MaxValue = params_chart.chart_instance.scales["y-axis-1"].end// - params_chart.chart_instance.scales["y-axis-1"].start            
        }
        else {
            var scale_x_MaxValue = params_chart.chart_instance.scales["x-axis-1"].end// - params_chart.chart_instance.scales["x-axis-1"].start;
            var scale_y_MaxValue = params_chart.chart_instance.scales["y-axis-1"].end// - params_chart.chart_instance.scales["y-axis-1"].start
        }

        //calculate the scales of the new brush box
        var x_start = (params_chart.brush_values.x1 * scaleWidth) / scale_x_MaxValue; var x_end = (params_chart.brush_values.x2 * scaleWidth) / scale_x_MaxValue;
        var y_start = ((scale_y_MaxValue - params_chart.brush_values.y2) * scaleHeight) / scale_y_MaxValue; var y_end = ((scale_y_MaxValue - params_chart.brush_values.y1) * scaleHeight) / scale_y_MaxValue;

        //calculate the gap between the previous left position of the chart area and the current left position
        var gap_left = params_chart.chartArea.left - params_chart.chart_instance.chartArea.left; var gap_top = params_chart.chartArea.top - params_chart.chart_instance.chartArea.top;
        if (gap_left > 0) {params_chart.brush_area.gap_left = gap_left}
        if (gap_top > 0) {params_chart.brush_area.gap_top = gap_top}

        //apply the adjustment to the brush
        //apply the adjustment to the overlay
        if (!isNaN(gap_left) && !isNaN(x_start)) {

            //select the brush node
            //get the id of the canvas chart
            var canvasChart_id = params_chart.chart_instance.canvas.id; //var querySelector_selection = "#" + id + " > svg > g > g > rect.selection"
            var brushBox = d3.select('#brush_' + canvasChart_id)

            //adjust the gap of the brush area if there are hidden datasets
            if (check_plot_rendered === 0) {
                x_start = x_start + params_chart.brush_area.gap_left; x_end = x_end + params_chart.brush_area.gap_left;
            }

            if (brushBox) {
                var x_start_options = [0, x_start]; var x_end_options = [scaleWidth, x_end]; var y_start_options = [0, y_start]; var y_end_options = [scaleHeight, y_end]
                try {
                    brushBox.call(d3.brush().move, [
                        [d3.max(x_start_options), d3.max(y_start_options)], [d3.min(x_end_options), d3.min(y_end_options)]
                    ])
                }
                catch {}
            }
        }
    }
}






function restorColors(params_chart, sharedParams) {
    //restore original colors
    var canvasChart_id = params_chart.chart_instance.canvas.id;
    if (sharedParams.interaction_events[canvasChart_id].brushed === true) {
        params_chart.chart_instance.data.datasets.map(dset=> {

            var label = dset.label;
            if (label !== "") {
                var backgroundColorArray = (params_chart.backgroundColorArray_source[label]+"|").repeat(dset.data.length).split("|").filter(e=> e !== ',' && e !== '')
                dset.backgroundColor = backgroundColorArray
            }
        })
        params_chart.chart_instance.update(0);
    }
}





function highlight_brush(params_chart) {
    var brush_values = _.cloneDeep(params_chart.brush_values)
    params_chart.chart_instance.data.datasets.map(dset=> {
    var dset_length = dset.data.length

    for (var i = 0; i < dset_length; i++) {
        var x = dset.data[i].x;
        var y = dset.data[i].y;

        if ((x > brush_values.x1 && x < brush_values.x2) && (y > brush_values.y1 && y < brush_values.y2)) {
            //dset.backgroundColor[i] = dset.backgroundColor[i].replace('0.65', '1')
        }
        else {
            dset.backgroundColor[i] = "rgba(240, 240, 240, 0.5)";
        }

    }

    });

    params_chart.chart_instance.update(0)
}