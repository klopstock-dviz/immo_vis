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
/*	constructor() {
	}*/


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

	/*					filter_array = [{category_field: "06029"}]*/

						params_chart.status_chart = 'active';
						//filter the data of the targeted charts
						for (var i = 0; i < params_charts_target.length; i++) {
							params_chart_target = params_charts_target[i]
							params_chart_target.status_chart = 'target';
							
							//fill the filter dict with the slice(s) selected in the current chart
							filter_array = {};
							for (var j = 0; j < params_chart.list_labels_segment_single_selected.length; j++) {
								var list_labels = params_chart.list_labels_segment_single_selected[j]
								//deal with the case when the source chart has 1 axis
								if (Object.keys(list_labels).length === 1) {
									filter_array[params_chart.category_field] = [list_labels.category_field]
								}
								//deal with the case when the source chart has 2 axis
								else if (Object.keys(list_labels).length === 2) {
									filter_array[params_chart.category_field] = [list_labels.category_field];
									filter_array[params_chart.sub_category_field] = [list_labels.sub_category_field]
								}								
							}




							/*in order to preserve previous interactions, collect the slices selected in the third target charts (not the current target)
							only if these slices does not compose the axis of the current target chart*/
							for (var a = 0; a < params_charts_target.length; a++) {

								//if the chart is not the current target
								/*if (params_charts_target[a].status_chart !== 'target') {*/
									var third_target_chart = params_charts_target[a]
									//collect it's label
									var label_segment = third_target_chart.list_labels_segment_single_selected[0]
									//if the label field is not undefined
									if (label_segment !== undefined) {
										//dealing with the case of multiple categories for the chart
										var axis_third_target = third_target_chart.list_of_axis; var axis_current_target = params_chart_target.list_of_axis

										if (third_target_chart.nb_axis === 1) {
											//collect if the slice does not compose the axis of the current target chart
											//get the non shared axis
											var diff_axis = axis_third_target.filter(x => !axis_current_target.includes(x));
											//push into the filter the non shared axis
											for (var b = 0; b < diff_axis.length; b++) {
												filter_array[diff_axis[b]] = [third_target_chart.list_keys_values_segment_single_selected[0][diff_axis[b]]]
											}
												
	
										}
										else if (third_target_chart.nb_axis === 2) {
/*											if (third_target_chart.category_field !== params_chart_target.category_field) {
												filter_array[third_target_chart.category_field] = [third_target_chart.list_labels_segment_single_selected[0].category_field];
												filter_array[third_target_chart.sub_category_field] = [third_target_chart.list_labels_segment_single_selected[0].sub_category_field];
											}*/
											var diff_axis = axis_third_target.filter(x => !axis_current_target.includes(x));
											//push into the filter the non shared axis
											for (var b = 0; b < diff_axis.length; b++) {
												filter_array[diff_axis[b]] = [third_target_chart.list_keys_values_segment_single_selected[0][diff_axis[b]]]
											}

										}
									}
								/*}*/
								
								//if the chart is the current target, preserve it's filters, except the case when one of these filters is regenerated by the source chart
/*								else if (params_charts_target[a].status_chart === 'target') {
									var current_target_chart = params_charts_target[a]

									//assign only the regenerated filter
									var filters_current_source = Object.keys(filter_array); 
									var filters_current_target;
									if (current_target_chart.filtered_by.axis !== undefined) {
										filters_current_target = Object.keys(current_target_chart.filtered_by.axis);
									
										//push into the filter the non shared axis
										for (var b = 0; b < filters_current_target.length; b++) {
											var filter_current_target = filters_current_target[b];
											var filter_is_included = filters_current_source.includes(filter_current_target)

											//if the filter in the current target chart is not included in the filter array (chart source), include it
											if (filter_is_included === false) {
												var key = filter_current_target;
												var value = current_target_chart.filtered_by.axis[filter_current_target];
												var current_key_value =  {[key]: [value[0]]}
												Object.assign(filter_array, current_key_value)											
											}

										}
									}

								}*/

							}





						
							var ind_filtering_type = "set_filter"
							var dataset_filtred = crossfilter_master(params_chart, params_chart_target, filter_array, ind_filtering_type)
							/*dataset_filtred = crossfilter(params_chart_target,dataset_to_filter, filter_array) //-> ok*/

							//update the targeted chart with the filtred data
							//1.get the instance of the chart to filter
							/*var chart_to_filter = params_chart.interactions[0].elements_to_filter[0]*/
							var chart_to_filter = params_chart_target.chart_instance;

							//2.prepare the structure of the datasets and labels to be injected into chart JS config instance
							//2.2.reset the existing labels & datasets in the param array & the config chart JS instance 
							params_chart_target.data[0].labels = []; params_chart_target.data[1].datasets = [];
							chart_to_filter.config.data.labels = []; chart_to_filter.config.data.datasets = []

							//2.3.update de params array of the targeted chart with the filtred dataset
							/*2.1.if the trageted chart has already a selection, indicate to the data processing function to preserve the background color of 
							previous selection*/
							if (params_chart_target.list_labels_segment_single_selected.length !== 0) {

								params_chart_target.prepare_data_type = "preserve backgroundColor"
							}
							else {
								params_chart_target.prepare_data_type = ""
							}

							params_chart_target.instanciator.prepare_data(dataset_filtred, params_chart_target)// -> ko, nb de bordures et couleurs trop élevé

							//2.4.inject into the chart JS config instance the labels & datasets setup above
							var data_type = "data"
							params_chart_target.instanciator.inject_metadata(chart_to_filter, params_chart_target, data_type) // -> ok

							params_chart_target.status_chart = '';
						}

	/*					elements_to_filter = params_chart.interactions[0].elements_to_filter[0]*/



						params_chart.interactions[0].elements_to_filter[0] = params_chart.interactions[0].elements_to_filter[0]+1
						

						//indiquer le résultat de l'action
						console.log('nwe value elements_to_filter: ' + elements_to_filter)

						id_previous_singleSelect = params_chart.list_idx_segment_single_selected.join()
						params_chart.status_chart = ''
					}

					//if the selection is released, reset the chart whith it's original data
					else if (id_current_singleSelect === "") {
						for (var i = 0; i < params_charts_target.length; i++) {
							params_chart_target = params_charts_target[i]
							params_chart.status_chart = 'active'; params_chart_target.status_chart = 'target';
							//record the status

							//0.get the instance of the chart to filter
							var chart_to_filter = params_chart_target.chart_instance;

							//1.call the stored raw data source
							var data_source_raw = params_chart_target.data_source_raw


							/*to secure the filters triggered by previous selections, we must collect the active slices 
							of all the charts, except the current target & the chart source
							to do that, we fill the filter array with the active slices of target charts, except the current target*/
							var filter_array = {};
							for (var a = 0; a < params_charts_target.length; a++) {

								//if the chart is not the current target
								if (params_charts_target[a].status_chart !== 'target') {
									var third_target_chart = params_charts_target[a]
									//collect it's label
									var label_segment = third_target_chart.list_labels_segment_single_selected[0]
									//if the label field is not undefined
									if (label_segment !== undefined) {
										//dealing with the case of multiple categories for the chart
										if (third_target_chart.nb_axis === 1) {											
											filter_array[third_target_chart.category_field] = [third_target_chart.list_labels_segment_single_selected[0].category_field];
											/*filter_array = [...third_target_chart.list_labels_segment_single_selected]*/
										}
										else if (third_target_chart.nb_axis === 2) {
											filter_array[third_target_chart.category_field] = [third_target_chart.list_labels_segment_single_selected[0].category_field];
											filter_array[third_target_chart.sub_category_field] = [third_target_chart.list_labels_segment_single_selected[0].sub_category_field];
										}
									}
								}

							}


							//copy form set filter process
/*							filter_array = {};
							for (var j = 0; j < params_chart.list_labels_segment_single_selected.length; j++) {
								var list_labels = params_chart.list_labels_segment_single_selected[j]
								//deal with the case when the source chart has 1 axis
								if (Object.keys(list_labels).length === 1) {
									filter_array[params_chart.category_field] = [list_labels.category_field]
								}
								//deal with the case when the source chart has 2 axis
								else if (Object.keys(list_labels).length === 2) {
									filter_array[params_chart.category_field] = [list_labels.category_field];
									filter_array[params_chart.sub_category_field] = [list_labels.sub_category_field]
								}								
							}*/


							

							//remove the filters no longer activ from the dataset of the target chart
							var ind_filtering_type = "remove_filter"
							var dataset_filtred = crossfilter_master(params_chart, params_chart_target, filter_array, ind_filtering_type)

							//2.prepare the structure of the datasets and labels to be injected into chart JS config instance
							//2.1.reset the existing labels & datasets in the param array & the config chart JS instance 
							params_chart_target.data[0].labels = []; params_chart_target.data[1].datasets = [];
							chart_to_filter.config.data.labels = []; chart_to_filter.config.data.datasets = []
							
							//2.2.update de params array of the targeted chart with the filtred dataset
							params_chart_target.instanciator.prepare_data(dataset_filtred, params_chart_target)// -> ko, nb de bordures et couleurs trop élevé

							//2.3.inject into the chart JS config instance the labels & datasets setup above
							var data_type = "data";
							var chart_to_filter = params_chart_target.chart_instance;
							params_chart_target.instanciator.inject_metadata(chart_to_filter, params_chart_target, data_type) // -> ok

							params_chart_target.status_chart = ''

							//3.register the regenerated chart JS instance in the params
							params_chart.interactions[0].elements_to_filter = []
							params_chart.interactions[0].elements_to_filter = [params_chart_target.chart_instance] 
						}

						//register the value of the current index as "previous id"
						id_previous_singleSelect = params_chart.list_idx_segment_single_selected.join()
						params_chart.status_chart = ''


					}
				}

			}
			catch{
				console.log("observer 1 ko")
			}


			//observation clics multiples
			try{


				//declencher si seulement le clic simple n'est pas alimenté
				if (id_previous_singleSelect === "" && id_previous_multiSelect !== id_current_multiSelect) {
					console.log('observer 2 clics multiples:' + params_chart.list_idx_segments_multiples_selected)
					id_previous_multiSelect = params_chart.list_idx_segments_multiples_selected.join()

					//ACTIONS TO TRIGGER
					//1.changer la valeur d'un var représentant l'elem cible à filtrer
					params_chart.interactions[0].elements_to_filter[0] = params_chart.interactions[0].elements_to_filter[0]+1
					var elements_to_filter = params_chart.interactions[0].elements_to_filter[0]

				}
			}
			catch{
				console.log("observer 2 ko")
			}	


			//observation clics legends
			try{

				current_chart = params_chart.chart_instance;

				function collect_active_legends() {
					//collect current legends
					var legends_array=[];
					var limit = current_chart.legend.legendItems.length
					for (var i = 0; i < limit; i++) {
						var status_legend = barChart2.legend.legendItems[i].hidden
						//collect all non hidden slices to push them into the filter array
						if (status_legend === false) {
							legends_array.push(current_chart.legend.legendItems[i].text)
						}
					}
					return legends_array
				}

				var legends_array = collect_active_legends()

				if (legends_array !== undefined) {id_current_legend = legends_array.join()}
				
				if (id_previous_legend !== id_current_legend) {
					console.log('legend clicked' + legends_array)
					var legends_array = collect_active_legends()
					if (legends_array !== undefined) {
						id_previous_legend = legends_array.join()
					}

					//ACTIONS TO TRIGGER
					//1.changer la valeur d'un var représentant l'elem cible à filtrer

				}
			}
			catch{
				console.log("observer legends ko")
			}
			

			}
		, 200)
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
