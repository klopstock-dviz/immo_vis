//targetObj is the 
/*var targetObj = {};

var singleSelect = new Proxy(targetObj, {
  set: function (target, key, value) {
      console.log(`${key} set to ${value}`);
      loadChart()
      target[key] = value;
      return true;
  }
});

function loadChart() {
	console.log('chart loaded, values');

}


var test = {};
var p = ObservableSlim.create(test, true, function(changes) {
	console.log(JSON.stringify(changes));
});*/



class Observe_Charts_state {
	constructor() {
		this.legends_array = []
	}





	observe_chart_state(params_chart, params_charts_target, sharedParams) {








		var id_previous_singleSelect = ""
		var id_previous_multiSelect = ""
		var id_previous_brushSelect = ""
		var id_current_legend = ""
		var id_previous_legend = ""
		var current_chart
		var category = "x"
		var sub_category = "x"
		var id_current_singleSelect = ""
		var id_current_brushSelect = ""
		var id_current_multiSelect = ""
		var filter_array = [];
		var elements_to_filter


		var legends_array = this.legends_array;
		var _this = this;


		setInterval(function(sharedParams) {

			var sharedParams = params_chart.sharedParams

			//graph bar1
			//observation clic simple
			try{


				id_current_singleSelect = params_chart.list_idx_segment_single_selected.join()
				id_current_multiSelect = params_chart.list_idx_segments_multiples_selected.join()
				id_current_brushSelect = Object.values(params_chart.brush_values).join()

				
				
				//if a change in single select interaction with the chart is registred between two checks
				if (id_previous_singleSelect !== id_current_singleSelect) {

					//if a selection occurs (a slice is clicked)
					if (id_current_singleSelect !== "") {

						sharedParams.time_refresh = new Date();
						//indiquer la détection du clic
						//console.log('observer 1 clic unique:' + params_chart.list_idx_segment_single_selected)

						//ACTIONS TO TRIGGER
						var interaction_type = "selection_binding"
						_this.set_filter(params_chart, params_charts_target, interaction_type, sharedParams)

						//register the new state
						id_previous_singleSelect = params_chart.list_idx_segment_single_selected.join()
						params_chart.status_chart = ''
						id_previous_multiSelect = ""
						
						sharedParams.time_refresh =  (new Date() - sharedParams.time_refresh)/1000; console.log(sharedParams.time_refresh)
					}

					//if the selection is released, reset the chart whith it's original data
					else if (id_current_singleSelect === "") {
						var interaction_type = "selection_binding"

						sharedParams.time_refresh = new Date();

						_this.remove_filter(params_chart, params_charts_target, interaction_type, sharedParams)

						//register the value of the current index as "previous id"
						id_previous_singleSelect = params_chart.list_idx_segment_single_selected.join()
						params_chart.status_chart = ''
						id_previous_multiSelect = ""


						sharedParams.time_refresh =  (new Date() - sharedParams.time_refresh)/1000; console.log(sharedParams.time_refresh)

					}
				}

			}
			catch (error) {
				console.log("observer 1 ko:" + error.stack)
			}


			//observation clics multiples
			try{


				//declencher si seulement le clic simple n'est pas alimenté
				if (id_previous_singleSelect === "" && id_previous_multiSelect !== id_current_multiSelect) { //id_previous_singleSelect !== id_current_multiSelect && 

					//if a selection occurs (a slice is clicked)
					if (id_current_multiSelect !== "") {

						sharedParams.time_refresh = new Date();

						//console.log('observer 2 clics multiples:' + params_chart.list_idx_segments_multiples_selected)
						id_previous_multiSelect = params_chart.list_idx_segments_multiples_selected.join()

						//ACTIONS TO TRIGGER
						//1.
						var interaction_type = "multiple_selection_binding"
						_this.set_filter(params_chart, params_charts_target, interaction_type, sharedParams)

						sharedParams.time_refresh =  (new Date() - sharedParams.time_refresh)/1000; console.log(sharedParams.time_refresh)


					}
					//if the selection is released, reset the chart whith it's original data
					else if (id_current_multiSelect === "") { // && id_current_singleSelect === ""
						sharedParams.time_refresh = new Date();

						var interaction_type = "multiple_selection_binding"
						_this.remove_filter(params_chart, params_charts_target, interaction_type, sharedParams)

						//register the value of the current index as "previous id"
						id_previous_multiSelect = params_chart.list_idx_segments_multiples_selected.join()
						params_chart.status_chart = ''

						sharedParams.time_refresh =  (new Date() - sharedParams.time_refresh)/1000; console.log(sharedParams.time_refresh)

					}
				}
			}
			catch(error){
				console.log("observer 2 ko: " + error.stack)
			}	



			//observation brush selection
			//if a change in single select interaction with the chart is registred between two checks
			if (id_previous_brushSelect !== id_current_brushSelect) {

				//if a selection occurs (a slice is clicked)
				if (id_current_brushSelect !== "") {

					sharedParams.time_refresh = new Date();
					//indiquer la détection du clic
					//console.log('observer 1 clic unique:' + params_chart.list_idx_segment_single_selected)

					//ACTIONS TO TRIGGER
					var interaction_type = "brush_selection_binding"
					_this.set_filter(params_chart, params_charts_target, interaction_type, sharedParams)

					//register the new state
					id_previous_brushSelect = Object.values(params_chart.brush_values).join()
					params_chart.status_chart = ''
					
					
					sharedParams.time_refresh =  (new Date() - sharedParams.time_refresh)/1000; console.log(sharedParams.time_refresh)
				}

				//if the selection is released, reset the chart whith it's original data
				else if (id_current_brushSelect === "") {
					var interaction_type = "brush_selection_binding"

					sharedParams.time_refresh = new Date();

					_this.remove_filter(params_chart, params_charts_target, interaction_type, sharedParams)

					//register the value of the current index as "previous id"
					id_previous_brushSelect = Object.values(params_chart.brush_values).join()
					params_chart.status_chart = ''

					sharedParams.time_refresh =  (new Date() - sharedParams.time_refresh)/1000; console.log(sharedParams.time_refresh)

				}
			}			



			//observation clics legends
			try{

				//dont observe clicks for leaflet maps
				if (params_chart.chart_type === "labelGroup" || params_chart.chart_type === "label") {
					return
				}

				current_chart = params_chart.chart_instance;



				var legends_state = collect_active_legends(current_chart, _this, params_chart)
				var active_legends = legends_state["active_legends"]; var hidden_legends = legends_state["hidden_legends"]

				if (params_chart.chart_type === "chartJS") {var legends_hidden = detect_hidden_legends(current_chart); legends_hidden = deduplicate_array(legends_hidden)}
				else {var hidden_legends = []}

				if (active_legends !== undefined) {id_current_legend = [...active_legends].join()}
				
				//if a legend is selected && this selection differs from the previous one, update the chart
				if (params_chart.legend_clicked === true && id_previous_legend !== id_current_legend) {
					console.log('legend clicked on '+ params_chart.id + ': ' + active_legends)

					//params_scatterChart1.chart_instance.getDatasetMeta(1).hidden=true;
					var legends_state = collect_active_legends(current_chart, _this, params_chart)
					var active_legends = legends_state["active_legends"]; var hidden_legends = legends_state["hidden_legends"]

					if (active_legends !== undefined) {
						id_previous_legend = [...active_legends].join()
					}

					//ACTIONS TO TRIGGER
					//register the active legends
					if (params_chart.chart_type === "chartJS") {var chartJS_type = params_chart.chart_instance.config.type}
					//if (chart_type !== "doughnut" && chart_type !== "pie") {
					if (params_chart.chart_type === "chartJS") {
						if (params_chart.nb_axis === 1) {
							params_chart.active_legends = {[params_chart.category_field]: active_legends}
						}
						else if (params_chart.nb_axis === 2) {
							params_chart.active_legends = {[params_chart.sub_category_field]: active_legends}
						}
					}
					else if (params_chart.chart_type === "leaflet") {
						params_chart.active_legends = {[params_chart.legends_field]: active_legends}
					}

					//register hidden legends			
					//if (chart_type !== "doughnut" && chart_type !== "pie") {								
						if (params_chart.nb_axis === 1) {
							params_chart.hidden_legends = {[params_chart.category_field]: hidden_legends}
						}
						else if (params_chart.nb_axis === 2) {
							params_chart.hidden_legends = {[params_chart.sub_category_field]: hidden_legends}
						}
					//}

					sharedParams.time_refresh = new Date();
					var interaction_type = "legends_binding"
					_this.set_filter(params_chart, params_charts_target, interaction_type, sharedParams)

					//reset legend_clicked status
					params_chart.legend_clicked = false



					sharedParams.time_refresh =  (new Date() - sharedParams.time_refresh)/1000; console.log(sharedParams.time_refresh)
				}




				function detect_hidden_legends(current_chart) {										
					var limit = current_chart.legend.legendItems.length; var status_legends = [];
					for (var i = 0; i < limit; i++) {
						var status_legend = current_chart.legend.legendItems[i].hidden
						//collect all non hidden slices to push them into the filter array
						if (status_legend === true) {
							status_legends.push(status_legend)
						}
					}
					return status_legends
				};


			}
			catch(error) {
				console.log("observer legends ko: " + error.stack)
			}
			

			}
		, 20)
		}


