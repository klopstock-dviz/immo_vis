class Legend {

	constructor(params_chart) {
		this.id = ""
		this.htmlNode = ""
		this.type = "legend"
	    this.title = ""
	    this.list_segments_selected = []
	    this.nb_categories = 0


	}

	createChart(params_chart, data_to_transform) {
		
		var data_filtred = this.prepare_data_p1(params_chart, data_to_transform)

		this.prepare_data_p2(data_filtred, params_chart)

		var chart_instance = this.init_chart(params_chart)
		
		/*if (params_chart.interactions_chart_options.hoverOptions === true) {
			this.add_options_hover(chart_instance, params_chart) }
		if (params_chart.interactions_chart_options.selectionOptions === true) {
			this.addListeners(params_chart.ctx, chart_instance, params_chart) }*/



		//register the instanciator
		params_chart.instanciator = this
	}

	


	prepare_data_p1(params_chart, data_to_transform) {

	    var d1 = new Date();

	    //zone de filtrage
	    //filter the primary data source according to the scope of the vizualisation (limited geographic area, range of time, any specific observation)

	    //data source for the bar chart
	    if (params_chart.transformations.dataset === undefined) {
	    	var data_chart = [...sharedParams.data_main]
	    	
	    }
	    else {
	    	var data_chart = [...params_chart.transformations.dataset]	    	
	    }








		var filterList = {};
		//if the crossfilter is provided, extract & transform values of the filter_array (provided by the crossfilter process)
		if (params_chart.transformations.crossfilter !== undefined && Object.keys(params_chart.transformations.crossfilter).length > 0 ) {
			var filter_array = {};
				Object.assign(filter_array, params_chart.transformations.crossfilter)
				var filter_array_transformed = Object.values(_.mapValues(params_chart.transformations.crossfilter,
				 function(value, key) {
				 	if (key.indexOf("binned") > -1) {
				 		var pos_sep = value[0].indexOf("-");
					 	var valueMin = parseFloat(value[0].substring(0, pos_sep));
					 	var valueMax = parseFloat(value[0].substring(pos_sep+1, 20));
					  	return {field:key, operation: "between_binMode", valueMin: valueMin, valueMax: valueMax};
					}
				 	else if (key.indexOf("brushed") > -1) {
				 		var pos_sep = value[0].indexOf("-");
					 	var valueMin = parseFloat(value[0].substring(0, pos_sep));
					 	var valueMax = parseFloat(value[0].substring(pos_sep+1, 20));
					  	return {field:key.replace('_brushed', ''), operation: "between", valueMin: valueMin, valueMax: valueMax};
					}					
					else {
						return {field:key, operation: "include", values: value};
					}
				}))
			//add the values into the filter bar chart list
			Object.assign(filterList, filter_array_transformed);

			//reset crossfilet object
			params_chart.transformations.crossfilter = {}
		}


		//if a filter arguments has been provided for the data source, call them back here
		if (params_chart.transformations.filter !== undefined) {

			//transform the filterList into an array that we can push in it filter objects
			filterList = Object.values(filterList)

			params_chart.transformations.filter.map(e=> filterList.push(e))

			//Object.assign(filterList, params_chart.transformations.filter)

			filterList = filterList.filter(l=> l.field !== "")
			
			//if the current filter ID is different from the shared filter id, call the filter function
			var data_chart = getFiltredData(data_chart, filter_array, filterList, params_chart.id)
		}
		else if (Object.keys(filterList).length > 0) {
			//transform the filterList into an array that we can push in it filter objects
			filterList = Object.values(filterList)
			
			filterList = filterList.filter(l=> l.field !== "")
			
			//if the current filter ID is different from the shared filter id, call the filter function
			var data_chart = getFiltredData(data_chart, filter_array, filterList, params_chart.id)
		}



	    return data_chart

	}




	prepare_data_p2(data_input, params_chart) {

		//generate the classes
		var binGenerator = d3.histogram()
			  .domain([params_chart.hue_dataset_extent.min, params_chart.hue_dataset_extent.max])// Set the domain to cover the entire intervall [0;]
			  .thresholds(5);  // number of thresholds; this will create 19+1 bins

		var arr_to_bin = data_input.map(h=> h[params_chart.params_fields.hue_params.hue_field])
		var array_binned = binGenerator(arr_to_bin)

		params_chart.array_binned = array_binned


	}


	init_chart(params_chart) {		

		//register the map instance
		params_chart.map_instance = mymap
		params_chart.chart_type = "leaflet"





	}




	inject_metadata(mymap, params_chart, data_type, injection_type, updateTime) {


	
	}





	inject_metadata(params_chart) {


		//check if a legends container exists, remove it first
		var legendContainer = d3.select("#demo1")
		if (legendContainer._groups[0][0] !== null) {
			legendContainer.remove()
		}

		//generate the legends
         var sequentialScale = d3.scaleSequential(d3.interpolateRdYlGn)
           .domain([params_chart.hue_dataset_extent.min, params_chart.hue_dataset_extent.max]);
         

         legendContainer.append("g")
           .attr("class", "legendSequential")
           .attr("transform", "translate(20,20)");

         var legendSequential = d3.legendColor()
             .shapeWidth(30)
             .cells(array_binned.length)
             .orient("vertical")
             .scale(sequentialScale)
             .labelFormat(d3.format(".2f"))
              //.useClass(true)
              .title("titre")

         legendContainer.select(".legendSequential")
           .call(legendSequential);
                   

        //adjust fonts
        for (var i = 0; i < array_binned.length; i++) {
        	var ii = i+1
            var text = document.querySelector("#demo1 > g > g > g:nth-child(" + ii + ") > text")
            text.style.fontFamily = "helvetica neue";
            text.style.fontSize = "13px"
            var data = array_binned[i].x0 + ' - ' + array_binned[i].x1
            text.innerHTML = data

            //add listener to show cursor above the legend colors
            var cell = document.querySelector("#demo1 > g > g > g:nth-child(" + ii + ") > rect")
			cell.addEventListener("mouseover", function(evt){ 			        	
				evt.target.style.cursor = "pointer"
			} )
        }
      

        //add listener for collecting legend values
        var cells = document.querySelector("#demo1 > g > g")
        cells.addEventListener("click", function(evt){ 
        	console.log(evt.target.nextSibling.innerHTML) 
        } )



	}

