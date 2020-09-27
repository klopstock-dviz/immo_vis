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





	observe_chart_state(params_chart, params_charts_target) {








		var id_previous_singleSelect = ""
		var id_previous_multiSelect = ""
		var id_current_legend = ""
		var id_previous_legend = ""
		var current_chart
		var category = "x"
		var sub_category = "x"
		var id_current_singleSelect = ""
		var id_current_multiSelect = ""
		var filter_array = [];
		var elements_to_filter


		var legends_array = this.legends_array;
		var _this = this;


		setInterval(function() {


			//graph bar1
			//observation clic simple
			try{


				id_current_singleSelect = params_chart.list_idx_segment_single_selected.join()
				id_current_multiSelect = params_chart.list_idx_segments_multiples_selected.join()
				
				
				//if a change in interaction with the chart is registred between two checks
				if (id_previous_singleSelect !== id_current_singleSelect) {

					//if a selection occurs (a slice is clicked)
					if (id_current_singleSelect !== "") {

						//indiquer la détection du clic
						console.log('observer 1 clic unique:' + params_chart.list_idx_segment_single_selected)

						//ACTIONS TO TRIGGER
						var interaction_type = "selection_binding"
						_this.set_filter(params_chart, params_charts_target, interaction_type)

						//register the new state
						id_previous_singleSelect = params_chart.list_idx_segment_single_selected.join()
						params_chart.status_chart = ''
						id_previous_multiSelect = ""
					}

					//if the selection is released, reset the chart whith it's original data
					else if (id_current_singleSelect === "") {
						var interaction_type = "selection_binding"
						_this.remove_filter(params_chart, params_charts_target, interaction_type)

						//register the value of the current index as "previous id"
						id_previous_singleSelect = params_chart.list_idx_segment_single_selected.join()
						params_chart.status_chart = ''
						id_previous_multiSelect = ""


					}
				}

			}
			catch (error) {
				console.log("observer 1 ko:" + error)
			}


			//observation clics multiples
			try{


				//declencher si seulement le clic simple n'est pas alimenté
				if (id_previous_singleSelect === "" && id_previous_multiSelect !== id_current_multiSelect) { //id_previous_singleSelect !== id_current_multiSelect && 

					//if a selection occurs (a slice is clicked)
					if (id_current_multiSelect !== "") {

						console.log('observer 2 clics multiples:' + params_chart.list_idx_segments_multiples_selected)
						id_previous_multiSelect = params_chart.list_idx_segments_multiples_selected.join()

						//ACTIONS TO TRIGGER
						//1.
						var interaction_type = "multiple_selection_binding"
						_this.set_filter(params_chart, params_charts_target, interaction_type)


					}
					//if the selection is released, reset the chart whith it's original data
					else if (id_current_multiSelect === "") { // && id_current_singleSelect === ""
						var interaction_type = "multiple_selection_binding"
						_this.remove_filter(params_chart, params_charts_target, interaction_type)

						//register the value of the current index as "previous id"
						id_previous_multiSelect = params_chart.list_idx_segments_multiples_selected.join()
						params_chart.status_chart = ''


					}
				}
			}
			catch(error){
				console.log("observer 2 ko: " + error)
			}	


			//observation clics legends
			try{

				current_chart = params_chart.chart_instance;


				function detect_hidden_legends() {										
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

				function collect_active_legends() {
					//collect current legends
					var legends_array=[];
					var limit = current_chart.legend.legendItems.length
					for (var i = 0; i < limit; i++) {
						var status_legend = current_chart.legend.legendItems[i].hidden
						//collect all non hidden slices to push them into the filter array
						if (status_legend === false) {
							legends_array.push(current_chart.legend.legendItems[i].text)
						}
					}
					_this.legends_array = legends_array
					return legends_array
				}

				var legends_array = collect_active_legends()
				var legends_hidden = detect_hidden_legends(); legends_hidden = deduplicate_array(legends_hidden)

				if (legends_array !== undefined) {id_current_legend = [...legends_array].join()}
				
				//if a legend is selected && this selection differs from the previous one, update the chart
				if (params_chart.legend_clicked === true && id_previous_legend !== id_current_legend) {
					console.log('legend clicked' + legends_array)
					var legends_array = collect_active_legends()
					if (legends_array !== undefined) {
						id_previous_legend = [...legends_array].join()
					}

					//ACTIONS TO TRIGGER
					//1.changer la valeur d'un var représentant l'elem cible à filtrer
					var interaction_type = "legends_binding"
					_this.set_filter(params_chart, params_charts_target, interaction_type)

					//reset legend_clicked status
					params_chart.legend_clicked = false
				}
			}
			catch(error) {
				console.log("observer legends ko: " + error)
			}
			

			}
		, 200)
		}


	set_filter(params_chart, params_charts_target, interaction_type) {
		var filter_chart_source = {}; var filter_array_ref = {};
		params_chart.status_chart = 'active';
		//filter the data of the targeted charts
		for (var i = 0; i < params_charts_target.length; i++) {
			var params_chart_target = params_charts_target[i]
			params_chart_target.status_chart = 'target';
			

			
			var filter_array = {};
			if (interaction_type === "selection_binding") {
				//fill the filter dict with the slice(s) selected in the current chart
				for (var j = 0; j < params_chart.list_labels_segment_single_selected.length; j++) {
					var list_labels = params_chart.list_labels_segment_single_selected[j]
					//deal with the case when the source chart has 1 axis
					if (Object.keys(list_labels).length === 1) {
						filter_array[params_chart.category_field] = [list_labels.category_field]
					}
					//deal with the case when the source chart has 2 axis
					else if (Object.keys(list_labels).length === 2) {
						//determine the case of selection mode (filter on 1 or 2 levels)
						if (params_chart.selection_params.selection_level === 'all') {
							filter_array[params_chart.category_field] = [list_labels.category_field];
							filter_array[params_chart.sub_category_field] = [list_labels.sub_category_field]
						}
						else if (params_chart.selection_params.selection_level === 'single') {
							filter_array[params_chart[params_chart.selection_params.selection_field]] = [list_labels[params_chart.selection_params.selection_field]]
						}
					}								
				}
			}
			else if (interaction_type === "multiple_selection_binding") {
				//fill the filter dict with the slice(s) selected in the current chart
				var categories_selected_array = []; var sub_categories_selected_array = [];
				for (var j = 0; j < params_chart.list_labels_segments_multiples_selected.length; j++) {
					var list_labels = params_chart.list_labels_segments_multiples_selected[j]

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
						filter_array[params_chart.category_field] = categories_selected_array;
					}
					else if (Object.keys(list_labels).length === 2) {
						filter_array[params_chart.category_field] = categories_selected_array;
						filter_array[params_chart.sub_category_field] = sub_categories_selected_array
					}

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
						filter_array[params_chart.category_field] = [...this.legends_array];
					}					
					/*filter_chart_source[params_chart.sub_category_field] = [...this.legends_array]*/
				}
				//deal with the case when the source chart has 2 axis
				else if (params_chart.nb_axis === 2) {
					filter_array[params_chart.category_field] = [...params_chart.chart_instance.data.labels];
					filter_array[params_chart.sub_category_field] = [...this.legends_array];

					/*filter_chart_source[params_chart.category_field] = [...params_chart.chart_instance.data.labels];
					filter_chart_source[params_chart.sub_category_field] = [...this.legends_array];*/

				}				


			}



			/*in order to preserve previous interactions, collect the slices selected in the third target charts (not the current target)
			only if these slices does not compose the axis of the current target chart*/
			for (var a = 0; a < params_charts_target.length; a++) {

				//if the chart is not the current target
				if (params_charts_target[a].status_chart !== 'target') {
					var third_target_chart = params_charts_target[a]

					if (interaction_type === "selection_binding") {
						//check if we have hidden legends
						var has_hidden_legends = _.filter(third_target_chart.chart_instance.legend.legendItems, {"hidden": true}); var list_labels_selected = []
						//if list_labels_segment_single_selected is empty, take list_labels_segments_multiples_selected
						if (third_target_chart.list_labels_segment_single_selected.length === 1) {
							list_labels_selected = [...third_target_chart.list_labels_segment_single_selected]
						}
						else if (third_target_chart.list_labels_segments_multiples_selected.length >= 1) {
							//refilter selected slices according to the values get from the source chart
							var active_slices = _.filter(third_target_chart.list_labels_segments_multiples_selected, 
								item => third_target_chart.chart_instance.data.labels.indexOf(item.category_field) !== -1);
							list_labels_selected = [...active_slices]	
						}
						//ELSE if the chart has hidden legends, then pick the active ones
						else if (has_hidden_legends.length > 0) {
							if (third_target_chart.nb_axis === 2) {
								var active_legends = _.filter(third_target_chart.chart_instance.legend.legendItems, {"hidden": false})
								/*var list_labels_selected = [{"category_field": third_target_chart.chart_instance.data.labels, 
															"sub_category_field": _.map(active_legends, (o)=> (o.text) )}]*/
								var legends_array = _.map(active_legends, (o)=> (o.text) );
								filter_array[third_target_chart.sub_category_field] = []; filter_chart_source[third_target_chart.sub_category_field] = [];
								for (var z = 0; z < legends_array.length; z++) {
									filter_array[third_target_chart.sub_category_field].push(legends_array[z]);
									filter_chart_source[third_target_chart.sub_category_field].push(legends_array[z])
								}
								
							}

						}
						else {list_labels_selected = []}

						//collect the selected labels if they exist
						if (list_labels_selected.length > 0) {
							filter_array[third_target_chart.category_field] = []; filter_chart_source[third_target_chart.category_field] = [];
							filter_array[third_target_chart.sub_category_field] = []; filter_chart_source[third_target_chart.sub_category_field] = [];

							for (var j = 0; j < list_labels_selected.length; j++) {
								var list_labels = list_labels_selected[j]
								//deal with the case when the source chart has 1 axis
								if (Object.keys(list_labels).length === 1) {
									filter_array[third_target_chart.category_field].push(list_labels.category_field);
									filter_chart_source[third_target_chart.category_field].push(list_labels.category_field)
								}
								//deal with the case when the source chart has 2 axis
								else if (Object.keys(list_labels).length === 2) {
									filter_array[third_target_chart.category_field].push(list_labels.category_field);
									filter_array[third_target_chart.sub_category_field].push(list_labels.sub_category_field)
									filter_chart_source[third_target_chart.category_field].push(list_labels.category_field)
									filter_chart_source[third_target_chart.sub_category_field].push(list_labels.sub_category_field)

								}								
							}
						};





					}
					else if (interaction_type === "multiple_selection_binding" || interaction_type === "legends_binding") {
						//check if we have hidden legends
						var has_hidden_legends = _.filter(third_target_chart.chart_instance.legend.legendItems, {"hidden": true}); var list_labels_selected = []

						//if list_labels_segment_single_selected is empty, take list_labels_segments_multiples_selected
						if (third_target_chart.list_labels_segment_single_selected.length === 1) {
							var list_labels_selected = [...third_target_chart.list_labels_segment_single_selected]
						}
						else if (third_target_chart.list_labels_segments_multiples_selected.length >= 1) {
							//refilter selected slices according to the values get from the source chart
							var active_slices = _.filter(third_target_chart.list_labels_segments_multiples_selected, 
								item => third_target_chart.chart_instance.data.labels.indexOf(item.category_field) !== -1);
							var list_labels_selected = [...active_slices]
						}
						//ELSE if the chart has hidden legends, then pick the active ones
						else if (has_hidden_legends.length > 0) {
							if (third_target_chart.nb_axis === 2) {
								var active_legends = _.filter(third_target_chart.chart_instance.legend.legendItems, {"hidden": false})
								/*var list_labels_selected = [{"category_field": third_target_chart.chart_instance.data.labels, 
															"sub_category_field": _.map(active_legends, (o)=> (o.text) )}]*/
								var legends_array = _.map(active_legends, (o)=> (o.text) );
								filter_array[third_target_chart.sub_category_field] = []; filter_chart_source[third_target_chart.sub_category_field] = [];
								for (var z = 0; z < legends_array.length; z++) {
									filter_array[third_target_chart.sub_category_field].push(legends_array[z]);
									filter_chart_source[third_target_chart.sub_category_field].push(legends_array[z]);
								}
								
							}

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
									filter_chart_source[third_target_chart.category_field] = categories_selected_array;
								}
								else if (Object.keys(list_labels).length === 2) {
									filter_array[third_target_chart.category_field] = categories_selected_array;
									filter_array[third_target_chart.sub_category_field] = sub_categories_selected_array

									filter_chart_source[third_target_chart.category_field] = categories_selected_array;
									filter_chart_source[third_target_chart.sub_category_field] = sub_categories_selected_array									
								}
						}


					}
					
					
				}
			}





		
			var ind_filtering_type = "set_filter"
			
			crossfilter(params_chart, params_chart_target, filter_array, ind_filtering_type)

			params_chart_target.status_chart = '';

			Object.assign(filter_array_ref, filter_array)
		}


		//refilter the target charts if one of their foreign filtering axis is outdated regarding to the last filter_array axis
		delete filter_array_ref[""]
		//operations;

		for (var y = 0; y < params_charts_target.length; y++) {
			//1.collect for each target chart it's foreign filtering axis (params_chart.filtered_by.axis)
			var target_chart = params_charts_target[y]
			var keys_values_params_barChart = _.mapKeys(target_chart.filtered_by.axis, function(value, key) {
  				return key;
			});
			var keys_params_barChart = Object.keys(keys_values_params_barChart); keys_params_barChart = keys_params_barChart.filter(o=> o !== "")


			//2.compare the values of each of these axis with the last version of filter_array
			//2.1.get the differences between the 2 arrays

			//--------------------------------------------------ramda method to get differences from 2 objects
			var oldState = target_chart.filtered_by.axis;
			var newState = filter_array_ref;

			var keysObj = R.keys(newState);	

			var filterFunc = key => {
			  var value = R.eqProps(key,oldState,newState)
			  return {[key]:value}
			};

			//function that compares the first set of filtering values and the last set
			//return 'false' if there is differences
			var resultCompare = R.map(filterFunc, keysObj);
			//--------------------------------------------------end
			
			//2.2.filter the resultCompare array to locate the axis which has differences
			for (var w = 0; w < keys_params_barChart.length; w++) {
				
				var field = keys_params_barChart[w]
				var diff = _.filter(resultCompare, {[field]: false})
				//2.3.if the value stored in the filter_array_ref (last record) is different from the source (first record, in params_chart.filtered_by.axis), replace it
				if (diff.length > 0) {
					//replace the original value by the last uptodate
					Object.assign(keys_values_params_barChart[field] , filter_array_ref[field]);
					//filter the empty var
					keys_values_params_barChart[field] = keys_values_params_barChart[field].filter(o=> typeof(o) !== "object"); var refilter_array = {};
					//transfert the filtering axis to a specifi dict
					Object.assign(refilter_array, keys_values_params_barChart)
					//indicate the refiltering need
					var ind_refilter = true
				}
			}			


			//4.crossfilter the chart
			if (ind_refilter === true) {
				delete refilter_array[""]; var ind_filtering_type = "set_filter"
				crossfilter(target_chart, target_chart, refilter_array, ind_filtering_type)
				//reset the indicator
				ind_refilter = false
			}
		}		
		 

		//filter the chart source it self with all the active slices, except it's own slices
		//remove the category fields of the current chart from the filter to avoid sefl filtering
		var ind_filtering_type = "set_filter"
		//1.extract list of axis of target charts:
		var list_of_target_axis = _.map(params_charts_target, (axis) => axis.list_of_axis);
		//2.detect if the axis of current chart is shared with the list above, if not delete it from the filter_chart_source
		if (params_chart.nb_axis === 1) {
			
		}
		else if (params_chart.nb_axis === 2) {
			
		}

		if (Object.keys(filter_chart_source).length > 0) {
			crossfilter(params_chart, params_chart, filter_chart_source, ind_filtering_type)
		}




		function crossfilter(params_chart, params_chart_target, filter_array, ind_filtering_type) {
			var dataset_filtred = crossfilter_master(params_chart, params_chart_target, filter_array, ind_filtering_type)

			//update the targeted chart with the filtred data
			//1.get the instance of the chart to filter
			var chart_to_filter = params_chart_target.chart_instance;

			//2.prepare the structure of the datasets and labels to be injected into chart JS config instance
			//2.2.reset the existing labels & datasets in the param array & the config chart JS instance 
			params_chart_target.data[0].labels = []; params_chart_target.data[1].datasets = [];
			chart_to_filter.config.data.labels = []; 
			for (var ii = 0; ii < chart_to_filter.config.data.datasets.length; ii++) {
				chart_to_filter.config.data.datasets[ii].data = []; chart_to_filter.config.data.datasets[ii].label = [];
				chart_to_filter.config.data.datasets[ii].backgroundColor = []; chart_to_filter.config.data.datasets[ii].borderColor = [];
				chart_to_filter.config.data.datasets[ii].borderWidth = [];
			}

			//2.3.update de params array of the targeted chart with the filtred dataset
			/*2.1.if the trageted chart has already a selection, indicate to the data processing function to preserve the background color of 
			previous selection*/
			if (params_chart_target.list_labels_segment_single_selected.length !== 0 || params_chart_target.list_labels_segments_multiples_selected.length !== 0 ) {

				params_chart_target.prepare_data_type = "preserve backgroundColor"
				params_chart_target.instanciator.prepare_data_p2(dataset_filtred, params_chart_target)// -> ko, nb de bordures et couleurs trop élevé
				var data_type = "data"; var injection_type = "update"
				params_chart_target.instanciator.inject_metadata(chart_to_filter, params_chart_target, data_type, injection_type) // -> ok
				params_chart_target.prepare_data_type = ""


			}
			else {
				params_chart_target.prepare_data_type = ""
				params_chart_target.instanciator.prepare_data_p2(dataset_filtred, params_chart_target)// -> ko, nb de bordures et couleurs trop élevé
				//2.4.inject into the chart JS config instance the labels & datasets setup above
				var data_type = "data"; var injection_type = "update"
				params_chart_target.instanciator.inject_metadata(chart_to_filter, params_chart_target, data_type, injection_type) // -> ok
			}			
		}



	}





	remove_filter(params_chart, params_charts_target, interaction_type) {
		var filter_array_ref = {};
		for (var i = 0; i < params_charts_target.length; i++) {
			var params_chart_target = params_charts_target[i]
			params_chart.status_chart = 'active'; params_chart_target.status_chart = 'target';
			//record the status


			//1.CHECK IF THE CURRENT CHART HAS A FILTRED LEGENDS
			var filter_array = {};
			var has_hidden_legends = _.filter(params_chart.chart_instance.legend.legendItems, {"hidden": true});
			if (has_hidden_legends.length > 0) {
				if (params_chart.nb_axis === 2) {
					var active_legends = _.filter(params_chart.chart_instance.legend.legendItems, {"hidden": false})
					var legends_array = _.map(active_legends, (o)=> (o.text) );
					filter_array[params_chart.sub_category_field] = []; filter_array_ref[params_chart.sub_category_field] = [];
					for (var z = 0; z < legends_array.length; z++) {
						filter_array[params_chart.sub_category_field].push(legends_array[z]);
						filter_array_ref[params_chart.sub_category_field].push(legends_array[z])
					}					
				}
			}			


			//to secure the filters triggered by previous selections, we must collect the active slices 
			//of all the charts, except the current target & the chart source
			//to do that, we fill the filter array with the active slices of target charts, except the current target


			for (var a = 0; a < params_charts_target.length; a++) {

				//if the chart is not the current target
				if (params_charts_target[a].status_chart !== 'target') {
					var third_target_chart = params_charts_target[a]

					if (interaction_type === "selection_binding") {
						//check if we have hidden legends
						var has_hidden_legends = _.filter(third_target_chart.chart_instance.legend.legendItems, {"hidden": true}); var list_labels_selected = []

						//if list_labels_segment_single_selected is empty, take list_labels_segments_multiples_selected
						if (third_target_chart.list_labels_segment_single_selected.length === 1) {
							var list_labels_selected = [...third_target_chart.list_labels_segment_single_selected]
						}
						else if (third_target_chart.list_labels_segments_multiples_selected.length >= 1) {
							//refilter selected slices according to the values get from the source chart
							var active_slices = _.filter(third_target_chart.list_labels_segments_multiples_selected, 
								item => third_target_chart.chart_instance.data.labels.indexOf(item.category_field) !== -1);
							var list_labels_selected = [...active_slices]	
						}
						//ELSE if the chart has hidden legends, then pick the active ones
						else if (has_hidden_legends.length > 0) {
							if (third_target_chart.nb_axis === 2) {
								var active_legends = _.filter(third_target_chart.chart_instance.legend.legendItems, {"hidden": false})
								/*var list_labels_selected = [{"category_field": third_target_chart.chart_instance.data.labels, 
															"sub_category_field": _.map(active_legends, (o)=> (o.text) )}]*/
								var legends_array = _.map(active_legends, (o)=> (o.text) );
								filter_array[third_target_chart.sub_category_field] = []; filter_array_ref[third_target_chart.sub_category_field] = [];
								for (var z = 0; z < legends_array.length; z++) {
									filter_array[third_target_chart.sub_category_field].push(legends_array[z]);
									filter_array_ref[third_target_chart.sub_category_field].push(legends_array[z]);
								}
								
							}

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
						//check if we have hidden legends
						var has_hidden_legends = _.filter(third_target_chart.chart_instance.legend.legendItems, {"hidden": true}); var list_labels_selected = []

						//if list_labels_segment_single_selected is empty, take list_labels_segments_multiples_selected
						if (third_target_chart.list_labels_segment_single_selected.length === 1) {
							var list_labels_selected = [...third_target_chart.list_labels_segment_single_selected]
						}
						else if (third_target_chart.list_labels_segments_multiples_selected.length >= 1) {
							//refilter selected slices according to the values get from the source chart
							var active_slices = _.filter(third_target_chart.list_labels_segments_multiples_selected, 
								item => third_target_chart.chart_instance.data.labels.indexOf(item.category_field) !== -1);
							var list_labels_selected = [...active_slices]	
						}
						//ELSE if the chart has hidden legends, then pick the active ones
						else if (has_hidden_legends.length > 0) {
							if (third_target_chart.nb_axis === 2) {
								var active_legends = _.filter(third_target_chart.chart_instance.legend.legendItems, {"hidden": false})
								/*var list_labels_selected = [{"category_field": third_target_chart.chart_instance.data.labels, 
															"sub_category_field": _.map(active_legends, (o)=> (o.text) )}]*/
								var legends_array = _.map(active_legends, (o)=> (o.text) );
								filter_array[third_target_chart.sub_category_field] = []; filter_array_ref[third_target_chart.sub_category_field] = [];
								for (var z = 0; z < legends_array.length; z++) {
									filter_array[third_target_chart.sub_category_field].push(legends_array[z]);
									filter_array_ref[third_target_chart.sub_category_field].push(legends_array[z]);
								}
								
							}

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
					
					
				}
			}






			//remove the filters no longer activ from the dataset of the target chart
			var ind_filtering_type = "remove_filter"
			crossfilter_rm(params_chart, params_chart_target, filter_array, ind_filtering_type)

			params_chart_target.status_chart = ''

		}





		//refilter the target charts if one of their foreign filtering axis is outdated regarding to the last filter_array axis
		//delete filter_array_ref[""]
		//operations;

		for (var y = 0; y < params_charts_target.length; y++) {
			//1.collect for each target chart it's foreign filtering axis (params_chart.filtered_by.axis)
			var target_chart = params_charts_target[y]
			var keys_values_params_barChart = _.mapKeys(target_chart.filtered_by.axis, function(value, key) {
  				return key;
			});
			var keys_params_barChart = Object.keys(keys_values_params_barChart); keys_params_barChart = keys_params_barChart.filter(o=> o !== "")


			//2.compare the values of each of these axis with the last version of filter_array
			//2.1.get the differences between the 2 arrays

			//--------------------------------------------------ramda method to get differences from 2 objects
			var oldState = target_chart.filtered_by.axis;
			var newState = filter_array_ref;

			var keysObj = R.keys(newState);	

			var filterFunc = key => {
			  var value = R.eqProps(key,oldState,newState)
			  return {[key]:value}
			};

			//function that compares the first set of filtering values and the last set
			//return 'false' if there is differences
			var resultCompare = R.map(filterFunc, keysObj);
			//--------------------------------------------------end
			
			//2.2.filter the resultCompare array to locate the axis which has differences
			for (var w = 0; w < keys_params_barChart.length; w++) {
				
				var field = keys_params_barChart[w]
				var diff = _.filter(resultCompare, {[field]: false})
				//2.3.if the value stored in the filter_array_ref (last record) is different from the source (first record, in params_chart.filtered_by.axis), replace it
				if (diff.length > 0) {
					//replace the original value by the last uptodate
					Object.assign(keys_values_params_barChart[field] , filter_array_ref[field]);
					//filter the empty var
					keys_values_params_barChart[field] = keys_values_params_barChart[field].filter(o=> typeof(o) !== "object"); var refilter_array = {};
					//transfert the filtering axis to a specifi dict
					Object.assign(refilter_array, keys_values_params_barChart)
					//indicate the refiltering need
					var ind_refilter = true
				}
			}			


			//4.crossfilter the chart
			if (ind_refilter === true) {
				delete refilter_array[""]; var ind_filtering_type = "set_filter"
				crossfilter_rm(target_chart, target_chart, refilter_array, ind_filtering_type)
				//reset the indicator
				ind_refilter = false
			}
		}


		//filter the chart source it self with all the third active slices
		crossfilter_rm(params_chart, params_chart, filter_array_ref, ind_filtering_type)


		function crossfilter_rm(params_chart, params_chart_target, filter_array, ind_filtering_type) {

			var dataset_filtred = crossfilter_master(params_chart, params_chart_target, filter_array, ind_filtering_type);

			//0.get the instance of the chart to filter
			var chart_to_filter = params_chart_target.chart_instance;
			
			//2.prepare the structure of the datasets and labels to be injected into chart JS config instance
			//2.1.reset the existing labels & datasets in the param array & the config chart JS instance 
			params_chart_target.data[0].labels = []; params_chart_target.data[1].datasets = [];
			chart_to_filter.config.data.labels = []; 
			for (var ii = 0; ii < chart_to_filter.config.data.datasets.length; ii++) {
				chart_to_filter.config.data.datasets[ii].data = []; chart_to_filter.config.data.datasets[ii].label = [];
				chart_to_filter.config.data.datasets[ii].backgroundColor = []; chart_to_filter.config.data.datasets[ii].borderColor = [];
				chart_to_filter.config.data.datasets[ii].borderWidth = [];
			}
				
			
			//2.3.update de params array of the targeted chart with the filtred dataset
			/*2.1.if the trageted chart has already a selection, indicate to the data processing function to preserve the background color of 
			previous selection*/
			if (params_chart_target.list_labels_segment_single_selected.length !== 0 || params_chart_target.list_labels_segments_multiples_selected.length !== 0 ) {

				params_chart_target.prepare_data_type = "preserve backgroundColor"
				params_chart_target.instanciator.prepare_data_p2(dataset_filtred, params_chart_target)// -> ko, nb de bordures et couleurs trop élevé
				var data_type = "data"; var injection_type = "update"
				params_chart_target.instanciator.inject_metadata(chart_to_filter, params_chart_target, data_type, injection_type) // -> ok
				params_chart_target.prepare_data_type = ""


			}
			else {
				params_chart_target.prepare_data_type = ""
				params_chart_target.instanciator.prepare_data_p2(dataset_filtred, params_chart_target)// -> ko, nb de bordures et couleurs trop élevé
				//2.4.inject into the chart JS config instance the labels & datasets setup above
				var data_type = "data"; var injection_type = "update"
				params_chart_target.instanciator.inject_metadata(chart_to_filter, params_chart_target, data_type, injection_type) // -> ok
			}



		}

		params_chart.status_chart = ''

	}





}



class Tchat {

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
tchat.messages.push('hello')



// params_bar1 = new param2_customSpec_BarChartsJS()

/*mobx.autorun(function() {
	try{
		setTimeout(()=> console.log('voici le new clic: ' + params_bar1.list_idx_segment_single_selected.join(", ")), 100)
	}
	catch{
		console.log("array to observe not ready")
	}
})*/