	set_filter(params_chart, params_charts_target, interaction_type, sharedParams) {
		var params_charts_target_to_filter = params_charts_target.filter(c=> c.filter === true).map(c=> c.chart)
		var filter_chart_source = {}; var filter_array_ref = {};
		params_chart.status_chart = 'active';
		//filter the data of the targeted charts
		for (var i = 0; i < params_charts_target_to_filter.length; i++) {
			var params_chart_target = params_charts_target_to_filter[i]
			params_chart_target.status_chart = 'target';
			var filter_array = {};

			//if legends has been clicked, sync the charts that share the same legends field
			//prepare for eval
			if (Object.values(params_chart.hidden_legends).length > 0) {var eval_source_hidden_legends = Object.values(params_chart.hidden_legends)[0].length}
			else {var eval_source_hidden_legends = 0}
			if (Object.values(params_chart_target.hidden_legends).length > 0) {var eval_target_hidden_legends = Object.values(params_chart_target.hidden_legends)[0].length}
			else {var eval_target_hidden_legends = 0}

			if ((params_chart.legends_field === params_chart_target.legends_field) && (eval_source_hidden_legends > 0 || eval_target_hidden_legends> 0)
			 && interaction_type === "legends_binding") {			
				sync_legends(params_chart, params_chart_target, params_charts_target_to_filter);				
			}


			else {
				
				if (interaction_type === "selection_binding" || interaction_type === "multiple_selection_binding") {
					//fill the filter dict with the slice(s) selected in the current chart
					
					//choose the click store
					if (interaction_type === "selection_binding") {
						var list_labels = _.cloneDeep(params_chart.list_labels_segment_single_selected)
					}
					else if (interaction_type === "multiple_selection_binding") {
						var list_labels = _.cloneDeep(params_chart.list_labels_segments_multiples_selected)
					}

					//detect & delete the empty fields
					if (list_labels.filter(f=> f.category_field !== "").length === 0) {
						filter_array[params_chart.sub_category_field] = []; 
						list_labels.map(o=> delete o.category_field)
						list_labels.map(o=> { filter_array[params_chart.sub_category_field].push([o.sub_category_field][0]) })
					}
					else if (list_labels.filter(f=> f.sub_category_field !== "").length === 0) {
						filter_array[params_chart.category_field] = []
						/*if (params_chart.bin_params.bin === true) {filter_array[params_chart.category_field + "_binned"] = []}
						else {filter_array[params_chart.category_field] = []}*/
						list_labels.map(o=> delete o.sub_category_field)
						list_labels.map(o=> { 
							filter_array[params_chart.category_field].push([o.category_field][0])
							/*if (params_chart.bin_params.bin === true) {
								filter_array[params_chart.category_field + "_binned"].push([o.category_field][0]) 
							}
							else { filter_array[params_chart.category_field].push([o.category_field][0]) }*/
						})
					}				
					//if no empty fields
					else {
						filter_array[params_chart.category_field] = []; filter_array[params_chart.sub_category_field] = []; 
						list_labels.map(o=> {
							o["category_field"] ? filter_array[params_chart.category_field].push([o.category_field][0]) : {}
							o["sub_category_field"] ? filter_array[params_chart.sub_category_field].push([o.sub_category_field][0]) : {}
						})
						//clean from generated empty fields
						Object.keys(filter_array).forEach(key => filter_array[key].length === 0 ? delete filter_array[key] : {});
					}
				}


				else if (interaction_type === 'brush_selection_binding') {
					Object.assign(filter_array, params_chart.brush_keys_values)
				}


				else if (interaction_type === "legends_binding") {
					//fill the filter dict with the slice(s) selected in the current chart
					//deal with the case when the source chart has 1 axis
					if (params_chart.nb_axis === 1) {
						//if the sub_cat field is available, use it for legend filtering
						if (params_chart.sub_category_field !== undefined) {
							filter_array[params_chart.sub_category_field] = [...this.legends_array];
						}
						//else, use the cat_field for legend filtering
						else if (params_chart.category_field !== undefined) {
							//if the chart is chart JS kind or leaflet
							if (params_chart.chart_type === "chartJS") { filter_array[params_chart.category_field] = [...this.legends_array] } else {filter_array[params_chart.legends_field] = [...this.legends_array] }
						}					
					}
					//deal with the case when the source chart has 2 axis
					else if (params_chart.nb_axis === 2) {					
						filter_array[params_chart.sub_category_field] = [...this.legends_array];

					}				


				}
			}


			//if the current target presents active slices, inject them to the filter array here
			if (params_chart_target.activ_categories_values.length > 0 && params_chart_target.hierarchy_levels) {
				if (params_chart_target.category_field) { filter_array[params_chart_target.category_field] = params_chart_target.activ_categories_values.flat().flat().flat() }
				
			}


			/*in order to preserve previous interactions, collect the slices selected in the third target charts
			only if these slices does not compose the axis of the current target chart*/
			var params_charts_target_collect_slices = params_charts_target.filter(c=> c.collect_active_slices === true).map(c=> c.chart)
			for (var a = 0; a < params_charts_target_collect_slices.length; a++) {

				//if the chart is not the current target
				if (params_charts_target_collect_slices[a].status_chart !== 'target') {
					var third_target_chart = params_charts_target_collect_slices[a]









					if (interaction_type === "selection_binding") {
						//if list_labels_segment_single_selected is empty, take list_labels_segments_multiples_selected
						if (third_target_chart.list_keys_values_segments_multiples_selected.length >= 1) {	
							//v5
							extract_active_slices(third_target_chart, filter_array)							
						}
						/*else if (third_target_chart.list_labels_segment_single_selected.length === 1) {
							list_labels_selected = [...third_target_chart.list_labels_segment_single_selected]
						}*/
						else if (Object.values(third_target_chart.brush_keys_values).length>0) {
							var brush_keys_values = _.mapValues(third_target_chart.brush_keys_values, function(v,k) {return v})
							Object.assign(filter_array, brush_keys_values); Object.assign(filter_chart_source, brush_keys_values); 
						}
						else {list_labels_selected = []}



					}



					else if (interaction_type === "multiple_selection_binding" || interaction_type === "legends_binding") {
						//check if we have hidden legends
						var has_hidden_legends = third_target_chart.hidden_legends; var list_labels_selected = [];

						//if list_labels_segment_single_selected is empty, take list_labels_segments_multiples_selected
						if (third_target_chart.list_keys_values_segments_multiples_selected.length >= 1) {
			
							extract_active_slices(third_target_chart, filter_array)
							//extract_active_slices(third_target_chart, filter_chart_source)							

						}

						//if the chart is brushed
						else if (Object.values(third_target_chart.brush_keys_values).length >0) {
							var brush_keys_values = _.mapValues(third_target_chart.brush_keys_values, function(v,k) {return v})
							Object.assign(filter_array, brush_keys_values); Object.assign(filter_chart_source, brush_keys_values); 
						}
						//ELSE if the chart has hidden legends, then pick the active ones
						/*else if (has_hidden_legends !== undefined && Object.values(has_hidden_legends).length > 0) {
							//get_active_legends(filter_array, params_chart, third_target_chart, "set_filter");
						}*/






						else {list_labels_selected = []}



					}
					

					else if (interaction_type === 'brush_selection_binding') {
						//clean filter from previous similar brushed axis
						var tmpObj = {}; Object.assign(tmpObj, third_target_chart.brush_keys_values); Object.keys(filter_array).map(o=> delete tmpObj[o])
						//transfer brushed values
						Object.assign(filter_array, tmpObj);
						Object.assign(filter_chart_source, tmpObj)

						extract_active_slices(third_target_chart, filter_array)
						//extract_active_slices(third_target_chart, filter_chart_source)							


					}
					
					
				}
			}



			//collect active legends
			clean_filter_array(filter_array);
			collect_active_legends_setFilter(params_chart, params_chart_target, params_charts_target_collect_slices, filter_array, interaction_type)

		
			var ind_filtering_type = "set_filter"
			

			//clean the filter array from empty fields
			clean_filter_array(filter_array)
			if (Object.keys(filter_array).length > 0) {
				params_chart_target.filtered_by = {}; 
				crossfilter(params_chart, params_chart_target, filter_array, ind_filtering_type, sharedParams);
				Object.assign(filter_chart_source, filter_array);				
			}
			else {
				try {
					delete params_chart_target.filtered_by.axis[params_chart.category_field]
					delete params_chart_target.filtered_by.axis[params_chart.sub_category_field]
				}
				catch {}
			}

			params_chart_target.status_chart = '';

			
		}


		//refilter the target charts if one of their foreign filtering axis is outdated regarding to the last filter_array axis
		var newObj = {};
		  Object.keys(filter_chart_source).forEach((prop) => {
		    if (filter_chart_source[prop][0] !== '') { newObj[prop] = filter_chart_source[prop]; }
		  });
		delete newObj[""]
		filter_chart_source = _.cloneDeep(newObj)
				
		//operations;

		for (var y = 0; y < params_charts_target_to_filter.length; y++) {
			//1.collect for each target chart it's foreign filtering axis (params_chart.filtered_by.axis)
			var target_chart = params_charts_target_to_filter[y]

			var keys_values_params_barChart = _.mapKeys(target_chart.filtered_by.axis, function(value, key) {
  				return key;
			}); clean_filter_array(keys_values_params_barChart)
			var keys_params_barChart = Object.keys(keys_values_params_barChart); keys_params_barChart = keys_params_barChart.filter(o=> o !== "")



			//2.regenerate active legends for chartJS charts
			if (target_chart.chart_type === "chartJS") {
				var activeLegends={};
				params_charts_target_to_filter.map(c=> {
					if (c.chart_type === "chartJS") {
						activeLegends[c.legends_field] = c.chart_instance.legend.legendItems.filter(t=> t.text !== "" && t.hidden === false).map(l=> l.text)
					}

				})
				
				params_chart.chart_type === "chartJS" ? activeLegends[params_chart.legends_field] = params_chart.chart_instance.legend.legendItems.filter(t=> t.text !== "" && t.hidden === false).map(l=> l.text) : {}
			}

			//3.delete obsolete active legends from the filtered axis, the ones that contains "" strings
			var refilter_array = {}; var ind_refilter = false
			delete_empty_legends(keys_values_params_barChart, activeLegends, refilter_array)



			//4.crossfilter the chart
			if (ind_refilter === true) {
				//clean the filter array from empty fields
				clean_filter_array(refilter_array)				
				var ind_filtering_type = "set_filter"
				//if (Object.keys(refilter_array).length > 0) {
					crossfilter(target_chart, target_chart, refilter_array, ind_filtering_type, sharedParams)			
				//reset the indicator
				ind_refilter = false
				//}
			}
		}		
		 

		//filter the chart source it self with all the active slices, except it's own slices
		//remove the category fields of the current chart from the filter to avoid sefl filtering
		var ind_filtering_type = "set_filter"

		//1.extract list of axis of target charts:
		//v3
		//refilter the chart it self if one of the legends became obsolete
		refilter_array = {}; filter_array_ref = {};
		params_chart.filtered_by.axis !== undefined ? delete_empty_legends(params_chart.filtered_by.axis, activeLegends, refilter_array) : {};
		Object.assign(filter_array_ref, params_chart.filtered_by.axis); clean_filter_array(filter_array_ref);



		if (Object.values(filter_array_ref).length > 0 && params_chart.chart_type === 'chartJS') {

			crossfilter(params_chart, params_chart, params_chart.filtered_by.axis, ind_filtering_type, sharedParams)
		}

		function delete_empty_legends(filter_source, activeLegends, refilter_array) {

			Object.keys(filter_source).forEach(key => {
				//if an obsolete legend is detected (""), delete it & replace it from the last version of active legends
				if (filter_source[key].findIndex(i=> i === "") > -1) {
					 delete filter_source[key];
					 filter_source[key] = activeLegends[key];
					 Object.assign(refilter_array, filter_source)
					 ind_refilter = true;
				}
				})
		}		




		function crossfilter(params_chart, params_chart_target, filter_array, ind_filtering_type, sharedParams) {
			//var dataset_filtred = crossfilter_master(params_chart, params_chart_target, filter_array, ind_filtering_type)

		    //stat exec time
		    var t1 = (new Date())/1000			

			//transfer the vilter array in the params chart target
			params_chart_target.transformations.crossfilter = {};
			Object.assign(params_chart_target.transformations.crossfilter, filter_array)
			//console.log(filter_array)
			//save the chart source that filters the current target used to filter the chart
			params_chart_target.filtered_by = {"id": params_chart.id, "params_chart": params_chart, "axis": filter_array}

			//get the data filtred & grouped
			var dataset_filtred = params_chart_target.instanciator.prepare_data_p1(params_chart_target, sharedParams)

			//for leaflet case, if the filter return an empty array, cancel the program stay on the same area of the map and show nothing
			if (params_chart_target.chart_type === "leaflet" && dataset_filtred.dataset) { 
				if (dataset_filtred.dataset.length === 0) { return }
			}


			//update the targeted chart with the filtred data
			//1.get the instance of the chart to filter
			var chart_to_filter
			params_chart_target.chart_type === "leaflet" ? chart_to_filter = params_chart_target.map_instance : chart_to_filter = params_chart_target.chart_instance;


			//if the chart is chart js type
			if (params_chart_target.chart_type === "chartJS") {
				params_chart_target.data[0].labels = []; params_chart_target.data[1].datasets = [];
				chart_to_filter.config.data.labels = []; 
				for (var ii = 0; ii < chart_to_filter.config.data.datasets.length; ii++) {
					chart_to_filter.config.data.datasets[ii].data = []; chart_to_filter.config.data.datasets[ii].label = "";
					chart_to_filter.config.data.datasets[ii].backgroundColor = []; chart_to_filter.config.data.datasets[ii].borderColor = [];
					chart_to_filter.config.data.datasets[ii].borderWidth = [];
				}
			}
			else if (params_chart_target.chart_type === 'leaflet') {
				params_chart_target.data[0].labels = []; params_chart_target.data[1].datasets = [];
				params_chart_target.data[1].markers = []; params_chart_target.data[1].x_y = []; params_chart_target.inject_type = "update"
			}	
			

			

			//2.3.update de params array of the targeted chart with the filtred dataset
			/*2.1.if the trageted chart has already a selection, indicate to the data processing function to preserve the background color of 
			previous selection*/
			if (params_chart_target.chart_type === 'chartJS' || params_chart_target.chart_type === 'leaflet') {
				if (params_chart_target.list_labels_segment_single_selected.length !== 0 || params_chart_target.list_labels_segments_multiples_selected.length !== 0 
					|| Object.values(params_chart_target.brush_values).length > 0) {

					params_chart_target.prepare_data_type = "preserve backgroundColor"

					//stats exec time
					var t1_bis1 = (new Date())/1000
					params_chart_target.instanciator.prepare_data_p2(dataset_filtred, params_chart_target, sharedParams)
					var t2 = (new Date())/1000; var tf = parseFloat((t2-t1_bis1).toFixed(3))
					sharedParams.crossfilterProcess_exec_time.push({type: "crossfilter", sub_type: "prepare_data_p2","chart": params_chart_target.id, exec_time: tf, event_time: (new Date).toLocaleString()})	
					


					var data_type = "data"; var injection_type = "update"
					params_chart_target.instanciator.inject_metadata(chart_to_filter, params_chart_target, data_type, injection_type) // -> ok
					params_chart_target.prepare_data_type = ""
					params_chart_target.chart_type === "chartJS" ? hide_legends(params_chart_target, 'set_filter') : params_chart_target.instanciator.setup_legends(params_chart_target, sharedParams, 'update')
					//params_chart_target.chart_type === "leaflet" ? params_chart_target.instanciator.setup_legends(params_chart, 'update') : {} 


				}
				else {
					params_chart_target.prepare_data_type = ""
					//stats exec time
					var t1_bis1 = (new Date())/1000
					params_chart_target.instanciator.prepare_data_p2(dataset_filtred, params_chart_target, sharedParams)
					var t2 = (new Date())/1000; var tf = parseFloat((t2-t1_bis1).toFixed(3))
					sharedParams.crossfilterProcess_exec_time.push({type: "crossfilter", sub_type: "prepare_data_p2","chart": params_chart_target.id, exec_time: tf, event_time: (new Date).toLocaleString()})	
					
					//2.4.inject into the chart JS config instance the labels & datasets setup above
					var data_type = "data"; var injection_type = "update"
					params_chart_target.instanciator.inject_metadata(chart_to_filter, params_chart_target, data_type, injection_type) // -> ok
					params_chart_target.chart_type === "chartJS" ? hide_legends(params_chart_target, 'set_filter') : params_chart_target.instanciator.setup_legends(params_chart_target, sharedParams, 'update')
				}
			}
 			else if ((params_chart_target.chart_type === 'label' || params_chart_target.chart_type === 'labelGroup') && Object.keys(params_chart_target.transformations.crossfilter).length > 0 &&
 				params_chart_target.updateLabels === true) {
 				//remove previous card
 				var title = document.querySelector("#" + params_chart_target.id + "_title"); title.remove(); var card = document.querySelector("#" + 'card_' + params_chart_target.id); card.remove()
 				params_chart_target.instanciator.init_label(params_chart_target)
 				params_chart_target.instanciator.displayText(params_chart_target)
 				params_chart_target.updateLabels = undefined
 			}

			var t2 = (new Date())/1000; var tf = parseFloat((t2-t1).toFixed(3))
			sharedParams.crossfilterProcess_exec_time.push({type: "crossfilter", "chart": params_chart_target.id, exec_time: tf, event_time: (new Date).toLocaleString()})
		}



	}





