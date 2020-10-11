class SliderDoubleRange {

	createChart(params_chart, sharedParams) {
		//params_chart.transformations.crossfilter = {"INSEE_COM": ["33063", "33281"], nb_pieces: [2]}//, "33281"
		params_chart.rangeDataset = this.prepare_data_p1(params_chart, sharedParams)

		this.init_slider(params_chart, sharedParams)

		params_chart.chart_type = "slider"

		params_chart.instanciator = this
		params_chart.id = params_chart.htmlNode
		
		//add params chart to shared params if no present
		if (sharedParams.params_charts.includes(params_chart) === false) {
			sharedParams.params_charts.push(params_chart)
		}

		params_chart.created = true
	}

	updateChart(params_chart, sharedParams) {
		params_chart.range_field_created = undefined
		params_chart.blocked_by_user = false
		params_chart.rangeDataset = this.prepare_data_p1(params_chart, sharedParams)

    	if (params_chart.cells_format && params_chart.cells_format.decimals) {var decimal = params_chart.cells_format.decimals}
    	else if (params_chart.tooltips && params_chart.tooltips.decimals) {var decimal = params_chart.tooltips.decimals}	    		
    	else {var decimal = 2}
    	if (params_chart.rangeDataset.min && params_chart.rangeDataset.max) {
			var rangeDataset = [parseFloat(params_chart.rangeDataset.min.toFixed(decimal)), parseFloat(params_chart.rangeDataset.max.toFixed(decimal))]
		}
		else {
			var rangeDataset =[0, 0]
		}
		//update the range
		var slider = document.querySelector("#" + params_chart.htmlNode); var rangeCell = document.querySelector("#" + params_chart.htmlNode + "_rangeCell");
		var min = rangeDataset[0], max = rangeDataset[1]
		if (min === max && min !== 0) {
			min = min - (min/100);
			document.getElementById(params_SliderDoubleRange2.htmlNode + "_outerGrid").style.display = 'grid'
		} 
		else if (min === max && min === 0) 
			{min = -0.1; max = 0.1; rangeCell.innerHTML = 'no data'; document.getElementById(params_SliderDoubleRange2.htmlNode + "_outerGrid").style.display = 'none'
		}
		slider.noUiSlider.updateOptions({
		        range: {
		            'min': min,
		            'max': max
		        }
		    });		

		//update the cells
		if (params_chart.cells_format) {var suffix = params_chart.cells_format.suffix}
		else if (params_chart.tooltips) {var suffix = params_chart.tooltips.suffix}
		else {var suffix = ""}

		if (params_chart.cells_format) {
			var leftCell = document.getElementById(params_chart.htmlNode + "_leftCell").innerHTML = params_chart.rangeDataset.min.toFixed(decimal) + " " + suffix;
			var rightCell = document.getElementById(params_chart.htmlNode + "_rightCell").innerHTML = params_chart.rangeDataset.max.toFixed(decimal) + " " + suffix;
		}
		//set the pos of the handlers
		var min = Math.floor(rangeDataset[0]), max = Math.ceil(rangeDataset[1])
		slider.noUiSlider.set([min, max]);


	}

	prepare_data_p1(params_chart, sharedParams) {
	    var d1 = new Date();
	    var range_field = params_chart.data_params.range_field; 

	    //get the dataset to use: by default use the operationnal dataset
    	var data_chart = [...sharedParams.data_main]; params_chart.dataset_to_filter = "main"

		if (!params_chart.range_field_created && params_chart.data_params.join_params) {
			var join_field_source = params_chart.data_params.join_params.join_field_source;
			var join_field_target = params_chart.data_params.join_params.join_field_target; 
			//check if the range field has not been created by another programm
			if (sharedParams1.data_main.map(r=> r.hasOwnProperty(range_field)).filter(r=> r).length > 0) {
				return
			}


			var groups = _.groupBy(params_chart.data_params.dataset, params_chart.data_params.join_params.join_field_source)
			Object.values(groups).forEach(r=> {
				//1.perform the selection parameter over the item
				if (params_chart.data_params.join_params.selection) {
					if (params_chart.data_params.join_params.selection === "first") {
						var selection = r[0][range_field]
					}
					else if (params_chart.data_params.join_params.selection === "last") {
						var selection = r.pop()[range_field]
					}
					else if (params_chart.data_params.join_params.selection === "sum") {var selection = d3.sum(r, f=> f[range_field])}
					else if (params_chart.data_params.join_params.selection === "mean") {var selection = d3.mean(r, f=> f[range_field])}
					else if (params_chart.data_params.join_params.selection === "median") {var selection = d3.median(r, f=> f[range_field])}
					else if (params_chart.data_params.join_params.selection === "count") {var selection = r.length}


				}
				else {var selection = r[0][range_field]}

				//create the selection value in the fact table
				sharedParams.data_main.filter(rr=> rr[join_field_target] === r[0][params_chart.data_params.join_params.join_field_source]).forEach(rr=> {
					!isNaN(selection) ? rr[range_field] = selection : {}
				})
			})
		
		params_chart.range_field_created = true
		}	    	
    

	    //get the field to use
	    if (params_chart.data_params.range_field === undefined) {
	    	console.log('field for slider ' + params_chart.id + ' not defined')
	    	return {min: undefined, max: undefined}
	    }

	    //filter the dataset if specified
		var filterList = {};
		//if the crossfilter is provided, extract & transform values of the filter_array (provided by the crossfilter process)
		if (params_chart.transformations.crossfilter !== undefined && Object.keys(params_chart.transformations.crossfilter).length > 0 ) {
			filterList = formFilterArray(params_chart)
		}



		var data_chuncks = [];
		//if a filter arguments has been provided for the data source, call them back here
		if (params_chart.transformations.filter !== undefined) {

			//transform the filterList into an array that we can push in it filter objects
			filterList = Object.values(filterList)

			params_chart.transformations.filter.map(e=> filterList.push(e))

			//Object.assign(filterList, params_chart.transformations.filter)

			filterList = filterList.filter(l=> l.field !== "")
			
			//if the current filter ID is different from the shared filter id, call the filter function
			//data_chuncks = getFiltredData(data_chart, filterList, params_chart.id)
		}


		//if the state management proccess detected filtering values, prepare & engage the crossfilter here
		if (Object.keys(filterList).length > 0) {
			data_chuncks = prepare_engage_crossfilter(data_chart, params_chart, filterList, data_chuncks, sharedParams)
			data_chart = data_chuncks
		}

		if (data_chart.length === 0) {
			return data_chart
		}
	    //set the min value
	    //setup the adjustement for the range field value
	    if (params_chart.data_params.range_adjustment) {var range_field_adjustment = params_chart.data_params.range_adjustment}
	    else {var range_field_adjustment = 100}

	    //determin if the slider must be filtred by user interraction with other charts
		if (params_chart.interactive === undefined || params_chart.interactive === true) {
			var dataset_ext = dataset_extent(params_chart.data_params.domain, data_chart, range_field);	
		}
		else if (params_chart.interactive === false) {
		    var dataset_ext = dataset_extent(params_chart.data_params.domain, sharedParams.data_main, range_field);
		}
		
	    params_chart.dataset_ext_adjusted = {min: [dataset_ext.min - (dataset_ext.min/range_field_adjustment)], max: [dataset_ext.max + (dataset_ext.max/range_field_adjustment)]}
	    return dataset_ext

	}

	init_slider(params_chart, sharedParams) {


    	var slider = document.getElementById(params_chart.htmlNode);


    	//create a div outer_container to place the slider & its title
    	//1.get the parent element of the slider
    	var parentSlider = slider.parentElement

    	//2.create the div outer_container
    	var outer_container = document.createElement('div');
		//<div id="sliders_grid" style="display: grid;">                                    
		outer_container.id = params_chart.htmlNode + "_outerGrid"
		outer_container.style.display = 'grid'

		//3.append the outer_container to the parent element of the slider
		parentSlider.appendChild(outer_container)





		//4.create the cells to display the values of the handlers
		//4.1.create a div that wraps the cells
		var cells_container = document.createElement('div'); cells_container.id = params_chart.htmlNode + "_innerGrid"; 
		cells_container.style = 'display: grid; grid-template-columns: auto auto; justify-content: space-between;'
		//4.2.create the left & right cells
		if (params_chart.cells_format) {
			var leftCell = document.createElement('span'); leftCell.id = params_chart.htmlNode + '_leftCell'; leftCell.style = "height: fit-content; width: fit-content; align-self; center"
			var rightCell = document.createElement('span'); rightCell.id = params_chart.htmlNode + '_rightCell'; rightCell.style = "height: fit-content; width: fit-content; align-self; center"
		}	
		//leftCell.innerHTML = '000'; rightCell.innerHTML = 'NNN'; rangeCell.innerHTML = 'test 00'

		var rangeCell = document.createElement('span'); rangeCell.id = params_chart.htmlNode + '_rangeCell'; rangeCell.style = "height: fit-content; width: fit-content; align-self; center; justify-self: center"



		//create the title
		//case when title is bottom
		if (params_chart.tooltips) {	    		
			//append the slider to the outer_container before the title
	   		var title = document.createElement('h7')
			title.id = params_chart.id + "_title"
			title.style.justifySelf = "center"
			title.style.fontWeight = '500'
			title.innerHTML = params_chart.title_params.label
			title.style.fontSize = "1rem";
			outer_container.appendChild(title)
			outer_container.appendChild(rangeCell)

			//append the slider to the outer_container after the title
			//add margin to the slider, to avoid collision between the tooltips & the title
	    	var slider = document.getElementById(params_chart.htmlNode);
	    	if (params_chart.style && params_chart.style.margin) {
	    		slider.style.margin = params_chart.style.margin
	    	}
	    	else {
	    		slider.style.margin = "45px 10px 10px 10px"
	    	}

			outer_container.appendChild(slider);
			


			//manage hr html tag
			if (params_chart.hr && params_chart.hr.display === true) {
				var hr = document.createElement('hr')
				if (params_chart.hr.style) { hr.style = params_chart.hr.style += ";margin-top:40px"}
				else {hr.style = "margin-top:40px"}
				outer_container.appendChild(hr)
			}
		}
		//case when title is top
		else if (params_chart.cells_format) {
	   		var title = document.createElement('h7')
			title.id = params_chart.id + "_title"
			title.style.justifySelf = "center"
			title.style.fontWeight = '500'
			title.innerHTML = params_chart.title_params.label
			title.style.fontSize = "1rem";
			outer_container.appendChild(title)
			outer_container.appendChild(rangeCell)

			//append the slider to the outer_container after the title
			slider.style.margin = '10px'
			outer_container.appendChild(slider);
			cells_container.appendChild(leftCell)						
			cells_container.appendChild(rightCell)
			outer_container.appendChild(cells_container)
			
			//manage hr html tag
			if (params_chart.hr && params_chart.hr.display === true) {
				var hr = document.createElement('hr')
				if (params_chart.hr.style) { hr.style = params_chart.hr.style += ";margin-top:10px"}
				else {hr.style = "margin-top:50px"}
				outer_container.appendChild(hr)
			}
		}






    	//get the step
    	if (params_chart.step) {var step = params_chart.step}
    	else {var step = undefined}

    	//get the listen method
    	if (params_chart.listen_method === undefined) {params_chart.listen_method = 'change'}

    	//get start & end values for the handler
    	//if (params_chart.rangeDataset.min)
    	var min = params_chart.rangeDataset.min, max = params_chart.rangeDataset.max;
    	
    	if (min === max && min !== 0) {min = min - (min/100)} 
    	else if (min === max && min === 0) {
    		min = -0.1; max = 0.1
    		rangeCell.innerHTML = 'no data';
    		document.getElementById(params_SliderDoubleRange2.htmlNode + "_outerGrid").style.display = 'none'
    	}

    	var start = [Math.floor(min), Math.ceil(max)]
		
		//create slider with tooltips
		if (params_chart.tooltips) {
	    	if (params_chart.tooltips && params_chart.tooltips.decimals) {var decimal = params_chart.tooltips.decimals}
	    	else {var decimal = 2}

	    	//get the thousand_separator
	    	if (params_chart.tooltips && params_chart.tooltips.thousand_separator) {var thousand_separator = params_chart.tooltips.thousand_separator}
	    	else {var thousand_separator = '.'}

	    	//get the thousand_separator
	    	if (params_chart.tooltips && params_chart.tooltips.suffix) {var suffix = params_chart.tooltips.suffix}
	    	else {var suffix = ''}

			noUiSlider.create(slider, {
				start: start,
				step: step,
				tooltips: [wNumb({decimals: decimal, suffix: suffix}), wNumb({decimals: decimal, suffix: suffix})],

				connect: true,
				range: {
				  'min': min,
				  'max': max
				},
			    pips: {
			        mode: 'positions',
			        values: [0, 50, 100],
			        density: 2,
			        format: wNumb({
			            decimals: decimal,
			            suffix: suffix
			        })
			    },
				format: wNumb({
				        decimals: decimal,
				        thousand: thousand_separator,
				        suffix: suffix
				})	    				
			})


		}
		//create slider with cells
		else if (params_chart.cells_format) {
	    	if (params_chart.cells_format && params_chart.cells_format.decimals) {var decimal = params_chart.cells_format.decimals}
	    	else {var decimal = 2}

	    	//get the thousand_separator
	    	if (params_chart.cells_format && params_chart.cells_format.thousand_separator) {var thousand_separator = params_chart.cells_format.thousand_separator}
	    	else {var thousand_separator = '.'}

	    	//get the thousand_separator
	    	if (params_chart.cells_format && params_chart.cells_format.suffix) {var suffix = params_chart.cells_format.suffix}
	    	else {var suffix = ''}

			noUiSlider.create(slider, {
				start: start,
				step: step,
				connect: true,
				range: {
				  'min': params_chart.rangeDataset.min,
				  'max': params_chart.rangeDataset.max
				}
			})
		}
		//set the pos of the handlers
		//slider.noUiSlider.set(Math.floor(start[0]), Math.ceil(start[1]));
		//slider.noUiSlider.set([ start[0], start[1] ]);



      	//update the values of the cells when moving the handlers
		slider.noUiSlider.on("update", function (values, handle1, handle1_2) {

			/*var min = parseFloat(slider.noUiSlider.getOrigins()[0].innerText.replace(params_chart.cells_format.suffix, ''))
			var max = parseFloat(slider.noUiSlider.getOrigins()[1].innerText.replace(params_chart.cells_format.suffix, ''))*/

			if (params_chart.cells_format) {var suffix = params_chart.cells_format.suffix}
			else if (params_chart.tooltips) {var suffix = params_chart.tooltips.suffix}
			else {var suffix = ""}			

	    	if (params_chart.cells_format && params_chart.cells_format.decimals) {var decimal = params_chart.cells_format.decimals}
	    	else {var decimal = 2}
			var min = handle1_2[0].toFixed(decimal)
			var max = handle1_2[1].toFixed(decimal)

			//register the values
			if (params_chart.cells_format) {			
				var leftCell = document.getElementById(params_chart.htmlNode + "_leftCell");
				var rightCell = document.getElementById(params_chart.htmlNode + "_rightCell");

				try {
					leftCell.innerHTML = min + " " + suffix;
					rightCell.innerHTML = max+ " " + suffix;
				}
				catch(error){ 
					params_chart.error_n1 = error
				}
			}
		})


      	//read the values of handlers when moving
		slider.noUiSlider.on(params_chart.listen_method, function (values, handle1, handle1_2) {

			/*var min = parseFloat(slider.noUiSlider.getOrigins()[0].innerText.replace(params_chart.cells_format.suffix, ''))
			var max = parseFloat(slider.noUiSlider.getOrigins()[1].innerText.replace(params_chart.cells_format.suffix, ''))*/
	    	if (params_chart.cells_format && params_chart.cells_format.decimals) {var decimal = params_chart.cells_format.decimals}
	    	else if (params_chart.tooltips && params_chart.tooltips.decimals) {var decimal = params_chart.tooltips.decimals}	    		
	    	else {var decimal = 2}

			//var min = parseFloat(handle1_2[0].toFixed(6)), max = parseFloat(handle1_2[1].toFixed(6))
			var min = parseFloat(handle1_2[0]), max = parseFloat(handle1_2[1])


			//flag the slider as touched by the user, IOT avoid filtering it by the crossfilter process
			var field = params_chart.data_params.range_field + "_brushed"
			params_chart.brush_keys_values = {[field]: [min+"-"+max]}; params_chart.brush_values = {start: min, end: max}	
			//params_chart.brush_keys_values = {[field]: [values[0]+"-"+values[1]]};  params_chart.brush_values = {start: min, end: max}
			params_chart.rangeDataset_user = {min: min, max: max}	    				




		});



	}



	updateSlider(params_chart, dataset_ext) {

		if (params_chart.update_handles_position === false) {
			return
		}

		/*var slider = document.getElementById(params_chart.htmlNode);
		//set the decimals
    	if (params_chart.cells_format && params_chart.cells_format.decimals) {var decimal = params_chart.cells_format.decimals}
    	else {var decimal = 2}

		//flag the slider as touched by the user, IOT avoid filtering it by the crossfilter process
		var min_rangeDataset = parseFloat(params_chart.rangeDataset.min.toFixed(6)), max_rangeDataset = parseFloat(params_chart.rangeDataset.max.toFixed(6))
		if (params_chart.rangeDataset_user && (params_chart.rangeDataset_user.min > min_rangeDataset || params_chart.rangeDataset_user.max < max_rangeDataset)) {
			params_chart.blocked_by_user = true
		}
		else {
			params_chart.blocked_by_user = false
			//set the pos of the handlers
			//slider.noUiSlider.set([Math.floor(dataset_ext.min), Math.ceil(dataset_ext.max)]);					
			//slider.noUiSlider.set([parseFloat(dataset_ext.min.toFixed(decimal)), parseFloat(dataset_ext.max.toFixed(decimal))]);
			slider.noUiSlider.set([parseFloat(dataset_ext.min), parseFloat(dataset_ext.max)]);
		}*/

		var rangeCell = document.getElementById(params_chart.htmlNode + "_rangeCell");
    	if (params_chart.cells_format && params_chart.cells_format.decimals) {var decimal = params_chart.cells_format.decimals}
    	else {var decimal = 2}

    	//get the suffix
    	if (params_chart.cells_format && params_chart.cells_format.suffix) {var suffix = params_chart.cells_format.suffix}
    	else {var suffix = ''}

    	if (dataset_ext.min === dataset_ext.max) {
    		rangeCell.innerHTML = "Selection: " + dataset_ext.min.toFixed(decimal) + " " + suffix
    	}
    	else {
    		if (dataset_ext.min > params_chart.rangeDataset.min || dataset_ext.max < params_chart.rangeDataset.max) {
	    		rangeCell.innerHTML = "Selection: " +  dataset_ext.min.toFixed(decimal) + " - " + dataset_ext.max.toFixed(decimal) + " " + suffix
    		}
    		else {
    			rangeCell.innerHTML = ""	
    		}
    
    	}

    }

}

