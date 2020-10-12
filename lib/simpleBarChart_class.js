class simple_BarChart {

	constructor(params_barChart) {
		this.id = params_barChart.id
		this.ctx = params_barChart.ctx
	    this.category_field = params_barChart.category_field
	    this.sub_category_field = params_barChart.sub_category_field
	    this.numerical_field = params_barChart.numerical_field
	    this.agg_fieldName = params_barChart.numerical_field_params.agg_fieldName
	    this.title_x_axis = params_barChart.title_x_axis
	    this.title_y_axis = params_barChart.title_y_axis
	    this.label_tooltip = params_barChart.label_tooltip
		this.type = params_barChart.type
	    this.responsive = true
	    this.title = params_barChart.title[0]
	    this.list_segments_selected = []
	    this.nb_categories = 0
	    this.nb_sous_categories = 0


	}

	createChart(params_barChart, sharedParams, data_to_transform) {
		
		var data_filtred = this.prepare_data_p1(params_barChart, sharedParams, data_to_transform)

		this.prepare_data_p2(data_filtred, params_barChart, sharedParams)

		//if (params_barChart.instanciator === undefined) {
			var chart_instance = this.init_chart(params_barChart)
		//}

		var _thisClass = this
		if (params_barChart.interactions_chart_options.hoverOptions === true) { this.add_options_hover(chart_instance, params_barChart) }
		if (params_barChart.interactions_chart_options.selectionOptions === true) { this.addListeners(params_barChart.ctx, chart_instance, params_barChart, _thisClass) }



		params_barChart.instanciator = this
		params_barChart.chart_type = "chartJS"

		//add params chart to shared params if no present
		if (sharedParams.params_charts.includes(params_barChart) === false) {
			sharedParams.params_charts.push(params_barChart)
		}
	}
	

	updateChart(params_barChart, sharedParams) {
		var data_filtred = this.prepare_data_p1(params_barChart, sharedParams)

		this.prepare_data_p2(data_filtred, params_barChart, sharedParams)

		var data_type = "data"; var injection_type = "init"
		this.inject_metadata(params_barChart.chart_instance, params_barChart, data_type, injection_type)

	}

	prepare_data_p1(params_chart, sharedParams) {

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


		//data_chuncks.length > 0 ? data_chart = [...data_chuncks] : {}
		







	
	    //zone de regroupements
	    //if one categorical axis, use this groupy method
	    if (params_chart.bin_params.bin === false) {
	        var dataset_ChartJS = [];
	        var agg_name_lodash = params_chart.numerical_field_params.agg_type + "By";
	        var agg_fieldName = params_chart.numerical_field_params.agg_type + "_" + params_chart.numerical_field_params.fieldName
	        params_chart.numerical_field_params.agg_fieldName = agg_fieldName
	        let groupedItem = _.groupBy(data_chart, record => record[params_chart.category_field]);
	        if (params_chart.numerical_field_params.agg_type === "count") {
		        dataset_ChartJS = _.map(groupedItem, (group, key) => {
		          return {
		            [params_chart.category_field]: group[0][params_chart.category_field],
		            [agg_fieldName]: (group.length)
		          };
		        });
	        }
	        else {
		        dataset_ChartJS = _.map(groupedItem, (group, key) => {
		          return {
		            [params_chart.category_field]: group[0][params_chart.category_field],
		            [agg_fieldName]: _[agg_name_lodash](group, params_chart.numerical_field_params.fieldName)
		          };
		        });
		    }
	        //console.log("tps exec lodash: " + (new Date() - d1)/1000)
	        /*console.log('output: ', dataset_ChartJS);*/

	        //trier tableau
	        dataset_ChartJS.sort(trier(params_chart.category_field, 'asc'))
	        //round values
	        dataset_ChartJS = round_values(dataset_ChartJS, agg_fieldName)        
	    }




	    else if (params_chart.bin_params.bin === true) {
	        //to develop
	        //var dataset_ChartJS = main_bin(data_filtred, params_chart)
	    }

	    
	    function round_values(dataset_ChartJS, agg_fieldName) {
	    	for (var d = 0; d < dataset_ChartJS.length; d++) {	        
	            dataset_ChartJS[d][agg_fieldName] = Math.round(dataset_ChartJS[d][agg_fieldName] * 100) / 100
	        };
	        return dataset_ChartJS
	    }


		//decode encoded fields if specified
		if (params_chart.decode === true && params_chart.category_field) {
			if (params_chart.category_field === "INSEE_COM") {
				dataset_ChartJS.map(r=> { 
					var row_ref_insee = ref_insee.filter(o=> o[params_chart.category_field] === r[params_chart.category_field]); 
					r[params_chart.category_field + "_decoded"] = row_ref_insee[0]["LIBCOM"] 
				})
			}
			else if (array_decode_fields.filter(f=> f[params_chart.category_field]).length > 0) {
				var decode_field = array_decode_fields.filter(f=> f[params_chart.category_field])[0][params_chart.category_field]
				dataset_ChartJS.map(r=> r[params_chart.category_field + "_decoded"] = decode_field[r[params_chart.category_field]])
			}
		}
		else {params_chart.decode = false}

	    return dataset_ChartJS

	}


	prepare_data_p2(data_input, params_barChart, sharedParams) {
		/*processus de création d'un nouveau dataset: 
		params_barChart.data[1].datasets.push({"label":0, backgroundColor: 'red', data: [39889, 19889, 14889]})
		répeter l'opération autant de fois qu'il y a de sous-catégories (nb_sous_categories)
		*/			

			params_barChart.nb_axis = 1
			this.category_field = params_barChart.category_field

			if (params_barChart.list_of_axis.length === 0) {params_barChart.list_of_axis.push(this.category_field)}

			//1.obtenir les catégories (les communes par ex)
			var categories = data_input.map(r=> r[this.category_field])
			if (data_input[0].hasOwnProperty(this.category_field + "_decoded")) {
				var categories_decoded = data_input.map(r=> r[this.category_field + "_decoded"])
			}
			var nb_categories = categories.length; 

	        params_barChart.nb_categories = categories.length;
	        params_barChart.activ_categories_values = []; params_barChart.activ_categories_values.push(categories)

			//3.création des catégories dans la spec ChartJS (champ labels dans chartJS)
			if (categories_decoded) {
				params_barChart.data[0].labels.push(categories_decoded)
				params_barChart.data_input = data_input
			}
			else {params_barChart.data[0].labels.push(categories)}
			
			var nb_categories = params_barChart.data[0].labels[0].length


            //4.créer un array borderColor et borderWidth égal à nb_categories
            var borderColorArray = []; 
            var borderWidthArray = [];
            
            for (var i = 0; i < nb_categories; i++) {
            	borderColorArray.push('rgba(230, 11, 11, 0)');
            	borderWidthArray.push(1);

        	}	        


			/*guide création des sous-catégories dans la spec ChartJS
			params_barChart.data[1].datasets.push({"label":data_group[i]['nb_pieces'], backgroundColor: 'red', data: [39889, 19889, 14889]})*/
	        
			//changements pour passer au simple bar chart
			//if we initialize the backgroundColorArray for the first time, make a random select from the repository of colors        
			if (params_barChart.backgroundColorArray_source["category_field"] !== params_barChart.category_field) { // && Object.keys(params_barChart.backgroundColorArray_source).length === 0
        		var i = 0

        		//reset the backgroundColorArray_source
        		params_barChart.backgroundColorArray_source = {};
        		params_barChart.backgroundColorArray_source["category_field"] = params_barChart.category_field
        		function select_generated_color(backgroundColorArray_source, i) { return backgroundColorArray_source[i]}

				var status_colors = "empty";
				var colored_axis = params_barChart.category_field
        		if (sharedParams.used_color_schemes.hasOwnProperty(colored_axis) === true) {
	        		var backgroundColorArray_source = generateColors(nb_categories, sharedParams.used_color_schemes[colored_axis], params_barChart.colorsConfig.colorsOrder, colored_axis, sharedParams)
					categories.map(axis => {
						params_barChart.backgroundColorArray_source[axis] = select_generated_color(backgroundColorArray_source, i); 
						i++
						} )
        		}
        		else {
	        		var backgroundColorArray_source = generateColors(nb_categories, params_barChart.colorsConfig.scheme, params_barChart.colorsConfig.colorsOrder, colored_axis, sharedParams)
					categories.map(axis => {
						params_barChart.backgroundColorArray_source[axis] = select_generated_color(backgroundColorArray_source, i); 
						i++
						} )
        		}
			}



			//créer les datasets composés des categories, du champ numérique à représenter, des couleurs des barres et leur bordure
			var data_array = []; var backgroundColorArray = []; 			
	        for (var i = 0; i < nb_categories; i++) {

	        	//2.récupérer l'array contenant les data associées à la sous-catégorie
	            //2.2.récupérer l'array contenant les data	            
	            data_array.push(data_input[i][params_barChart.numerical_field_params.agg_fieldName]);

	            //3.construie l'array contenant les couleurs des barres
		        backgroundColorArray.push(params_barChart.backgroundColorArray_source[categories[i]])

	        };


			//if the chart is already clicked, preserve the deactivated slices and maintain they color effect (grey or lower opacity)
            if (params_barChart.prepare_data_type === "preserve backgroundColor" && params_barChart.active_slices.length > 0) {
            	backgroundColorArray = [];

				if (params_barChart.data_input) {
					var array_labels = params_barChart.data_input.map(r=> r[params_barChart.category_field])
				}
				else {var array_labels = params_barChart.data[0].labels[0]}

		            	
            	var active_category_fields = [];
            	for (var c = 0; c < params_barChart.active_slices.length; c++) {
            		active_category_fields.push(params_barChart.active_slices[c].category_field)
            	}

            	//1.collecte the category_field value & background color of the active slice
            	for (var a = 0; a < params_barChart.active_slices.length; a++) {

	            	var active_category_field = params_barChart.active_slices[a].category_field


	            	//2.collecte the position of the active_category_field in the filtred array of labels
	            	
	            	var pos_active_category_field = array_labels.indexOf(active_category_field)


	            	//3.add grey backgroundColor to the slices, except the active slice setup above
	            	for (var i = 0; i < array_labels.length; i++) {
	            		//if the label looped is not in the array of active labels, set it's background color to grey
	            		pos_active_category_field = active_category_fields.indexOf(array_labels[i])
	            		if (pos_active_category_field === -1) {
		            		backgroundColorArray.push('rgba(240, 240, 240, 0.5)');
	    				}
	    				else {
	            			var active_slice_backgroundColor = params_barChart.active_slices[pos_active_category_field].backgroundColor	    					
	    					backgroundColorArray.push(active_slice_backgroundColor);
	    				}
	            	}
	            }
            }



            //4.création des sous-catégories (champ label), data associée (champ data dans ChartJS) et couleurs et bordures dans la spec ChartJS 
            params_barChart.data[1].datasets.push({label: this.label_tooltip, backgroundColor: backgroundColorArray, borderWidth: borderWidthArray, 
            	borderColor: borderColorArray, data: data_array})

        params_barChart.list_idx_segments_existants = [];
		var list_idx_segments_existants = params_barChart.list_idx_segments_existants                    		
        //1.collecter les clés de tous les segments existants
		for (var i = 0; i < (nb_categories); i++) {
			list_idx_segments_existants.push(i)			
		}

		//.sauvegarder une image des données source avant transformation
		if (params_barChart.data_source_raw.length === 0) {
			params_barChart.data_source_raw = data_input
			params_barChart.data_source[0].labels.push(categories)
	        params_barChart.data_source[1].datasets = params_barChart.data[1].datasets

	    }		

	}


	init_chart(params_barChart) {		
		var barChart = new Chart(this.ctx, {
				        type: this.type,
				        data: [],
				        options: {
				            responsive: this.responsive,		
				            title: this.title,
			                scales: {
			                    yAxes: [{
			                        ticks: {
			                            beginAtZero: true
			                        }
			                    ,scaleLabel: {
							        display: true,
							        labelString: this.title_y_axis
							      }
							     }],

			                    xAxes: [{
			                     scaleLabel: {
							        display: true,
							        labelString: this.title_x_axis
							      }
							     }]

			                },
			                
			                animation: {
			                        duration: 1000,
			                        easing: 'easeOutQuad'
			                },
			             /*    tooltips: {
			                    mode: 'label'
			                },*/
		                    legend: {
		                          display: false
		                          }

				        }
				      });


		//alimenter avec les labels ET LES DATASETS
		var data_type = "data"; var injection_type = "init"
		this.inject_metadata(barChart, params_barChart, data_type, injection_type)

		return barChart 				
	}



	inject_metadata(barChart, params_barChart, data_type, injection_type) {
		//alimenter avec les labels
		if (barChart.config.data.labels.length === 0) {
			barChart.config.data.labels = [...params_barChart[data_type][0].labels[0]]
		}



		//alimenter avec les datasets
		if (injection_type === "init") {
			var l = params_barChart[data_type][1].datasets.length;
			var datasets = [];
			for (var i = 0; i < l; i++) {
				datasets.push(params_barChart[data_type][1].datasets[i])
				barChart.config.data.datasets[i] = _.cloneDeep(datasets[i])
			}
			barChart.config.data.datasets = _.cloneDeep(datasets)
		}
		else if (injection_type === "update") {
			var l = params_barChart[data_type][1].datasets.length;
			var datasets = [];
			for (var i = 0; i < l; i++) {
				datasets.push(params_barChart[data_type][1].datasets[i])
				barChart.config.data.datasets[i].data = _.cloneDeep(datasets[i].data)
				barChart.config.data.datasets[i].label = _.cloneDeep(datasets[i].label)
				barChart.config.data.datasets[i].backgroundColor = _.cloneDeep(datasets[i].backgroundColor)
				barChart.config.data.datasets[i].borderColor = _.cloneDeep(datasets[i].borderColor)
				barChart.config.data.datasets[i].borderWidth = _.cloneDeep(datasets[i].borderWidth)
			}

		}

		

		barChart.update(500)


		//register the chart instance in the param array
		params_barChart.chart_instance = barChart

		

		return barChart
	}





	maj_couleurs(barChart, params_barChart) {
		//on entre dans cette func pour enlever le focus posé sur les segments

		var nb_categories = params_barChart.nb_categories;
		var backgroundColorArray = [];

		/*//parcours catégories
		for (var i = 0; i < nb_categories; i++) {		
			
				var backgroundColor = params_barChart.data[1].datasets[0].backgroundColor[i];
				barChart.config.data.datasets[0].backgroundColor[i] = backgroundColor;
			}
		*/
		var i=0; 
		if (params_barChart.data_input) {
			var array_labels = params_barChart.data_input.map(r=> r[params_barChart.category_field])
		}
		else {var array_labels = barChart.data.labels}
	
		Object.keys(params_barChart.backgroundColorArray_source).map(k=> { 
			if (array_labels.includes(k)) {
				barChart.data.datasets[0].backgroundColor[i] = params_barChart.backgroundColorArray_source[k] 
			}; 
			i++ 
		})			
		barChart.update();
	}

	reset_border_color(this_chart, params_barChart_deepCopy) {
		/*console.log("entree_zone_blanche"); console.log(this_chart); console.log(params_barChart_deepCopy);*/

		//remettre config sans bordures
		var nb_categories = params_barChart_deepCopy.nb_categories;

		//parcours catégories
		for (var i = 0; i < nb_categories; i++) {
			this_chart.config.data.datasets[0].borderColor[i] = "rgba(230, 11, 11, 0)";			
		}

		this_chart.update();
	}







	add_options_hover(this_chart, params_barChart_deepCopy) {
			var activePoints
			this_chart.config.options.hover = {
	                onHover: function(e) {
	                     var point = this_chart.getElementAtEvent(e);
	                     if (point.length) {
	                        //transformer curseur en pointeur
	                     	e.target.style.cursor = 'pointer'; 

	                     	//effacer les bordures précédantes
	                     	this_chart.update();

	                        //si survol d'un segment, mettre bordure rouge sur élément survolé
	                        activePoints = this_chart.getElementAtEvent(e);                        
	                        if (activePoints[0]) {
	                            //relever l'index de l'élément survolé                    
	                            var idx = activePoints[0]['_index'];
								var datasetIdx = activePoints[0]['_datasetIndex'];

								//collecter la couleur du segment
								var activePoint_backgroundColor = activePoints[0]._model.backgroundColor;
								
								//augmenter l'opacité de la bordure
								activePoints[0]._model.borderColor = "rgba(230, 11, 11, 1)";
								params_barChart_deepCopy.border_activated = true
								
								//augmenter l'opacité du segment
								activePoint_backgroundColor = activePoint_backgroundColor.replace("0.65", "1")
								activePoints[0]._model.backgroundColor = activePoint_backgroundColor;

								var datasetLabel = activePoints[0]._model.datasetLabel;
								var label = activePoints[0]._model.label;

								//test désactivation couleurs segments non selectionnés
								

	                        }

	                     }
	                     else {
	                     	e.target.style.cursor = 'default';

	                     	if (params_barChart_deepCopy.border_activated === true) {
								params_barChart_deepCopy.instanciator.reset_border_color(this_chart, params_barChart_deepCopy)
								params_barChart_deepCopy.border_activated = false
							}

	                     }
	                }
		}
	}	

	addListeners(ctx, this_chart, params_barChart_deepCopy, _thisClass) {

	            //gestion de la bordure en zone blanche
	            ctx.addEventListener("mouseover", function(evt){params_barChart_deepCopy.instanciator.addListenerMouseover(evt, this_chart, params_barChart_deepCopy)});



	            /*this.prototype.addListenerMouseover = function(first_argument) {
	            	// body...
	            };*/
	            

				




	            //collecter le segment cliqué
	            ctx.addEventListener("click", function(evt){
	                var activePoints = this_chart.getElementAtEvent(evt);

	                if (activePoints[0]) {

	                	try {
		                    var idx = activePoints[0]['_index'];
							var datasetIdx = activePoints[0]['_datasetIndex'];
							var key_composite = datasetIdx + "-" + idx

							var categorie = activePoints[0]._model.label;

							//if the decoder param is on, re-encode the field to fill the crossfilter process with the expected value (ex transform 'Appartements' into 'a')
							if (params_barChart_deepCopy.decode && params_barChart_deepCopy.data_input) {
								categorie = params_barChart_deepCopy.data_input.filter(r=> r[params_barChart_deepCopy.category_field + "_decoded"] === categorie)[0][params_barChart_deepCopy.category_field]
							}
							var category_field = params_barChart_deepCopy.category_field;
							var sous_categorie = activePoints[0]._model.datasetLabel;




							//il faut annuler les segments multiples précédemment sélectionnés avant de passer à une sélection unique
							//controler que shift n'a pas été appuyé
							if (evt.ctrlKey === false) {
								params_barChart_deepCopy.list_idx_segments_multiples_selected = []; params_barChart_deepCopy.list_labels_segments_multiples_selected = []
								params_barChart_deepCopy.list_keys_values_segments_multiples_selected = [];
							};

							////il faut annuler le segment unique sélectionné lors sur dernier clic								
							params_barChart_deepCopy.list_labels_segment_single_selected = [];
							params_barChart_deepCopy.list_keys_values_segment_single_selected = [];

							//if clic on the same slice, clean the lists
							if (params_barChart_deepCopy.list_idx_segment_single_selected.includes(idx)) {
								//register the all the categories values to restore the other chart's datasets to the same level than the current chart
								params_barChart_deepCopy.list_labels_segments_multiples_selected.push({category_field: params_barChart_deepCopy.activ_categories_values});
								params_barChart_deepCopy.list_keys_values_segments_multiples_selected.push({[category_field] : params_barChart_deepCopy.activ_categories_values});								
								return								
							}
							else {								
								
								params_barChart_deepCopy.list_labels_segment_single_selected.push({category_field: categorie});
								params_barChart_deepCopy.list_keys_values_segment_single_selected.push({[category_field] : [categorie]});
								//observableSlim
								/*p.changeBar1 = key_composite;*/
								

								//controler que shift n'a pas été appuyé pour éviter des push multiples
								if (evt.ctrlKey === false) {
									params_barChart_deepCopy.list_labels_segments_multiples_selected.push({category_field: categorie});
									params_barChart_deepCopy.list_keys_values_segments_multiples_selected.push({[category_field] : [categorie]});								
								}



			                    console.log("labels collectés:"); console.log(params_barChart_deepCopy.list_labels_segment_single_selected); /*console.log("valeur: " + value)*/
			                  }

		                }
		                catch {
		                	console.log("segment non detecté, clic à l'exterieur du graph")
		                	//observableSlim
		                	/*p.changeBar1 = false;*/
		                	//vider la liste puisqu'on ne sélectionne plus aucun segment
							//vider liste des segments selectionnés

							params_barChart_deepCopy.list_idx_segment_single_selected = [];
							params_barChart_deepCopy.list_labels_segment_single_selected = [];
							params_barChart_deepCopy.list_keys_values_segment_single_selected = [];
							params_barChart_deepCopy.list_keys_values_segment_single_selected = [];
							params_barChart_deepCopy.list_keys_values_segments_multiples_selected = [];
							params_barChart_deepCopy.active_slices = []
		                }    
	                } 
	                //
	                else if (params_barChart_deepCopy.previous_hiearchy) {

	                	if (params_barChart_deepCopy.hierarchy_levels === undefined) {return}

						//form an array from the hiearchy levels
						var arr_hierarchy_levels = Object.values(params_barChart_deepCopy.hierarchy_levels)

						//get the position of the current cat field in the hierachy levels array
						var pos_current = arr_hierarchy_levels.indexOf(params_barChart_deepCopy.category_field)

						//get the upper hiearchy level field & values
						if (Object.keys(params_barChart_deepCopy.previous_hiearchy).includes((pos_current-1).toString()) === false ) {
							console.log("you have reached the first hiearchy level")
							return
						}

						var category_field = params_barChart_deepCopy.hierarchy_levels[pos_current-1]						
						var category_value = params_barChart_deepCopy.previous_hiearchy[pos_current-1].hiearchy_value.flat()
						
						//save the hiararchy value
						params_barChart_deepCopy.category_field = category_field




						//get the data filtred & grouped
						//1.make a copy of the transformation object if it exists
						if (params_barChart_deepCopy.transformations) {var restore_transformations_object = true; params_barChart_deepCopy.transformations_copy = {...params_barChart_deepCopy.transformations} }
						//2.replace its content temporarly
						params_barChart_deepCopy.transformations = {filter: [{field: category_field, operation: "include", values: category_value}]}
						//3.filter the next dataset to be used
						var dataset_filtred = params_barChart_deepCopy.instanciator.prepare_data_p1(params_barChart_deepCopy)
						//4.restore the original transformation object
						if (restore_transformations_object === true) {
							params_barChart_deepCopy.transformations = {...params_barChart_deepCopy.transformations_copy}
						}
						else {params_barChart_deepCopy.transformations = undefined}

						//update the targeted chart with the filtred data
						//1.get the instance of the chart to filter
						var chart_to_filter = params_barChart_deepCopy.chart_instance

						//2.2.reset the existing labels & datasets in the param array & the config chart JS instance 
						params_barChart_deepCopy.data[0].labels = []; params_barChart_deepCopy.data[1].datasets = [];

						chart_to_filter.config.data.labels = []; 
						for (var ii = 0; ii < chart_to_filter.config.data.datasets.length; ii++) {
							chart_to_filter.config.data.datasets[ii].data = []; chart_to_filter.config.data.datasets[ii].label = "";
							chart_to_filter.config.data.datasets[ii].backgroundColor = []; chart_to_filter.config.data.datasets[ii].borderColor = [];
							chart_to_filter.config.data.datasets[ii].borderWidth = [];
						}					
						
						params_barChart_deepCopy.prepare_data_type = ""
						params_barChart_deepCopy.instanciator.prepare_data_p2(dataset_filtred, params_barChart_deepCopy)// -> ko, nb de bordures et couleurs trop élevé
						var data_type = "data"; var injection_type = "update"
						params_barChart_deepCopy.instanciator.inject_metadata(chart_to_filter, params_barChart_deepCopy, data_type, injection_type) // -> ok


						setTimeout(	feed_storeLists(params_barChart_deepCopy), 20)

						function feed_storeLists(params_barChart_deepCopy) {
							params_barChart_deepCopy.list_labels_segment_single_selected = [{category_field: category_value}];
							params_barChart_deepCopy.list_keys_values_segment_single_selected = [{[category_field] : category_value}];
							params_barChart_deepCopy.list_labels_segments_multiples_selected = [{category_field: category_value}];
							params_barChart_deepCopy.list_keys_values_segments_multiples_selected = [{[category_field] : category_value}]

							params_barChart_deepCopy.list_idx_segment_single_selected.push("hierarchy_nav_" + category_field); params_barChart_deepCopy.list_idx_segments_multiples_selected.push("hierarchy_nav_" + category_field)
						}
	                }       

	            });


	            //gestion d'un clic unique sur un segment (pour désactiver les couleurs des segments non selectionnés)
	            ctx.onclick = function(evt) {
	            	
	                var activePoints = this_chart.getElementAtEvent(evt);
	                //si le clic est fait sur un des segments
	                if (activePoints[0]) {
	                    //1.collect color of the slice
						var categorie = activePoints[0]._model.label;

						//if the decoder param is on, re-encode the field to fill the crossfilter process with the expected value (ex transform 'Appartements' into 'a')
						if (params_barChart_deepCopy.decode && params_barChart_deepCopy.data_input) {
							categorie = params_barChart_deepCopy.data_input.filter(r=> r[params_barChart_deepCopy.category_field + "_decoded"] === categorie)[0][params_barChart_deepCopy.category_field]
						}

						var activePoint_backgroundColor = params_barChart_deepCopy.backgroundColorArray_source[categorie]
						//augmenter l'opacité du segment
						if (activePoint_backgroundColor) {activePoint_backgroundColor = activePoint_backgroundColor.replace("0.65", "1")}
						/*else {
							var backgroundColor_array = Object.values(params_barChart_deepCopy.backgroundColorArray_source)
							activePoint_backgroundColor = backgroundColor_array[parseInt(Math.random() * backgroundColor_array.length)].replace("0.65", "1")
						}*/

							


	                	//2.remettre les couleurs d'origine sur tous les segments
		                params_barChart_deepCopy.instanciator.maj_couleurs(this_chart, params_barChart_deepCopy);

	                    var idx = activePoints[0]['_index'];

						//if clic on the same slice, quit
						if (params_barChart_deepCopy.list_idx_segment_single_selected.includes(idx)) {
							params_barChart_deepCopy.list_idx_segment_single_selected = [];
							params_barChart_deepCopy.active_slices = [];
							return
						}


						////il faut annuler le segment unique sélectionné lors sur dernier clic					
						params_barChart_deepCopy.list_idx_segment_single_selected = [];
	                    params_barChart_deepCopy.list_idx_segment_single_selected.push(idx);

						//controler que shift n'a pas été appuyé pour éviter des push multiples
						if (evt.ctrlKey === false) {
	    	                params_barChart_deepCopy.list_idx_segments_multiples_selected.push(idx);//++
							//evo
							params_barChart_deepCopy.active_slices = [];
							params_barChart_deepCopy.active_slices.push({category_field: categorie, backgroundColor: activePoint_backgroundColor, 
								index: idx})

	    	            }


						
						/*console.log("idx: " + idx); console.log("datasetIdx: " + datasetIdx); console.log("id dataset: + key_composite")*/
	                    var chartData = activePoints[0]['_chart'].config.data;                

	                    //parcourir toutes les barres pour les mettre en gris sauf celle cliquée
	                    var nb_categories = params_barChart_deepCopy.nb_categories;
	    
	                        for (var i = 0; i < (nb_categories); i++) {
	                            //si la categorie parcourue n'est pas la catégorie active

	                            		//si on entre dans un segment différent du segment actif, griser la couleur du segment
	                            		if (idx !== i) {
		                            	//la couleur de fond se désactive ainsi pour le 1er segment: bar1.config.data.datasets[0].backgroundColor[0] = 'grey'
		                            		this_chart.config.data.datasets[0].backgroundColor[i] = "rgba(240, 240, 240, 0.5)";
		                                
		                            	}
										else {
											//collecter la couleur du segment											
											

											activePoints[0]._model.backgroundColor = activePoint_backgroundColor;
											this_chart.config.data.datasets[0].backgroundColor[i] = activePoint_backgroundColor;				

										}

	                            	}                            	

	                        //save the colors of the filtred state
							var backgroundColor_array = [];
							for (var i = 0; i < this_chart.config.data.datasets.length; i++) {
								backgroundColor_array.push(this_chart.config.data.datasets[i].backgroundColor)
							};
							params_barChart_deepCopy.backgroundColor_array_ClickedState = backgroundColor_array;

	                        this_chart.update()                    

	                }

	                //remettre les couleurs d'origine lors d'un clic à l'extérieur des barres
	                else {

	                	/*params_barChart_deepCopy.prepare_data_type = "";
	                    params_barChart_deepCopy.instanciator.maj_couleurs(this_chart, params_barChart_deepCopy);
						//vider liste des segments selectionnés
						
						
						params_barChart_deepCopy.list_idx_segments_multiples_selected = [];
						params_barChart_deepCopy.list_labels_segments_multiples_selected = [];												
						params_barChart_deepCopy.list_idx_segment_single_selected = [];
						params_barChart_deepCopy.list_labels_segment_single_selected = [];
						params_barChart_deepCopy.list_keys_values_segment_single_selected = [];						
						params_barChart_deepCopy.list_keys_values_segments_multiples_selected = [];
						params_barChart_deepCopy.active_slices = []*/
	                }
	            }





	            //rés-activer les couleurs de tous les segments
	            ctx.ondblclick = function(evt) {
	            	var activePoints = this_chart.getElementAtEvent(evt);
	            	if (activePoints[0]) {
	            		//get the data references of selected slice
						var category_field = params_barChart_deepCopy.category_field;

		                var activePoints = this_chart.getElementAtEvent(evt);
	                    var idx = activePoints[0]['_index'];
						var category = activePoints[0]._model.label;

						//if the decoder param is on, re-encode the field to fill the crossfilter process with the expected value (ex transform 'Appartements' into 'a')
						if (params_barChart_deepCopy.decode && params_barChart_deepCopy.data_input) {
							category = params_barChart_deepCopy.data_input.filter(r=> r[params_barChart_deepCopy.category_field + "_decoded"] === category)[0][params_barChart_deepCopy.category_field]
						}						

						//check if this is the last hierarchy level

						//get the last hierarchy level
						var array_hierarchy_levels = Object.values(params_barChart_deepCopy.hierarchy_levels); var last_hierarchy_level = array_hierarchy_levels[array_hierarchy_levels.length-1]
						if (last_hierarchy_level === category_field) {
							console.log("you have reached the last hierarchy level")
							return
						}
							

						//regenerate store lists
							params_barChart_deepCopy.list_idx_segments_multiples_selected = []; params_barChart_deepCopy.list_labels_segments_multiples_selected = [];												
							params_barChart_deepCopy.list_idx_segment_single_selected = []; params_barChart_deepCopy.list_labels_segment_single_selected = [];					
							params_barChart_deepCopy.list_keys_values_segment_single_selected = []; params_barChart_deepCopy.list_keys_values_segments_multiples_selected = [];
							params_barChart_deepCopy.active_slices = []

							params_barChart_deepCopy.list_labels_segment_single_selected.push({category_field: category});
							params_barChart_deepCopy.list_keys_values_segment_single_selected.push({[category_field] : [category]});
							params_barChart_deepCopy.list_labels_segments_multiples_selected.push({category_field: category});
							params_barChart_deepCopy.list_keys_values_segments_multiples_selected.push({[category_field] : [category]});								

							params_barChart_deepCopy.list_idx_segment_single_selected.push(idx); params_barChart_deepCopy.list_idx_segments_multiples_selected.push(idx)

						//save the hiararchy value							
							//1.form an array from the hiearchy levels & get the position of the current cat field in the hierachy levels array
							var pos_current = Object.values(params_barChart_deepCopy.hierarchy_levels).indexOf(category_field)						
							params_barChart_deepCopy.previous_hiearchy[pos_current] = {hiearchy_level: pos_current, hiearchy_field: category_field, hiearchy_value: params_barChart_deepCopy.activ_categories_values.flat()}




						//collect the rank of the current category field in the hierarchy fields object
						var pos_active_category_field = Object.values(params_barChart_deepCopy.hierarchy_levels).indexOf(params_barChart_deepCopy.category_field)

						//set next cat field
						pos_active_category_field++; 
						params_barChart_deepCopy.category_field = params_barChart_deepCopy.hierarchy_levels[pos_active_category_field++]


						

						//get the data filtred & grouped
						//1.make a copy of the transformation object if it exists
						if (params_barChart_deepCopy.transformations) {var restore_transformations_object = true; params_barChart_deepCopy.transformations_copy = {...params_barChart_deepCopy.transformations} }
						//2.replace its content temporarly
						params_barChart_deepCopy.transformations = {filter: [{field: category_field, operation: "include", values: [category]}]}
						//3.filter the next dataset to be used
						var dataset_filtred = params_barChart_deepCopy.instanciator.prepare_data_p1(params_barChart_deepCopy)
						//4.restore the original transformation object
						if (restore_transformations_object === true) {
							params_barChart_deepCopy.transformations = {...params_barChart_deepCopy.transformations_copy}
						}
						else {params_barChart_deepCopy.transformations = undefined}

						//update the targeted chart with the filtred data
						//1.get the instance of the chart to filter
						var chart_to_filter = params_barChart_deepCopy.chart_instance

						//2.2.reset the existing labels & datasets in the param array & the config chart JS instance 
						params_barChart_deepCopy.data[0].labels = []; params_barChart_deepCopy.data[1].datasets = [];

						chart_to_filter.config.data.labels = []; 
						for (var ii = 0; ii < chart_to_filter.config.data.datasets.length; ii++) {
							chart_to_filter.config.data.datasets[ii].data = []; chart_to_filter.config.data.datasets[ii].label = "";
							chart_to_filter.config.data.datasets[ii].backgroundColor = []; chart_to_filter.config.data.datasets[ii].borderColor = [];
							chart_to_filter.config.data.datasets[ii].borderWidth = [];
						}					
						
						params_barChart_deepCopy.prepare_data_type = ""
						params_barChart_deepCopy.instanciator.prepare_data_p2(dataset_filtred, params_barChart_deepCopy)// -> ko, nb de bordures et couleurs trop élevé
						var data_type = "data"; var injection_type = "update"
						params_barChart_deepCopy.instanciator.inject_metadata(chart_to_filter, params_barChart_deepCopy, data_type, injection_type) // -> ok

						

						//re init store lists
						setTimeout(	re_init_storeLists(params_barChart_deepCopy), 1500)

						function re_init_storeLists(params_barChart_deepCopy) {
							var category_field = params_barChart_deepCopy.category_field
							params_barChart_deepCopy.list_labels_segments_multiples_selected = [];	params_barChart_deepCopy.list_labels_segment_single_selected = [];					
							params_barChart_deepCopy.list_keys_values_segment_single_selected = []; params_barChart_deepCopy.list_keys_values_segments_multiples_selected = [];
							
							params_barChart_deepCopy.list_labels_segment_single_selected.push({category_field: params_barChart_deepCopy.activ_categories_values.flat()});
							params_barChart_deepCopy.list_keys_values_segment_single_selected.push({[category_field] : params_barChart_deepCopy.activ_categories_values.flat()});
							params_barChart_deepCopy.list_labels_segments_multiples_selected.push({category_field: params_barChart_deepCopy.activ_categories_values.flat()});
							params_barChart_deepCopy.list_keys_values_segments_multiples_selected.push({[category_field] : params_barChart_deepCopy.activ_categories_values.flat()}); 
						}
					}
	            };
	     


		      /*gestion d'un clic + shift sur plusiers segments (pour désactiver les couleurs des segments non selectionnés)*/
		      ctx.addEventListener("click",
		        function(e) {
		          var activePoints = this_chart.getElementAtEvent(e);
		          if (e.ctrlKey && activePoints) {
		                    console.log("Shift, yay!");
							//1.collect the backgroundcolor of the slice
							var activePoint_backgroundColor = activePoints[0]._model.backgroundColor;
							//augmenter l'opacité du segment
							activePoint_backgroundColor = activePoint_backgroundColor.replace("0.65", "1")

		                	//2.remettre les couleurs d'origine sur tous les segments
			                params_barChart_deepCopy.instanciator.maj_couleurs(this_chart, params_barChart_deepCopy);
		                    
		                    var idx = activePoints[0]['_index'];
							
							var categorie = activePoints[0]._model.label;

							//if the decoder param is on, re-encode the field to fill the crossfilter process with the expected value (ex transform 'Appartements' into 'a')
							if (params_barChart_deepCopy.decode && params_barChart_deepCopy.data_input) {
								categorie = params_barChart_deepCopy.data_input.filter(r=> r[params_barChart_deepCopy.category_field + "_decoded"] === categorie)[0][params_barChart_deepCopy.category_field]
							}							
							var category_field = params_barChart_deepCopy.category_field;



							var list_idx_segments_existants = params_barChart_deepCopy.list_idx_segments_existants

							//vider les listes alimentées par un clic unique
							params_barChart_deepCopy.list_idx_segment_single_selected = []; params_barChart_deepCopy.list_labels_segment_single_selected = [];



							//refresh the lists fed by clic+shift
							//1.if the slice selected is not in the current lists, push it
							var pos_slice = params_barChart_deepCopy.list_idx_segments_multiples_selected.indexOf(idx);
							if (pos_slice === -1) {
								//register the activated slices
			                    params_barChart_deepCopy.list_idx_segments_multiples_selected.push(idx);
			                    params_barChart_deepCopy.list_labels_segments_multiples_selected.push({"category_field": categorie})
			                    params_barChart_deepCopy.list_keys_values_segments_multiples_selected.push({[category_field] : [categorie]});
								//register in the params_chart the active category & it's background color
								params_barChart_deepCopy.active_slices.push({category_field: categorie, backgroundColor: activePoint_backgroundColor, index: idx});

							}
							//2.delete selected slice from the diffent arrays
							else {
								params_barChart_deepCopy.list_idx_segments_multiples_selected.splice(pos_slice, 1)

								var index_cat = params_barChart_deepCopy.list_labels_segments_multiples_selected.findIndex(x => x.category_field === categorie);
								params_barChart_deepCopy.list_labels_segments_multiples_selected.splice(index_cat, 1)

								var index_cat = params_barChart_deepCopy.list_keys_values_segments_multiples_selected.findIndex(x => x[category_field][0] === categorie);
								params_barChart_deepCopy.list_keys_values_segments_multiples_selected.splice(index_cat, 1)

								var index_cat = params_barChart_deepCopy.active_slices.findIndex(x => x.category_field === categorie);
								params_barChart_deepCopy.active_slices.splice(index_cat, 1)
							}





		                    //observableSlim
		                    /*p.changeBar1 = false;*/
		                    var chartData = activePoints[0]['_chart'].config.data;
		             

		                    //parcourir toutes les barres pour les mettre en gris sauf celles cliquées
		                    var nb_segments_existants = params_barChart_deepCopy.list_idx_segments_existants.length;
		                    var nb_categories = params_barChart_deepCopy.nb_categories;							


							//v2
							//var activ_categories_values = params_barChart_deepCopy.active_slices.map(o=> o.category_field)
							//turn all slices into grey color
		                    var nb_segments_existants = this_chart.data.labels.length
		                    var activ_idx_values = params_barChart_deepCopy.active_slices.map(o=> o.index)
		                    for (var i = 0; i < (nb_segments_existants); i++) {
		                    	var segment_courant = i

		                    	//si le segment courant n'est pas actif, le griser
		                    	if (activ_idx_values.indexOf(i) === -1) {
		                    		this_chart.data.datasets[0].backgroundColor[i] = "rgba(240, 240, 240, 0.5)";
		                    	}
		                    	//sinon récupérer la couleur de l'index actif et l'affecter à l'index courant
		                    	else {
		                    		var bckg_color_activSlice = params_barChart_deepCopy.active_slices.filter(o=> o.index === i)[0].backgroundColor;
		                    		this_chart.data.datasets[0].backgroundColor[i] = bckg_color_activSlice;
		                    	}
		                    }
							//set bckg color for activated slices

		                    this_chart.update();
		            }

		        },false)


	}

	addListenerMouseover(evt, this_chart, params_barChart_deepCopy){
        var activePoints = this_chart.getElementAtEvent(evt);

        if (activePoints[0]) {

        	try {
				var categorie = activePoints[0]._model.label;
				var sous_categorie = activePoints[0]._model.datasetLabel;

            }
            catch {
            	console.log("segment non detecté, clic à l'exterieur du graph")
            }    
        }
        else {
        	//remettre config sans bordures

        	/*console.log("entrée en zone blanche 2")*/
			var nb_categories = params_barChart_deepCopy.nb_categories;

			//parcours catégories
			for (var i = 0; i < nb_categories; i++) {		
				
				this_chart.config.data.datasets[0].borderColor[i] = "rgba(230, 11, 11, 0)";							

			}
			this_chart.update();
        }        

    }	

	



}