	remove_filter(params_chart, params_charts_target, interaction_type, sharedParams) {
		var filter_array_ref = {};
		var params_charts_target_to_filter = params_charts_target.filter(c=> c.filter === true).map(c=> c.chart)
		var params_charts_target_collect_slices = params_charts_target.filter(c=> c.collect_active_slices === true).map(c=> c.chart)
		


		for (var i = 0; i < params_charts_target_to_filter.length; i++) {
			var params_chart_target = params_charts_target_to_filter[i]
			params_chart_target.has_been_filtred = false;
			params_chart_target.to_filter = undefined;
			params_chart.status_chart = 'active'; params_chart_target.status_chart = 'target';
			//record the status


			
			var filter_array = {};

			//if the chart source presents active slices, inject them to the filter array here
			if (params_chart.activ_categories_values.length > 0) {
				if (params_chart.category_field) {params_chart.list_keys_values_segments_multiples_selected.map(o=> { filter_array[params_chart.category_field] = o[params_chart.category_field].flat().flat().flat() } )}
				if (params_chart.sub_category_field) {params_chart.list_keys_values_segments_multiples_selected.map(o=> { filter_array[params_chart.sub_category_field] = o[params_chart.sub_category_field].flat().flat().flat() } )}
			}


			//if the current target presents active slices, inject them to the filter array here
			if (params_chart_target.activ_categories_values.length > 0 && params_chart_target.hierarchy_levels) {
				if (params_chart_target.category_field) { filter_array[params_chart_target.category_field] = params_chart_target.activ_categories_values.flat().flat().flat() }
				
			}



			//to secure the filters triggered by previous selections, we must collect the active slices 
			//of all the charts, except the current target & the chart source
			//to do that, we fill the filter array with the active slices of target charts, except the current target
			for (var a = 0; a < params_charts_target_collect_slices.length; a++) {

				//if the chart is not the current target
				if (params_charts_target_collect_slices[a].status_chart !== 'target') {
					var third_target_chart = params_charts_target_collect_slices[a]
					var list_labels_selected = []
					if (interaction_type === "selection_binding") {
						//check if we have hidden legends
						//var has_hidden_legends = third_target_chart.hidden_legends; 
						

						//if list_labels_segment_single_selected is empty, take list_labels_segments_multiples_selected
						if (third_target_chart.list_labels_segments_multiples_selected.length >= 1) {
							//refilter selected slices according to the values get from the source chart
							/*var active_slices = _.filter(third_target_chart.list_labels_segments_multiples_selected, 
								item => third_target_chart.chart_instance.data.labels.indexOf(item.category_field) !== -1);
							var list_labels_selected = [...active_slices]*/	
							extract_active_slices(third_target_chart, filter_array)
							extract_active_slices(third_target_chart, filter_array_ref)

						}

						//if the chart is brushed
						else if (Object.values(third_target_chart.brush_keys_values).length >0) {
							var brush_keys_values = _.mapValues(third_target_chart.brush_keys_values, function(v,k) {return v})
							Object.assign(filter_array, brush_keys_values); Object.assign(filter_array_ref, brush_keys_values); 
						}

						else {list_labels_selected = []}

						//collect the selected labels if they exist
						if (list_labels_selected.length > 0) {
							filter_array[third_target_chart.category_field] = []; filter_array_ref[third_target_chart.category_field] = [];
							filter_array[third_target_chart.sub_category_field] = []; filter_array_ref[third_target_chart.sub_category_field] = [];

							for (var j = 0; j < list_labels_selected.length; j++) {
								var list_labels = list_labels_selected[j]
								//deal with the case when the source chart has 1 axis
								if (Object.keys(list_labels).length === 1) {
									filter_array[third_target_chart.category_field].push(list_labels.category_field);
									filter_array_ref[third_target_chart.category_field].push(list_labels.category_field)
								}
								//deal with the case when the source chart has 2 axis
								else if (Object.keys(list_labels).length === 2) {
									filter_array[third_target_chart.category_field].push(list_labels.category_field);
									filter_array[third_target_chart.sub_category_field].push(list_labels.sub_category_field)
									filter_array_ref[third_target_chart.category_field].push(list_labels.category_field);
									filter_array_ref[third_target_chart.sub_category_field].push(list_labels.sub_category_field)									
								}								
							}
						};





					}
					else if (interaction_type === "multiple_selection_binding") {

						//if list_labels_segment_single_selected is empty, take list_labels_segments_multiples_selected
						if (third_target_chart.list_labels_segments_multiples_selected.length >= 1) {
							//refilter selected slices according to the values get from the source chart
							extract_active_slices(third_target_chart, filter_array);
							extract_active_slices(third_target_chart, filter_array_ref);

						}

						//if the chart is brushed
						else if (Object.values(third_target_chart.brush_keys_values).length >0) {
							var brush_keys_values = _.mapValues(third_target_chart.brush_keys_values, function(v,k) {return v})
							Object.assign(filter_array, brush_keys_values); Object.assign(filter_array_ref, brush_keys_values); 
						}						

						else {list_labels_selected = []}

						//collect the selected labels


						//collect the selected labels if they exist
						if (list_labels_selected.length > 0) {

							var categories_selected_array = []; var sub_categories_selected_array = [];
							for (var j = 0; j < list_labels_selected.length; j++) {
								var list_labels = list_labels_selected[j]

								//collecte the values of the selections into arrays
								//deal with the case when the source chart has 1 axis
								if (Object.keys(list_labels).length === 1) {
									categories_selected_array.push(list_labels.category_field)						
								}
								//deal with the case when the source chart has 2 axis
								else if (Object.keys(list_labels).length === 2) {
									categories_selected_array.push(list_labels.category_field)
									sub_categories_selected_array.push(list_labels.sub_category_field)						
								}								
							}

								//transfert the values into the filter array
								//deal with the case when the source chart has 1 axis
								if (Object.keys(list_labels).length === 1) {
									filter_array[third_target_chart.category_field] = categories_selected_array;
									filter_array_ref[third_target_chart.category_field] = categories_selected_array;
								}
								else if (Object.keys(list_labels).length === 2) {
									filter_array[third_target_chart.category_field] = categories_selected_array;
									filter_array[third_target_chart.sub_category_field] = sub_categories_selected_array
									filter_array_ref[third_target_chart.category_field] = categories_selected_array;
									filter_array_ref[third_target_chart.sub_category_field] = sub_categories_selected_array

								}
						}


					}


					else if (interaction_type === 'brush_selection_binding') {
						//clean filter from previous similar brushed axis
						var tmpObj = {}; Object.assign(tmpObj, third_target_chart.brush_keys_values); Object.keys(filter_array).map(o=> delete tmpObj[o])
						//transfer brushed values
						Object.assign(filter_array, tmpObj);
						Object.assign(filter_array_ref, tmpObj)

						//transfer active slices
						extract_active_slices(third_target_chart, filter_array);
						extract_active_slices(third_target_chart, filter_array_ref);

					}					
										
					
				}
			}



			//legends processing
			//---------------------1. if the source & target charts share the same legends field, sync their legends
			//prepare eval
			if (Object.values(params_chart.hidden_legends).length > 0) {var eval_source_hidden_legends = Object.values(params_chart.hidden_legends)[0].length}
			else {var eval_source_hidden_legends = 0}
			if (Object.values(params_chart_target.hidden_legends).length > 0) {var eval_target_hidden_legends = Object.values(params_chart_target.hidden_legends)[0].length}
			else {var eval_target_hidden_legends = 0}

			clean_filter_array(filter_array);

			if ((params_chart.legends_field === params_chart_target.legends_field) && eval_source_hidden_legends > 0 && filter_array.hasOwnProperty(params_chart.legends_field) === false) {// && interaction_type === "legends_binding"				
				sync_legends_rm_filter(params_chart, params_chart_target);				
			}
			//---------------------end 1. 
			



			//---------------------2. else if the target chart has hidden legends, restore it's original dataset with hidden legends
			else if (eval_target_hidden_legends > 0) {
				//if the filter_array does not contains a filter for the legend field && an active selection, restore original dataset
				if (filter_array.hasOwnProperty(params_chart_target.legends_field) === false && (params_chart_target.list_keys_values_segments_multiples_selected.length === 0
					)) { //|| Object.values(params_chart_target.brush_keys_values).length === 0
					restore_original_chart_datasets(params_chart_target);
				}
				
				//else if the target chart has no active selection, allow its filtering
				else if (params_chart_target.list_keys_values_segments_multiples_selected.length === 0) {
					params_chart_target.to_filter = true
					//collect the active slice to 

				}
				
				//else if the target chart has active selection, get its active selection and allow its filtering
				else if (params_chart_target.list_keys_values_segments_multiples_selected.length > 0) {
					params_chart_target.to_filter = true
				}


				
			}
			//---------------------end 2. 


			//---------------------3. else restore the original dataset
			else {
				params_chart_target.to_filter = true
			}




			//---------------------if the source chart has filtred legends & does not share the same legend field with its target, take the active legends
			if (eval_source_hidden_legends > 0 && params_chart.legends_field !== params_chart_target.legends_field) {
				//check the intergity of the array (it shall not contains "")
				var legends_array = Object.values(params_chart.active_legends)[0]; var legends_axis = Object.keys(params_chart.active_legends)[0];
				if (legends_array.filter(i=> i === "").length > 0) {
					//if the legends array contains "", regenerate the array for the legends api
					legends_array = params_chart.chart_instance.legend.legendItems.filter(l=> l.hidden === false).map(l=> l.text)
				}

				//prior to the active selection over active legends; push the legends only if the filter array does not contains a filter value for the same field
				filter_array.hasOwnProperty(legends_axis) === false ? filter_array[legends_axis] = legends_array.filter(i=> i !== "") : {}
			}
			//---------------------end 





			//collect active legends for third target charts
			clean_filter_array(filter_array);
			collect_active_legends_rmFilter(params_chart, params_charts_target_collect_slices, filter_array);
			

			//remove the filters no longer activ from the dataset of the target chart
			var ind_filtering_type = "remove_filter"
			//clean the filter array from empty fields
			clean_filter_array(filter_array)
			//if (params_chart_target.has_been_filtred === false) {
			//call filter func if the filter array is not empty
			if (Object.values(filter_array).length > 0 || params_chart_target.to_filter === true) {
				params_chart_target.filtered_by = {};
				crossfilter_rm(params_chart, params_chart_target, filter_array, ind_filtering_type, sharedParams);
			}
			else {
				try {
					delete params_chart_target.filtered_by.axis[params_chart.category_field]
					delete params_chart_target.filtered_by.axis[params_chart.sub_category_field]
				}
				catch {}
			}

			params_chart_target.status_chart = ''

			Object.assign(filter_array_ref, filter_array)

		}





		//refilter the target charts if one of their foreign filtering axis is outdated regarding to the last filter_array axis
		//delete filter_array_ref[""]
		//operations;



		for (var y = 0; y < params_charts_target_to_filter.length; y++) {
			//1.collect for each target chart it's foreign filtering axis (params_chart.filtered_by.axis)
			var target_chart = params_charts_target_to_filter[y]
			var keys_values_params_barChart = _.mapKeys(target_chart.filtered_by.axis, function(value, key) {
  				return key;
			});
			var keys_params_barChart = Object.keys(keys_values_params_barChart); keys_params_barChart = keys_params_barChart.filter(o=> o !== "")



			//2.regenerate active legends
				var activeLegends={};
				params_charts_target_collect_slices.map(c=> {
					if (c.chart_type === "chartJS") {
						activeLegends[c.legends_field] = c.chart_instance.legend.legendItems.filter(t=> t.text !== "" && t.hidden === false).map(l=> l.text)
					}

				})
				
			

			//3.delete obsolete active legends from the filtered axis, the ones that contains "" strings
			var refilter_array = {}; var ind_refilter = false
			delete_empty_legends(keys_values_params_barChart, activeLegends, refilter_array)



			//4.crossfilter the chart
			if (ind_refilter === true) {
				//clean the filter array from empty fields
				clean_filter_array(refilter_array)				
				var ind_filtering_type = "set_filter"
				//if (Object.keys(refilter_array).length > 0) {
					crossfilter_rm(target_chart, target_chart, refilter_array, ind_filtering_type, sharedParams)			
				//reset the indicator
				ind_refilter = false
				//}
			}
		}




		//refilter the chart it self if one of the legends became obsolete
		refilter_array = {}; filter_array_ref = {};
		delete_empty_legends(params_chart.filtered_by.axis, activeLegends, refilter_array);
		Object.assign(filter_array_ref, params_chart.filtered_by.axis); clean_filter_array(filter_array_ref);



		if (Object.values(filter_array_ref).length > 0) {

			if (params_chart.chart_type === "leaflet") {
				return
			}


			crossfilter_rm(params_chart, params_chart, params_chart.filtered_by.axis, ind_filtering_type, sharedParams)


			//show all hiddden legends
			var chart_type = params_chart.chart_instance.config.type
			var i = 0; var legend;
			params_chart.filtered_by.axis[params_chart.legends_field] !== undefined ? legend = params_chart.filtered_by.axis[params_chart.legends_field] : legend = []
			params_chart.chart_instance.legend.legendItems.map(l=> {
				if (chart_type === 'doughnut' || chart_type === 'pie') {										
					legend.indexOf(l.text) > -1 ? params_chart.chart_instance.getDatasetMeta(0).data[i].hidden=false : {};
				}
				else {
					legend.indexOf(l.text) > -1 ? params_chart.chart_instance.getDatasetMeta(i).hidden=false : {};
				}

				i++}
			)
			params_chart.chart_instance.update(0)						

		}


		function delete_empty_legends(filter_source, activeLegends, refilter_array) {
			if (filter_source !== undefined) {
				Object.keys(filter_source).forEach(key => {
					//if an obsolete legend is detected (""), delete it & replace it from the last version of active legends
					if (filter_source[key].findIndex(i=> i === "") > -1) {
						 delete filter_source[key];
						 filter_source[key] = activeLegends[key];
						 Object.assign(refilter_array, filter_source)
						 ind_refilter = true;
					}
					})
			}
		}		




		function crossfilter_rm(params_chart, params_chart_target, filter_array, ind_filtering_type, sharedParams) {
			//temporary code relative to leaflet
			//if the target chart is leaflet type & shares the same cat field with the source chart, remove all layers and restore the view to its initial level
			if (params_chart_target.chart_type === "leaflet" && params_chart_target.chart_subType === "choroplethe" && params_chart.chart_instance.config.type !== "scatter") {
				if (Object.values(params_chart_target.geographic_priority_layers).includes(params_chart.category_field)) {
					//delete the layers
		            Object.values(params_chart_target.map_instance._layers).filter(l=> l.hasOwnProperty("_tiles") === false && l.hasOwnProperty("_url") === false).map(l=> {
		                params_chart_target.map_instance.removeLayer(l)
		            })
					/*params_chart_target.inject_type = "init_view"
					params_chart_target.map_instance.flyToBounds(params_chart_target.data_source[1].borders);*/
					return
				}
	            
	            
			}
			else if (params_chart_target.chart_type === "leaflet" && params_chart_target.chart_subType === "points" && params_chart.chart_instance.config.type !== "scatter") {
				if (params_chart.category_field === params_chart_target.category_field) {
		            Object.values(params_chart_target.map_instance._layers).filter(l=> l.hasOwnProperty("_tiles") === false && l.hasOwnProperty("_url") === false).map(l=> {
		                params_chart_target.map_instance.removeLayer(l)
		            })
					return
				}
			}				
		    


		    //stat exec time
		    const t1 = (new Date())/1000

			//clean the filter array from empty fields
			var newObj = {};
			  Object.keys(filter_array).forEach((prop) => {
			    if (filter_array[prop][0] !== '') { newObj[prop] = filter_array[prop]; }
			  });
			delete newObj[""]
			filter_array = _.cloneDeep(newObj)

			//transfer the vilter array in the params chart target
			params_chart_target.transformations.crossfilter = {}
			Object.assign(params_chart_target.transformations.crossfilter, filter_array)
			//save the chart source that filters the current target used to filter the chart
			params_chart_target.filtered_by = {"id": params_chart.id, "params_chart": params_chart, "axis": filter_array}

			//get the data filtred & grouped
			var dataset_filtred = params_chart_target.instanciator.prepare_data_p1(params_chart_target, sharedParams)
			
			//0.get the instance of the chart to filter
			var chart_to_filter
			params_chart_target.chart_type === "leaflet" ? chart_to_filter = params_chart_target.map_instance : chart_to_filter = params_chart_target.chart_instance;
			

			//if the chart is chart js type
			if (params_chart_target.chart_type === "chartJS") {
				params_chart_target.data[0].labels = []; params_chart_target.data[1].datasets = [];
				chart_to_filter.config.data.labels = []; 
				for (var ii = 0; ii < chart_to_filter.config.data.datasets.length; ii++) {
					chart_to_filter.config.data.datasets[ii].data = []; chart_to_filter.config.data.datasets[ii].label = "";
					chart_to_filter.config.data.datasets[ii].backgroundColor = []; chart_to_filter.config.data.datasets[ii].borderColor = [];
					chart_to_filter.config.data.datasets[ii].borderWidth = [];
				}
			}
			else if (params_chart_target.chart_type === 'leaflet') {
				params_chart_target.data[0].labels = []; params_chart_target.data[1].datasets = [];
				params_chart_target.data[1].markers = []; params_chart_target.data[1].x_y = []; params_chart_target.inject_type = "update"
			}	
				
			
			//2.3.update de params array of the targeted chart with the filtred dataset
			/*2.1.if the trageted chart has already a selection, indicate to the data processing function to preserve the background color of 
			previous selection*/
			if (params_chart_target.chart_type === 'chartJS' || params_chart_target.chart_type === 'leaflet') {
				if (params_chart_target.list_labels_segment_single_selected.length !== 0 || params_chart_target.list_labels_segments_multiples_selected.length !== 0 
					|| Object.values(params_chart_target.brush_values).length > 0) {

					params_chart_target.prepare_data_type = "preserve backgroundColor"
					//stats exec time
					var t1_bis1 = (new Date())/1000
					params_chart_target.instanciator.prepare_data_p2(dataset_filtred, params_chart_target, sharedParams)// -> ko, nb de bordures et couleurs trop élevé
					var t2 = (new Date())/1000; var tf = parseFloat((t2-t1_bis1).toFixed(3))
					sharedParams.crossfilterProcess_exec_time.push({type: "crossfilter_rm", sub_type: "prepare_data_p2","chart": params_chart_target.id, exec_time: tf, event_time: (new Date).toLocaleString()})	

					var data_type = "data"; var injection_type = "update"

					params_chart_target.instanciator.inject_metadata(chart_to_filter, params_chart_target, data_type, injection_type) // -> ok



					params_chart_target.chart_type === "leaflet" ? params_chart_target.instanciator.setup_legends(params_chart_target, sharedParams, 'update') : {}
					params_chart_target.prepare_data_type = ""

					//hide_legends(params_chart_target, 'remove_filter')


				}
				else {
					params_chart_target.prepare_data_type = ""
					//stats exec time
					var t1_bis1 = (new Date())/1000
					params_chart_target.instanciator.prepare_data_p2(dataset_filtred, params_chart_target, sharedParams)// -> ko, nb de bordures et couleurs trop élevé
					var t2 = (new Date())/1000; var tf = parseFloat((t2-t1_bis1).toFixed(3))
					sharedParams.crossfilterProcess_exec_time.push({type: "crossfilter_rm", sub_type: "prepare_data_p2","chart": params_chart_target.id, exec_time: tf, event_time: (new Date).toLocaleString()})	

					//2.4.inject into the chart JS config instance the labels & datasets setup above
					var data_type = "data"; var injection_type = "update"
					params_chart_target.instanciator.inject_metadata(chart_to_filter, params_chart_target, data_type, injection_type) // -> ok
					params_chart_target.chart_type === "leaflet" ? params_chart_target.instanciator.setup_legends(params_chart_target, sharedParams, 'update') : {}
					//hide_legends(params_chart_target, 'remove_filter')
				}
			}
 			else if ((params_chart_target.chart_type === 'label' || params_chart_target.chart_type === 'labelGroup') && Object.keys(params_chart_target.transformations.crossfilter).length > 0 &&
 				params_chart_target.updateLabels === true) {
 				//remove previous card
 				var title = document.querySelector("#" + params_chart_target.id + "_title"); title.remove(); var card = document.querySelector("#" + 'card_' + params_chart_target.id); card.remove()
 				params_chart_target.instanciator.init_label(params_chart_target)
 				params_chart_target.instanciator.displayText(params_chart_target)
 				params_chart_target.updateLabels = undefined
 			}

			var t2 = (new Date())/1000; var tf = parseFloat((t2-t1).toFixed(3))
			sharedParams.crossfilterProcess_exec_time.push({type: "crossfilter_rm", "chart": params_chart_target.id, exec_time: tf, event_time: (new Date).toLocaleString()})	

		}

		params_chart.status_chart = ''

	

	}





}



function extract_active_slices(third_target_chart, filter_array) {

	


		var list_labels = _.cloneDeep(third_target_chart.list_labels_segments_multiples_selected)

		list_labels.map(o=> { 
			typeof(o.category_field) === "object" ? o.category_field = o.category_field.flat().flat() : o.category_field = [o.category_field]
		})

		//detect & delete the empty fields
		if (list_labels.length > 0 && list_labels.filter(f=> f.category_field !== "").length === 0) {
			filter_array[third_target_chart.sub_category_field] = []; 
			list_labels.map(o=> delete o.category_field)
			list_labels.map(o=> { filter_array[third_target_chart.sub_category_field].push([o.sub_category_field][0]) })
		}
		else if (list_labels.length > 0 && list_labels.filter(f=> f.sub_category_field !== "").length === 0) {
			filter_array[third_target_chart.category_field] = []
			/*if (third_target_chart.bin_params.bin === true) {filter_array[third_target_chart.category_field + "_binned"] = []}
			else {filter_array[third_target_chart.category_field] = []}*/
			list_labels.map(o=> delete o.sub_category_field)
			list_labels.map(o=> { 
				filter_array[third_target_chart.category_field].push([o.category_field][0])

			})
		}				
		//if no empty fields
		else {
			//if the filter array does not contains the same field than the category field of the third target chart, register the values
			if (filter_array.hasOwnProperty(third_target_chart.category_field) === false && list_labels.length > 0) {			
				filter_array[third_target_chart.category_field] = []; 
				list_labels.map(o=> {
					typeof(o.category_field) === "object" ? filter_array[third_target_chart.category_field].push(o.category_field.flat()) : filter_array[third_target_chart.category_field] = o.category_field
				})
			}
			if (third_target_chart.sub_category_field && filter_array.hasOwnProperty(third_target_chart.sub_category_field) === false && list_labels.length > 0) {			
				filter_array[third_target_chart.sub_category_field] = []; 
				list_labels.map(o=> {
					typeof(o.sub_category_field) === "object" ? filter_array[third_target_chart.sub_category_field].push(o.sub_category_field.flat()) : filter_array[third_target_chart.sub_category_field] = o.sub_category_field
				})
			}
		}			
}


function get_active_legends(filter_array, params_chart, third_target_chart, filter_type) {

	if (third_target_chart.nb_axis === 2) {
		//consider hidden legends only when the category fields differs
		if (params_chart.sub_category_field !== third_target_chart.sub_category_field) {
			var active_legends = third_target_chart.chart_instance.legend.legendItems.filter(o=> o.hidden === false && o.text !== "")
			
			var legends_array = _.map(active_legends, (o)=> (o.text) );
			filter_array[third_target_chart.sub_category_field] = []; //filter_chart_source[third_target_chart.sub_category_field] = [];
			for (var z = 0; z < legends_array.length; z++) {
				filter_array[third_target_chart.sub_category_field].push(legends_array[z]);
				//filter_chart_source[third_target_chart.sub_category_field].push(legends_array[z])
			}
		}
		//else check the legends actives in the params object
		else if (Object.values(third_target_chart.active_legends).length > 0) {
			filter_array[third_target_chart.sub_category_field] = third_target_chart.active_legends[third_target_chart.sub_category_field]
		}
	}

	//--------------------------------------------------------------------------------------


	if (third_target_chart.nb_axis === 1) {
		if (filter_type === 'set_filter') {
			//if the Axis are the same, priority to the chart source slice
			if (params_chart.category_field === third_target_chart.category_field) {	
				//var active_legends = third_target_chart.chart_instance.legend.legendItems.filter(o=> o.hidden === false && o.text !== "")
				//var legends_array = _.map(active_legends, (o)=> (o.text) );
				var legends_array = Object.values(third_target_chart.active_legends)[0]			
				
				filter_array[third_target_chart.category_field] = []; //filter_chart_source[third_target_chart.category_field] = [];
				for (var z = 0; z < legends_array.length; z++) {
					filter_array[third_target_chart.category_field].push(legends_array[z]);
					//filter_chart_source[third_target_chart.category_field].push(legends_array[z])
				}
			}
			//if the axis of chart source and third target differs
			if (params_chart.category_field !== third_target_chart.category_field) {	

				var legends_array = Object.values(third_target_chart.active_legends)[0]			
				
				filter_array[third_target_chart.category_field] = []; //filter_chart_source[third_target_chart.category_field] = [];
				for (var z = 0; z < legends_array.length; z++) {
					filter_array[third_target_chart.category_field].push(legends_array[z]);
					//filter_chart_source[third_target_chart.category_field].push(legends_array[z])
				}
			}			

		}
		else if (filter_type === 'remove_filter') {
			//else check the legends actives in the params object
				var legends_array = Object.values(third_target_chart.active_legends)[0]
				
				
				filter_array[third_target_chart.category_field] = []; //filter_chart_source[third_target_chart.category_field] = [];
				for (var z = 0; z < legends_array.length; z++) {
					filter_array[third_target_chart.category_field].push(legends_array[z]);

				}
		}
	}						

	//--------------------------------------------------------------------------------------


}




function collect_active_legends_setFilter(params_chart, params_chart_target_toFilter, params_charts_target, filter_array, interaction_type) {
	var params_chart_target = params_charts_target.filter(p => p.status_chart === 'target')[0]
	if (params_chart_target === undefined) {return}

	for (var ii = 0; ii < params_charts_target.length; ii++) {

		//if the chart is not the current target
		if (params_charts_target[ii].status_chart !== 'target') {
			
			var third_target_chartLegends = params_charts_target[ii]

			if (interaction_type === 'selection_binding' || interaction_type === 'multiple_selection_binding' || interaction_type === 'legends_binding') {
				//collecte only in the case when the charts have diffent legend fields
				//1.check that the source and third_target_chart have different legend field
				if (params_chart.legends_field !== third_target_chartLegends.legends_field) {
					//2.check that the target_chart to filter and third_target_chart to scan for legends have different legend field
					//prepare eval for legends alimentation
					if (Object.values(third_target_chartLegends.hidden_legends).length > 0) {var eval_target_hidden_legends = Object.values(third_target_chartLegends.hidden_legends)[0].length}
					else {var eval_target_hidden_legends = 0}

					if (params_chart_target_toFilter.legends_field !== third_target_chartLegends.legends_field && eval_target_hidden_legends >0) {
						collect_active_legends_(filter_array, third_target_chartLegends);
					}

				}
			}
			else if (interaction_type === 'brush_selection_binding') {
				collect_active_legends_(filter_array, third_target_chartLegends);
			}
		}
	}

	function collect_active_legends_(filter_array, third_target_chartLegends) {
		//if the chart has hidden legends, check if the axis is absent from the filter_array before registration
		var has_hidden_legends = third_target_chartLegends.hidden_legends;
		if (has_hidden_legends !== undefined && Object.values(has_hidden_legends).length > 0) {
			if (Object.values(has_hidden_legends)[0].length > 0) {
				
				//params_charts_target.map(p=> p.list_keys_values_segments_multiples_selected).filter(a=> a.length > 0).map(a=> a.findIndex(i=> i["INSEE_COM"]))
				var legends_axis = Object.keys(has_hidden_legends)[0];

				if (filter_array.hasOwnProperty(Object.keys(has_hidden_legends)[0]) === false) {
					var legends_array = Object.values(third_target_chartLegends.active_legends)[0];
					//check the intergity of the array (it shall not contains "")
					if (legends_array.filter(i=> i === "").length > 0) {
						//if the legends array contains "", regenerate the array for the legends api
						legends_array = third_target_chartLegends.chart_instance.legend.legendItems.filter(l=> l.hidden === false).map(l=> l.text)
					}					
					filter_array[legends_axis] = legends_array
				}
			}
		}	
}
}

//collect active legends for third target charts
function collect_active_legends_rmFilter(params_chart, params_charts_target, filter_array) {
	var params_chart_target = params_charts_target.filter(p => p.status_chart === 'target')[0]
	if (params_chart_target === undefined) {return}
	for (var ii = 0; ii < params_charts_target.length; ii++) {

		//if the chart is not the current target
		if (params_charts_target[ii].status_chart !== 'target') {
			
			var third_target_chartLegends = params_charts_target[ii]

			//collecte only in the case when the charts have diffent legend fields
			if (params_chart.legends_field !== third_target_chartLegends.legends_field && params_chart_target.legends_field !== third_target_chartLegends.legends_field) {
				var has_hidden_legends = third_target_chartLegends.hidden_legends; var list_labels_selected = [];

				//if the chart has hidden legends, check if the axis is absent from the filter_array before registration
				if (has_hidden_legends !== undefined && Object.values(has_hidden_legends).length > 0) {
					if (Object.values(has_hidden_legends)[0].length > 0) {
						
						//params_charts_target.map(p=> p.list_keys_values_segments_multiples_selected).filter(a=> a.length > 0).map(a=> a.findIndex(i=> i["INSEE_COM"]))
						var legends_axis = Object.keys(has_hidden_legends)[0];

						if (filter_array.hasOwnProperty(Object.keys(has_hidden_legends)[0]) === false) {
							var legends_array = Object.values(third_target_chartLegends.active_legends)[0];
							//check the intergity of the array (it shall not contains "")
							if (legends_array.filter(i=> i === "").length > 0) {
								//if the legends array contains "", regenerate the array for the legends api
								legends_array = third_target_chartLegends.chart_instance.legend.legendItems.filter(l=> l.hidden === false).map(l=> l.text)
							}
							filter_array[legends_axis] = legends_array
						}
					}
				}
			}
		}							
	}
}





function clean_filter_array(filter_array) {
	delete filter_array[""]
	delete filter_array["undefined"]
	Object.keys(filter_array).forEach(key => filter_array[key] === undefined ? delete filter_array[key] : {});
	Object.keys(filter_array).forEach(key => filter_array[key][0] === undefined ? delete filter_array[key] : {});
	Object.keys(filter_array).forEach(key => filter_array[key] === [undefined] ? delete filter_array[key] : {});
	Object.keys(filter_array).forEach(key => filter_array[key] === "" ? delete filter_array[key] : {});
	Object.keys(filter_array).forEach(key => filter_array[key][0] === "" ? delete filter_array[key] : {});	
	Object.keys(filter_array).forEach(key => filter_array[key].length === 0 ? delete filter_array[key] : {});
	//delete case filter_array[key] = [[""]]
	Object.keys(filter_array).forEach(key => { 
		if (typeof(filter_array[key]) === "object") { 
			filter_array[key].flat().flat().includes("") ? delete filter_array[key] : {} 
		} 
	})	

}





//hide programmatically legends
function hide_legends(params_chart, filter_type) {
	//1.access to the manually hidden legends
	if (params_chart.hidden_legends) {

		//get hidden legends
		if (params_chart.hidden_legends[params_chart.category_field] !== undefined) {
			var hidden_legends = params_chart.hidden_legends[params_chart.category_field]
		}
		else {
			var hidden_legends = params_chart.hidden_legends[params_chart.sub_category_field]
		}

		//2.get the position of each hidden legend in the legends chart section
		var pos_hidden_legends = {}
		if (hidden_legends) {
			hidden_legends.map(h=> {
				var pos = params_chart.chart_instance.legend.legendItems.findIndex(p=> p.text === h)
				if (h !== "" && pos > -1) {pos_hidden_legends[h] = pos}

			})
		}



		params_chart.chart_instance.update()

		//if a slice is selected on the source chart, enable the corresponding dataset on the legends
		//check the type of legends config: for pie: params_pieChart1.chart_instance.getDatasetMeta(0).data[0].hidden = true
		var chart_type = params_chart.chart_instance.config.type
		if (filter_type === 'set_filter') {
			//if hidden legends are found, keep them hidden
			if (Object.values(pos_hidden_legends).length > 0) {
				preserve_filtred_legends(params_chart, pos_hidden_legends, chart_type);					
			}
			//else, display all datasets
			else {
				var i = 0;
				params_chart.chart_instance.legend.legendItems.map(l=> {
					if (chart_type === 'doughnut' || chart_type === 'pie') {
						l.text !== "" ? params_chart.chart_instance.getDatasetMeta(0).data[i].hidden=false : {};
					}
					else {
						l.text !== "" ? params_chart.chart_instance.getDatasetMeta(i).hidden=false : {};
					}

					i++}
				)
				params_chart.chart_instance.update()
			}
		}

		//if the selected slice(s) is released on the source chart, show/hide the corresponding datasets according to the legends selected manually
		else if (filter_type === 'remove_filter') {
			preserve_filtred_legends(params_chart, pos_hidden_legends, chart_type);			
		}	

	}

	
}




function sync_legends(params_chart, params_chart_target, params_charts_target) {
	
	//if the legends of the source chart and target chart are the same, and if there are hidden legends, exec legends synchro and do not let the source chart filter the target
	if ((params_chart.legends_field === params_chart_target.legends_field) && Object.values(params_chart.hidden_legends).length > 0) {

		//get hidden legends
		if (params_chart.hidden_legends[params_chart.category_field] !== undefined) {
			var hidden_legends = params_chart.hidden_legends[params_chart.category_field]; var active_legends = params_chart.active_legends[params_chart.category_field]
		}
		else {
			var hidden_legends = params_chart.hidden_legends[params_chart.sub_category_field]; var active_legends = params_chart.active_legends[params_chart.sub_category_field]
		}

		//2.get the position of each hidden legend in the legends chart section
		var pos_hidden_legends = {}
		if (hidden_legends) {
			hidden_legends.map(h=> {
				var pos = params_chart_target.chart_instance.legend.legendItems.findIndex(p=> p.text === h)
				if (h !== "" && pos > -1) {pos_hidden_legends[h] = pos}

			})
		}

		//save the last version of hidden legends for the params_chart_target
		params_charts_target.map(p=> p.legends_field === params_chart.legends_field ? p.hidden_legends[p.legends_field]=[] : {})
		params_charts_target.map(p=> p.legends_field === params_chart.legends_field ? p.active_legends[p.legends_field]=[] : {})

		params_charts_target.map(p=> p.legends_field === params_chart.legends_field ? hidden_legends.map(h=> p.hidden_legends[p.legends_field].push(h)) : {})
		params_charts_target.map(p=> p.legends_field === params_chart.legends_field ? active_legends.map(h=> p.active_legends[p.legends_field].push(h)) : {})


		//3.loop through the target chart and hide corresponding legends
		//check the type of legends config: for pie: params_pieChart1.chart_instance.getDatasetMeta(0).data[0].hidden = true
		var chart_type = params_chart_target.chart_instance.config.type;
		
		preserve_filtred_legends(params_chart_target, pos_hidden_legends, chart_type);

	}			
}





function sync_legends_rm_filter(params_chart, params_chart_target) {
	
	//if the legends of the source chart and target chart are the same, and if there are hidden legends, exec legends synchro and do not let the source chart filter the target
	if ((params_chart.legends_field === params_chart_target.legends_field) && Object.values(params_chart.hidden_legends).length > 0) {

		//get hidden legends
		if (params_chart.hidden_legends[params_chart.category_field] !== undefined) {
			var hidden_legends = params_chart.hidden_legends[params_chart.category_field]
		}
		else {
			var hidden_legends = params_chart.hidden_legends[params_chart.sub_category_field]
		}

		//restore data source for both source & target chart
		var params_charts = [params_chart, params_chart_target]
		if (hidden_legends.length>0) {
			params_charts.map(chart=> {
				chart.data = _.cloneDeep(chart.data_source);
				chart.prepare_data_type = ""; var data_type = "data"; var injection_type = "update"; var updateTime = 0;
				chart.instanciator.inject_metadata(chart.chart_instance, chart, data_type, injection_type, updateTime) // -> ok
			})
			

			//2.get the position of each hidden legend in the legends chart section
			var pos_hidden_legends = {}
			if (hidden_legends) {
				hidden_legends.map(h=> {
					var pos = params_chart_target.chart_instance.legend.legendItems.findIndex(p=> p.text === h)
					if (h !== "" && pos > -1) {pos_hidden_legends[h] = pos}

				})
			}


			//3.loop through the target chart and hide corresponding legends
			//check the type of legends config: for pie: params_pieChart1.chart_instance.getDatasetMeta(0).data[0].hidden = true

			var chart_type = params_chart.chart_instance.config.type;
			preserve_filtred_legends(params_chart, pos_hidden_legends, chart_type);

			var chart_type = params_chart_target.chart_instance.config.type;
			preserve_filtred_legends(params_chart_target, pos_hidden_legends, chart_type);

			params_chart_target.has_been_filtred = true

		}
		


	}			
}






function restore_original_chart_datasets(params_chart) {
		//get hidden legends
		if (params_chart.hidden_legends[params_chart.category_field] !== undefined) {
			var hidden_legends = params_chart.hidden_legends[params_chart.category_field]
		}
		else {
			var hidden_legends = params_chart.hidden_legends[params_chart.sub_category_field]
		}

		//restore data source for target chart		
		params_chart.data = _.cloneDeep(params_chart.data_source);
		params_chart.prepare_data_type = ""; var data_type = "data"; var injection_type = "update"; var updateTime = 0;
		params_chart.instanciator.inject_metadata(params_chart.chart_instance, params_chart, data_type, injection_type, updateTime) // -> ok
	

		//2.get the position of each hidden legend in the legends chart section
		var pos_hidden_legends = {}
		if (hidden_legends) {
			hidden_legends.map(h=> {
				var pos = params_chart.chart_instance.legend.legendItems.findIndex(p=> p.text === h)
				if (h !== "" && pos > -1) {pos_hidden_legends[h] = pos}

			})
		}


		//3.loop through the target chart and hide corresponding legends
		//check the type of legends config: for pie: params_pieChart1.chart_instance.getDatasetMeta(0).data[0].hidden = true

		var chart_type = params_chart.chart_instance.config.type;
		preserve_filtred_legends(params_chart, pos_hidden_legends, chart_type);

		params_chart.has_been_filtred = true

}






function preserve_filtred_legends(params_chart, pos_hidden_legends, chart_type) {
	var array_pos_hidden_legends = Object.values(pos_hidden_legends);
	var max = params_chart.chart_instance.legend.legendItems.length;
	if (d3.sum(array_pos_hidden_legends) >= 0) {
		for (var o = 0; o < max; o++) {
			


			if (chart_type === 'doughnut' || chart_type === 'pie') {
				if (array_pos_hidden_legends.findIndex(l=> l===o) > -1) {
					params_chart.chart_instance.getDatasetMeta(0).data[o].hidden=true
				}
				else {
					params_chart.chart_instance.getDatasetMeta(0).data[o].hidden=false							
				}
			}
			else {
				if (array_pos_hidden_legends.findIndex(l=> l===o) > -1) {
					params_chart.chart_instance.getDatasetMeta(o).hidden=true	
				}
				else {params_chart.chart_instance.getDatasetMeta(o).hidden=false}
			}
		}
	}
	params_chart.chart_instance.update();

	//if a brush is in place, reset its coordinates according to the last scales observed
	if (Object.values(params_chart.brush_values).length > 0) {adapt_brush_v2(params_chart)}
}




function collect_active_legends(current_chart, _this, params_chart) {
	//collect current legends if the chart is ChartJS type
	if (current_chart.legend) {
		var legends_array=[]; var hidden_legends=[]
		//remove active legends					
		//params_chart.active_legends = {}
		var limit = current_chart.legend.legendItems.length
		for (var i = 0; i < limit; i++) {
			var status_legend = current_chart.legend.legendItems[i].hidden		

			//if the decoder param is on, re-encode the field to fill the crossfilter process with the expected value (ex transform 'Appartements' into 'a')
			if (params_chart.decode && params_chart.data_input) {
				var legendItems = params_chart.data_input.filter(r=> r[params_chart.category_field + "_decoded"] === legendItem)
				if (legendItems.length > 0) {
					var legendItem = legendItems[0][params_chart.category_field]
				}
				else {
					var legendItem = current_chart.legend.legendItems[i].text
				}
			}
			else {
				var legendItem = current_chart.legend.legendItems[i].text
			}

			//collect all non hidden slices to push them into the filter array
			if (status_legend === false) {
				legends_array.push(legendItem)
			}
			else if (status_legend === true) {
				hidden_legends.push(current_chart.legend.legendItems[i].text)
			}
		}
		


		_this.legends_array = legends_array


		return {active_legends: legends_array, hidden_legends: hidden_legends}
	}

	//collect current legends if the chart is leaflet type
	if (params_chart.chart_type === "leaflet" && params_chart.selected_legends.length > - 1) {
		var legends_array=[]; var hidden_legends=[]
		//remove active legends					
		//params_chart.active_legends = {}
		var limit = params_chart.selected_legends.length
		for (var i = 0; i < limit; i++) {
			
			//collect all non hidden slices to push them into the filter array		
			legends_array = [...params_chart.selected_legends]
		
			
		
		}
		


		_this.legends_array = legends_array


		return {active_legends: legends_array, hidden_legends: hidden_legends}
	}	
}





/*class Tchat {

	constructor() {
		mobx.extendObservable(this, {
		messages: [],
		notifications: 0
		})
		this.autre = "toto"
	}
}

let tchat = new Tchat()
mobx.autorun(function() {
	console.log('voici le new messages: ' + tchat.messages.join(", "))
})
tchat.messages.push('hello')*/



// params_bar1 = new param2_customSpec_BarChartsJS()

/*mobx.autorun(function() {
	try{
		setTimeout(()=> console.log('voici le new clic: ' + params_bar1.list_idx_segment_single_selected.join(", ")), 100)
	}
	catch{
		console.log("array to observe not ready")
	}
})*/
