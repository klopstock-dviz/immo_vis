class PieChart {

	constructor(params_pieChart) {
		this.id = params_pieChart.id
		this.ctx = params_pieChart.ctx
	    this.category_field = params_pieChart.category_field
	    this.numerical_field = params_pieChart.numerical_field
	    this.label_tooltip = params_pieChart.label_tooltip
		this.type = params_pieChart.type
	    this.responsive = true
	    this.title = params_pieChart.title[0]
	    this.list_segments_selected = []
	    this.nb_categories = 0
	    this.hovered_points = {previous: "", current: ""}
	    this.legends_points = {previous: "", current: ""}


	}

	createChart(params_pieChart, data_to_transform) {
		
		var data_filtred = this.prepare_data_p1(params_pieChart, data_to_transform)

		this.prepare_data_p2(data_filtred, params_pieChart)

		var chart_instance = this.init_chart(params_pieChart)
		
		if (params_pieChart.interactions_chart_options.hoverOptions === true) {
			this.add_options_hover(chart_instance, params_pieChart) }
		if (params_pieChart.interactions_chart_options.selectionOptions === true) {
			this.addListeners(params_pieChart.ctx, chart_instance, params_pieChart) }



		//register the instanciator
		params_pieChart.instanciator = this
		params_pieChart.chart_type = "chartJS"
		
		//add params chart to shared params
		sharedParams.params_charts.push(params_pieChart)

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
			//data_chuncks = getFiltredData(data_chart, filter_array, filterList, params_chart.id)
		}


		//if the state management proccess detected filtering values, prepare & engage the crossfilter here
		if (Object.keys(filterList).length > 0) {
			data_chuncks = prepare_engage_crossfilter(data_chart, params_chart, filterList, data_chuncks)

		}


		data_chuncks.length > 0 ? data_chart = [...data_chuncks] : {}





	    


	    //grouping zone
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




	prepare_data_p2(data_input, params_pieChart) {
		/*processus de création d'un nouveau dataset: 
		params_pieChart.data[1].datasets.push({"label":0, backgroundColor: 'red', data: [39889, 19889, 14889]})
		répeter l'opération autant de fois qu'il y a de sous-catégories (nb_sous_categories)
		*/			

			params_pieChart.nb_axis = 1
			params_pieChart.legends_field = this.category_field
			params_pieChart.active_legends.hasOwnProperty(params_pieChart.legends_field) ? {} : params_pieChart.active_legends[params_pieChart.legends_field] = [];
			params_pieChart.hidden_legends.hasOwnProperty(params_pieChart.legends_field) ? {} : params_pieChart.hidden_legends[params_pieChart.legends_field] = [];
			
			if (params_pieChart.list_of_axis.length === 0) {params_pieChart.list_of_axis.push(this.category_field)}

			//1.obtenir les catégories (les communes par ex)
			var categories = data_input.map(r=> r[this.category_field])
			if (data_input[0].hasOwnProperty(this.category_field + "_decoded")) {
				var categories_decoded = data_input.map(r=> r[this.category_field + "_decoded"])
			}
			var nb_categories = categories.length; 

			//2.création des catégories dans la spec ChartJS (champ labels dans chartJS)
			if (categories_decoded) {
				params_pieChart.data[0].labels.push(categories_decoded)
				params_pieChart.data_input = data_input
			}
			else {params_pieChart.data[0].labels.push(categories)}



	        params_pieChart.nb_categories = categories.length;	        
	        params_pieChart.activ_categories_values = []; params_pieChart.activ_categories_values.push(categories)

			//3.création des catégories dans la spec ChartJS (champ labels dans chartJS)
			params_pieChart.data[0].labels.push(categories)


            //4.créer un array borderColor et borderWidth égal à nb_sous_categories
            var borderColorArray = []; 
            var borderWidthArray = [];
            //changements pour passer au simple bar chart -> remplacer nb_sous_categories par nb_categories, pour avoir autant de couleurs que de barres
            for (var i = 0; i < nb_categories; i++) {
            	borderColorArray.push('white');
            	borderWidthArray.push(2);

        	}	        


			/*guide création des sous-catégories dans la spec ChartJS
			params_pieChart.data[1].datasets.push({"label":data_group[i]['nb_pieces'], backgroundColor: 'red', data: [39889, 19889, 14889]})*/
	        
			//changements pour passer au simple bar chart
			//if we initialize the backgroundColorArray for the first time, make a random select from the repository of colors        
			if (Object.keys(params_pieChart.backgroundColorArray_source).length === 0) {
        		var i = 0
        		function select_generated_color(backgroundColorArray_source, i) { return backgroundColorArray_source[i]}
				var status_colors = "empty"	            	       
        		var colored_axis = params_pieChart.category_field;
        		if (sharedParams.used_color_schemes.hasOwnProperty(colored_axis) === true) {
	        		var backgroundColorArray_source = generateColors(nb_categories, sharedParams.used_color_schemes[colored_axis], params_pieChart.colorsConfig.colorsOrder, colored_axis)
					categories.map(axis => {
						params_pieChart.backgroundColorArray_source[axis] = select_generated_color(backgroundColorArray_source, i); 
						i++
						} )
        		}
        		else {
	        		var backgroundColorArray_source = generateColors(nb_categories, params_pieChart.colorsConfig.scheme, params_pieChart.colorsConfig.colorsOrder, colored_axis)
					categories.map(axis => {
						params_pieChart.backgroundColorArray_source[axis] = select_generated_color(backgroundColorArray_source, i); 
						i++
						} )
        		}
			}



			//créer les datasets composés des categories, du champ numérique à représenter, des couleurs des barres et leur bordure
			var data_array = []; var backgroundColorArray = []; 			
	        for (var i = 0; i < nb_categories; i++) {

	        	//2.récupérer l'array contenant les data associées à la sous-catégorie
	            //2.2.récupérer l'array contenant les data	            
	            data_array.push(data_input[i][params_pieChart.numerical_field_params.agg_fieldName]);

	            //3.construie l'array contenant les couleurs des barres
		        backgroundColorArray.push(params_pieChart.backgroundColorArray_source[categories[i]])

	        };


			//if the chart is already clicked, preserve the deactivated slices and maintain they color effect (grey or lower opacity)
            if (params_pieChart.prepare_data_type === "preserve backgroundColor") {
            	backgroundColorArray = [];
				if (params_pieChart.data_input) {
					var array_labels = params_pieChart.data_input.map(r=> r[params_pieChart.category_field])
				}
				else {var array_labels = params_pieChart.data[0].labels[0]}
            	
            	var active_category_fields = [];
            	for (var c = 0; c < params_pieChart.active_slices.length; c++) {
            		active_category_fields.push(params_pieChart.active_slices[c].category_field)
            	}

            	//1.collecte the category_field value & background color of the active slice
            	for (var a = 0; a < params_pieChart.active_slices.length; a++) {

	            	var active_category_field = params_pieChart.active_slices[a].category_field


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
	            			var active_slice_backgroundColor = params_pieChart.active_slices[pos_active_category_field].backgroundColor	    					
	    					backgroundColorArray.push(active_slice_backgroundColor);
	    				}
	            	}
	            }
            }



            //4.création des sous-catégories (champ label), data associée (champ data dans ChartJS) et couleurs et bordures dans la spec ChartJS 
            params_pieChart.data[1].datasets.push({label: this.label_tooltip, backgroundColor: backgroundColorArray, borderWidth: borderWidthArray, 
            	borderColor: borderColorArray, data: data_array})

        params_pieChart.list_idx_segments_existants = [];
		var list_idx_segments_existants = params_pieChart.list_idx_segments_existants                    		
        //1.collecter les clés de tous les segments existants
		for (var i = 0; i < (nb_categories); i++) {
			list_idx_segments_existants.push(i)			
		}

		//.sauvegarder une image des données source avant transformation
		if (params_pieChart.data_source_raw.length === 0) {
			params_pieChart.data_source_raw = data_input
			params_pieChart.data_source[0].labels.push(categories)
	        params_pieChart.data_source[1].datasets = params_pieChart.data[1].datasets

	    }		

	}


	init_chart(params_pieChart) {		
		var plugin = {
			id: "pieChart1_legend_handler",
		    beforDraw: function (chart) {
		    		var this_chart = params_pieChart.chart_instance		
		            let legends = chart.legend.legendItems;
		            try {
			            legends.forEach(function (e, i) {
			              var chartLabel = this_chart.config.data.labels[i]
			              var legendLabel = this_chart.legend.legendItems[i].text
			              if (chartLabel === legendLabel) {
			              	var bckg_color = this_chart.config.data.datasets[0].backgroundColor[i]
			              	if (bckg_color.length > 0 && bckg_color !== "rgba(240, 240, 240, 0.5)") {
				                e.fillStyle = bckg_color;
				                e.lineWidth = 0
							}
							else {
								e.fillStyle = "rgba(240, 240, 240, 0.5)";
								e.lineWidth = 0
							}
			              }                
			            });
			        }
			        catch (error) {console.log(error)}
		    }

		}
		var pieChart = new Chart(this.ctx, {
			    type: this.type,
			    data: [],
	            options: {
	                responsive: false,                    
                    animation: {
                            duration: 500,
                            easing: 'easeOutQuad'
                    },
                     tooltips: {
                        mode: 'label'
                    },
                    legend: {
						display: true,
						position: "right",
						align: "start",
						padding: 30,
						rtl: true,                    	
                        onHover: function(e) {
                             e.target.style.cursor = 'pointer';
                        },
                        onClick: function(evt, item) {
					        //preserve default behaviour on click
					        //Chart.defaults.global.legend.onClick.call(this, evt, item)
					        var pos_dataset = this.chart.data.labels.indexOf(item.text);
					        var legend_clicked = this.chart.getDatasetMeta(0).data[pos_dataset].hidden;
					        if (legend_clicked === false) {
					        	this.chart.getDatasetMeta(0).data[pos_dataset].hidden = true;
					        	params_pieChart.legend_clicked = true;
					        }
					        else {
					        	this.chart.getDatasetMeta(0).data[pos_dataset].hidden = false;
					        	params_pieChart.legend_clicked = true;
					        }

							
                            console.log('legend_clicked pieChart: ' + item.text)
                        }                                                                 
                    }
	            },
				plugins: [plugin]

				
			})



		//alimenter avec les labels ET LES DATASETS
		var data_type = "data"; var injection_type = "init"
		this.inject_metadata(pieChart, params_pieChart, data_type, injection_type)
		this.monitor_legends_onClick(pieChart, params_pieChart)

		return pieChart 				
	}




	inject_metadata(pieChart, params_pieChart, data_type, injection_type, updateTime) {
		//alimenter avec les labels
		if (pieChart.config.data.labels.length === 0) {
			pieChart.config.data.labels = [...params_pieChart[data_type][0].labels[0]]
		}
	

		//alimenter avec les datasets
		if (injection_type === "init") {
			var l = params_pieChart[data_type][1].datasets.length;
			var datasets = [];
			for (var i = 0; i < l; i++) {
				datasets.push(params_pieChart[data_type][1].datasets[i])
				pieChart.config.data.datasets[i] = {...datasets[i]}
			}
			pieChart.config.data.datasets = [...datasets]
		}
		else if (injection_type === "update") {
			var l = params_pieChart[data_type][1].datasets.length;
			var datasets = [];
			for (var i = 0; i < l; i++) {
				datasets.push(params_pieChart[data_type][1].datasets[i])
				pieChart.config.data.datasets[i].data = [...datasets[i].data]
				pieChart.config.data.datasets[i].label = datasets[i].label
				pieChart.config.data.datasets[i].backgroundColor = [...datasets[i].backgroundColor]
				pieChart.config.data.datasets[i].borderColor = [...datasets[i].borderColor]
				pieChart.config.data.datasets[i].borderWidth = [...datasets[i].borderWidth]
			}
			pieChart.config.data.labels = [...params_pieChart[data_type][0].labels[0]]

		}

		


		if (updateTime === undefined) {updateTime = 750}
		pieChart.update(updateTime)

		//procedure manuelle pour remmetre les couleurs source
		/*bar1.config.data.datasets[2].backgroundColor = _.cloneDeep(params_bar1_deepCopy.data[1].datasets[2].backgroundColor)*/

		//register the chart instance in the param array
		params_pieChart.chart_instance = pieChart



		return pieChart
	}





	maj_couleurs(pieChart, params_pieChart) {
		//on entre dans cette func pour enlever le focus posé sur les segments

		var nb_categories = params_pieChart.nb_categories;
		var backgroundColorArray = [];

		//parcours catégories
		for (var i = 0; i < nb_categories; i++) {		
			
				if (params_pieChart.data_input) {
					var backgroundColor = params_pieChart.backgroundColorArray_source[params_pieChart.data_input[i][params_pieChart.category_field]]	
				}
				else {var backgroundColor = params_pieChart.backgroundColorArray_source[pieChart.config.data.labels[i]];}

				pieChart.config.data.datasets[0].backgroundColor[i] = backgroundColor;
				pieChart.config.data.datasets[0].borderColor[i] = "white";
				pieChart.config.data.datasets[0].borderWidth[i] = 1

			/*pieChart.config.data.datasets[i].backgroundColor = backgroundColorArray;*/
		}
		pieChart.update();
	}

	reset_border_color(this_chart, params_pieChart_deepCopy) {
		/*console.log("entree_zone_blanche"); console.log(this_chart); console.log(params_pieChart_deepCopy);*/

		//remettre config sans bordures
		var nb_categories = params_pieChart_deepCopy.nb_categories;

		//parcours catégories
		if (params_pieChart_deepCopy.active_slices.length === 0) {
			for (var i = 0; i < nb_categories; i++) {		
				
				//this_chart.config.data.datasets[0].borderColor[i] = "rgba(230, 11, 11, 0)";
				this_chart.config.data.datasets[0].borderColor[i] = "rgba(210, 210, 210, 1)";
				this_chart.config.data.datasets[0].borderWidth[i] = 1
				
			}
		this_chart.update();
		}
		else {
			for (var i = 0; i < nb_categories; i++) {		
				
				this_chart.config.data.datasets[0].borderColor[i] = "rgba(210, 210, 210, 1)";
				this_chart.config.data.datasets[0].borderWidth[i] = 1
				
			}
		this_chart.update();			
		}

		

	}


	monitor_legends_onClick(this_chart, params_pieChart_deepCopy) {
		setInterval(function() {
			var this_instance = params_pieChart_deepCopy.instanciator			

			// var legends_active = this_chart.legend.legendItems.filter(o=> o.hidden === true).map(a=> a.text)

			// this_instance.legends_points.current = legends_active.join()
			// if (this_instance.legends_points.current !== this_instance.legends_points.previous) {
			// 	console.log("legends click pieChart: " + legends_active);
			// 	params_pieChart_deepCopy.legend_clicked = true;
			// 	this_instance.legends_points.previous = legends_active.join();


			// 	var legends_state = collect_active_legends(params_pieChart_deepCopy)
			// 	var active_legends = legends_state["active_legends"]; var hidden_legends = legends_state["hidden_legends"]

			// 	params_pieChart_deepCopy.active_legends = {[params_pieChart_deepCopy.category_field]: active_legends}
			// 	params_pieChart_deepCopy.hidden_legends = {[params_pieChart_deepCopy.category_field]: hidden_legends}
			// }			


		}, 50)


		function collect_active_legends(params_pieChart_deepCopy) {
			//collect current legends
			var current_chart = params_pieChart_deepCopy.chart_instance
			var legends_array=[]; var hidden_legends=[]
			//remove active legends					
			//params_chart.active_legends = {}

			var limit = current_chart.legend.legendItems.length
			for (var i = 0; i < limit; i++) {
				var status_legend = current_chart.legend.legendItems[i].hidden
				//collect all non hidden slices to push them into the filter array
				if (status_legend === false) {
					legends_array.push(current_chart.legend.legendItems[i].text)
				}
				else if (status_legend === true) {
					hidden_legends.push(current_chart.legend.legendItems[i].text)
				}
			}
			//_this.legends_array = legends_array

			return {active_legends: legends_array, hidden_legends: hidden_legends}
		}		
		
	}







	add_options_hover(this_chart, params_pieChart_deepCopy) {

			this_chart.config.options.hover = {
	                onHover: function(e) {
	                    var point = this_chart.getElementAtEvent(e);
						var activePoints
						var this_instance = params_pieChart_deepCopy.instanciator

	                     if (point.length) {
	                        //transformer curseur en pointeur
	                     	e.target.style.cursor = 'pointer'; 

	                     	//effacer les bordures précédantes
	                     	//this_chart.update();

	                        //si survol d'un segment, mettre bordure rouge sur élément survolé
	                        activePoints = this_chart.getElementAtEvent(e);                        
	                        if (activePoints[0]) {
	                            //relever l'index de l'élément survolé                    
	                            var idx = activePoints[0]['_index'];
								var datasetIdx = activePoints[0]['_datasetIndex'];

								//collecter la couleur du segment
								var activePoint_backgroundColor = activePoints[0]._model.backgroundColor;
								
								//augmenter l'opacité de la bordure
								//activePoints[0]._model.borderColor = "rgba(230, 11, 11, 1)";
								//this_chart.data.datasets[datasetIdx].borderColor[idx] = "rgba(230, 11, 11, 1)";
								this_chart.config.data.datasets[0].borderWidth[idx] = 0
								params_pieChart_deepCopy.border_activated = true
								
								//augmenter l'opacité du segment
								activePoint_backgroundColor = activePoint_backgroundColor.replace("0.65", "1")
								activePoints[0]._model.backgroundColor = activePoint_backgroundColor;
								//this_chart.data.datasets[datasetIdx].backgroundColor[idx] = activePoint_backgroundColor;
								
								var label = activePoints[0]._model.label;

								//test désactivation couleurs segments non selectionnés
								
								this_instance.hovered_points.current = idx
								if (this_instance.hovered_points.current !== this_instance.hovered_points.previous) {
									//console.log("hover: " + idx); console.log("hover: " + label)
									this_instance.reset_border_color(this_chart, params_pieChart_deepCopy)
									
									if (params_pieChart_deepCopy.active_slices.length === 0) {
										this_instance.maj_couleurs(this_chart, params_pieChart_deepCopy);
									}
									this_instance.hovered_points.previous = idx
								}

								

	                        }

	                     }
	                     else {
	                     	e.target.style.cursor = 'default';

	                     	if (params_pieChart_deepCopy.border_activated === true) {
								params_pieChart_deepCopy.instanciator.reset_border_color(this_chart, params_pieChart_deepCopy)
								params_pieChart_deepCopy.border_activated = false
							}

	                     }
	                }
		}
	}	

	addListeners(ctx, this_chart, params_pieChart_deepCopy) {

	            //gestion de la bordure en zone blanche
	            ctx.addEventListener("mouseover", function(evt){
	                var activePoints = this_chart.getElementAtEvent(evt);

	                if (activePoints[0]) {

	                	/*try {
							var categorie = activePoints[0]._model.label;
							var sous_categorie = activePoints[0]._model.datasetLabel;

		                }
		                catch {
		                	console.log("segment non detecté, clic à l'exterieur du graph")
		                }*/    
	                }
	                else {
	                	//remettre config sans bordures

	                	/*console.log("entrée en zone blanche 2")*/
						var nb_categories = params_pieChart_deepCopy.nb_categories;

						//parcours catégories
						/*for (var i = 0; i < nb_categories; i++) {									
								this_chart.config.data.datasets[0].borderColor[i] = "rgba(230, 11, 11, 0)";													
						}
						this_chart.update();*/
	                }        

	            });






	            //collecter le segment cliqué
	            ctx.addEventListener("click", function(evt){
	                var activePoints = this_chart.getElementAtEvent(evt);

	                if (activePoints[0]) {

	                	try {
		                    var idx = activePoints[0]['_index'];
							var datasetIdx = activePoints[0]['_datasetIndex'];
							var key_composite = datasetIdx + "-" + idx

							var categorie = this_chart.data.labels[idx];
							//if the decoder param is on, re-encode the field to fill the crossfilter process with the expected value (ex transform 'Appartements' into 'a')
							if (params_pieChart_deepCopy.decode && params_pieChart_deepCopy.data_input) {
								categorie = params_pieChart_deepCopy.data_input.filter(r=> r[params_pieChart_deepCopy.category_field + "_decoded"] === categorie)[0][params_pieChart_deepCopy.category_field]
							}							




							//il faut annuler les segments multiples précédemment sélectionnés avant de passer à une sélection unique
							//controler que shift n'a pas été appuyé
							if (evt.ctrlKey === false) {
								params_pieChart_deepCopy.list_idx_segments_multiples_selected = []; params_pieChart_deepCopy.list_labels_segments_multiples_selected = []
								params_pieChart_deepCopy.list_keys_values_segments_multiples_selected = [];
							};

							////il faut annuler le segment unique sélectionné lors sur dernier clic								
							params_pieChart_deepCopy.list_labels_segment_single_selected = [];
							params_pieChart_deepCopy.list_keys_values_segment_single_selected = [];


							//if clic on the same slice, clean the lists
							if (params_pieChart_deepCopy.list_idx_segment_single_selected.includes(idx)) {
								return								
							}

							else {
								var category_field = params_pieChart_deepCopy.category_field;
								
								params_pieChart_deepCopy.list_labels_segment_single_selected.push({category_field: categorie});
								params_pieChart_deepCopy.list_keys_values_segment_single_selected.push({[category_field] : [categorie]});
								//observableSlim
								/*p.changeBar1 = key_composite;*/
								
								//controler que shift n'a pas été appuyé pour éviter des push multiples
								// if (evt.ctrlKey === false) {
								// 	if (sous_categorie !== "null") {
								// 		params_pieChart_deepCopy.list_labels_segment_single_selected.push({category_field: categorie});
								// 		params_pieChart_deepCopy.list_keys_values_segment_single_selected.push({[category_field] : [categorie]})
								// 		params_pieChart_deepCopy.list_labels_segments_multiples_selected.push({category_field: categorie});
								// 	}
								// 	else {
								// 		params_pieChart_deepCopy.list_labels_segment_single_selected.push({category_field: categorie});
								// 		params_pieChart_deepCopy.list_keys_values_segment_single_selected.push({[category_field] : [categorie]})
								// 		params_pieChart_deepCopy.list_labels_segments_multiples_selected.push({category_field: categorie});
								// 	}					
								// }


								//controler que shift n'a pas été appuyé pour éviter des push multiples
								if (evt.ctrlKey === false) {
									params_pieChart_deepCopy.list_labels_segments_multiples_selected.push({category_field: categorie});
									params_pieChart_deepCopy.list_keys_values_segments_multiples_selected.push({[category_field] : [categorie]});								
								}



			                    console.log("labels collectés:"); console.log(params_pieChart_deepCopy.list_labels_segment_single_selected); /*console.log("valeur: " + value)*/
			                }

		                }
		                catch {
		                	console.log("segment non detecté, clic à l'exterieur du graph")
		                	//observableSlim
		                	/*p.changeBar1 = false;*/
		                	//vider la liste puisqu'on ne sélectionne plus aucun segment
							//vider liste des segments selectionnés

							params_pieChart_deepCopy.list_idx_segment_single_selected = [];
							params_pieChart_deepCopy.list_labels_segment_single_selected = [];
							params_pieChart_deepCopy.list_keys_values_segment_single_selected = [];
							params_pieChart_deepCopy.list_keys_values_segment_single_selected = [];
							params_pieChart_deepCopy.list_keys_values_segments_multiples_selected = [];
							params_pieChart_deepCopy.active_slices = []
		                }    
	                }        

	            });


	            //gestion d'un clic unique sur un segment (pour désactiver les couleurs des segments non selectionnés)
	            ctx.onclick = function(evt) {
	            	
	                var activePoints = this_chart.getElementAtEvent(evt);
	                //si le clic est fait sur un des segments
	                if (activePoints[0]) {
	                	//1.remettre les couleurs d'origine sur tous les segments
		                params_pieChart_deepCopy.instanciator.maj_couleurs(this_chart, params_pieChart_deepCopy);

	                    var idx = activePoints[0]['_index'];
	                    var categorie = this_chart.data.labels[idx];
						//if the decoder param is on, re-encode the field to fill the crossfilter process with the expected value (ex transform 'Appartements' into 'a')
						if (params_pieChart_deepCopy.decode && params_pieChart_deepCopy.data_input) {
							categorie = params_pieChart_deepCopy.data_input.filter(r=> r[params_pieChart_deepCopy.category_field + "_decoded"] === categorie)[0][params_pieChart_deepCopy.category_field]
						}

						//if clic on the same slice, quit
						if (params_pieChart_deepCopy.list_idx_segment_single_selected.includes(idx)) {
							params_pieChart_deepCopy.list_idx_segment_single_selected = [];
							return
						}


	                    //collect color of the slice
						var activePoint_backgroundColor = params_pieChart_deepCopy.backgroundColorArray_source[categorie]
						//augmenter l'opacité du segment
						activePoint_backgroundColor = activePoint_backgroundColor.replace("0.65", "1")						



						////il faut annuler le segment unique sélectionné lors sur dernier clic					
						params_pieChart_deepCopy.list_idx_segment_single_selected = [];
	                    params_pieChart_deepCopy.list_idx_segment_single_selected.push(idx);

						//controler que shift n'a pas été appuyé pour éviter des push multiples
						if (evt.ctrlKey === false) {
	    	                params_pieChart_deepCopy.list_idx_segments_multiples_selected.push(idx);//++
							//evo
							params_pieChart_deepCopy.active_slices = [];
							params_pieChart_deepCopy.active_slices.push({category_field: categorie, backgroundColor: activePoint_backgroundColor})

	    	            }


						
						/*console.log("idx: " + idx); console.log("datasetIdx: " + datasetIdx); console.log("id dataset: + key_composite")*/
	                    var chartData = activePoints[0]['_chart'].config.data;                

	                    //parcourir toutes les barres pour les mettre en gris sauf celle cliquée
	                    var nb_categories = params_pieChart_deepCopy.nb_categories;
	    
	                        for (var i = 0; i < (nb_categories); i++) {
	                            //si la categorie parcourue n'est pas la catégorie active

	                            		//si on entre dans un segment différent du segment actif, griser la couleur du segment
	                            		if (idx !== i) {
		                            	//la couleur de fond se désactive ainsi pour le 1er segment: bar1.config.data.datasets[0].backgroundColor[0] = 'grey'
		                            		this_chart.config.data.datasets[0].backgroundColor[i] = "rgba(240, 240, 240, 0.5)";

		                            		//make border color grey for all other slices
		                            		this_chart.config.data.datasets[0].borderColor[i] = "rgba(210, 210, 210, 1)";
		                            		this_chart.config.data.datasets[0].borderWidth[i] = 1
		                            	}
										else {
											//collecter la couleur du segment											
											

											activePoints[0]._model.backgroundColor = activePoint_backgroundColor;
											this_chart.config.data.datasets[0].backgroundColor[i] = activePoint_backgroundColor;

											//register in the params_chart the active category & it's background color
/*											params_pieChart_deepCopy.active_slices["category_field"] = activePoints[0]._model.label;
											params_pieChart_deepCopy.active_slices["backgroundColor"] = activePoint_backgroundColor;
*/
				

										}

	                            	}                            	

	                        //save the colors of the filtred state
							var backgroundColor_array = [];
							for (var i = 0; i < this_chart.config.data.datasets.length; i++) {
								backgroundColor_array.push(this_chart.config.data.datasets[i].backgroundColor)
							};
							params_pieChart_deepCopy.backgroundColor_array_ClickedState = backgroundColor_array;

	                        this_chart.update()                    

	                }

	                //remettre les couleurs d'origine lors d'un clic à l'extérieur des barres
	                else {

	                	params_pieChart_deepCopy.prepare_data_type = "";
	                    params_pieChart_deepCopy.instanciator.maj_couleurs(this_chart, params_pieChart_deepCopy);
	                    params_pieChart_deepCopy.instanciator.reset_border_color(this_chart, params_pieChart_deepCopy)
						//vider liste des segments selectionnés
						
						
						params_pieChart_deepCopy.list_idx_segments_multiples_selected = [];
						params_pieChart_deepCopy.list_labels_segments_multiples_selected = [];												
						params_pieChart_deepCopy.list_idx_segment_single_selected = [];
						params_pieChart_deepCopy.list_labels_segment_single_selected = [];
						params_pieChart_deepCopy.list_keys_values_segment_single_selected = [];						
						params_pieChart_deepCopy.list_keys_values_segments_multiples_selected = [];
						params_pieChart_deepCopy.active_slices = []
	                }
	            }





	            //rés-activer les couleurs de tous les segments
	            ctx.ondblclick = function(evt) {
	            	params_pieChart_deepCopy.prepare_data_type = ""
	                params_pieChart_deepCopy.instanciator.maj_couleurs(this_chart, params_pieChart_deepCopy);

					//vider liste des segments selectionnés
					params_pieChart_deepCopy.list_idx_segments_multiples_selected = [];
					params_pieChart_deepCopy.list_labels_segments_multiples_selected = [];												
					params_pieChart_deepCopy.list_idx_segment_single_selected = [];
					params_pieChart_deepCopy.list_labels_segment_single_selected = [];					
					params_pieChart_deepCopy.list_keys_values_segment_single_selected = [];
					params_pieChart_deepCopy.list_keys_values_segments_multiples_selected = [];
					params_pieChart_deepCopy.active_slices = []
					
	            };
	     


		      /*gestion d'un clic + shift sur plusiers segments (pour désactiver les couleurs des segments non selectionnés)*/
		      ctx.addEventListener("click",
		        function(e) {
		          if (e.ctrlKey) {
		                	//remettre les couleurs d'origine sur tous les segments
			                params_pieChart_deepCopy.instanciator.maj_couleurs(this_chart, params_pieChart_deepCopy);

		                    var activePoints = this_chart.getElementAtEvent(e);
		                    var idx = activePoints[0]['_index'];
							
							var categorie = this_chart.data.labels[idx];
							//if the decoder param is on, re-encode the field to fill the crossfilter process with the expected value (ex transform 'Appartements' into 'a')
							if (params_pieChart_deepCopy.decode && params_pieChart_deepCopy.data_input) {
								categorie = params_pieChart_deepCopy.data_input.filter(r=> r[params_pieChart_deepCopy.category_field + "_decoded"] === categorie)[0][params_pieChart_deepCopy.category_field]
							}

							var category_field = params_pieChart_deepCopy.category_field;

							//collect the backgroundcolor of the slice
							var activePoint_backgroundColor = params_pieChart_deepCopy.backgroundColorArray_source[categorie]
							//augmenter l'opacité du segment
							activePoint_backgroundColor = activePoint_backgroundColor.replace("0.65", "1")


							var list_idx_segments_existants = params_pieChart_deepCopy.list_idx_segments_existants

							//vider les listes alimentées par un clic unique
							params_pieChart_deepCopy.list_idx_segment_single_selected = []; params_pieChart_deepCopy.list_labels_segment_single_selected = [];



							//refresh the lists fed by clic+shift
							//1.if the slice selected is not in the current lists, push it
							var pos_slice = params_pieChart_deepCopy.list_idx_segments_multiples_selected.indexOf(idx);
							if (pos_slice === -1) {
								//register the activated slices
			                    params_pieChart_deepCopy.list_idx_segments_multiples_selected.push(idx);
			                    params_pieChart_deepCopy.list_labels_segments_multiples_selected.push({"category_field": categorie})
			                    params_pieChart_deepCopy.list_keys_values_segments_multiples_selected.push({[category_field] : [categorie]});
								//register in the params_chart the active category & it's background color
								params_pieChart_deepCopy.active_slices.push({category_field: categorie, backgroundColor: activePoint_backgroundColor});

							}
							//2.delete selected slice from the diffent arrays
							else {
								params_pieChart_deepCopy.list_idx_segments_multiples_selected.splice(pos_slice, 1)

								var index_cat = params_pieChart_deepCopy.list_labels_segments_multiples_selected.findIndex(x => x.category_field === categorie);
								params_pieChart_deepCopy.list_labels_segments_multiples_selected.splice(index_cat, 1)

								var index_cat = params_pieChart_deepCopy.list_keys_values_segments_multiples_selected.findIndex(x => x[category_field][0] === categorie);
								params_pieChart_deepCopy.list_keys_values_segments_multiples_selected.splice(index_cat, 1)

								var index_cat = params_pieChart_deepCopy.active_slices.findIndex(x => x.category_field === categorie);
								params_pieChart_deepCopy.active_slices.splice(index_cat, 1)
							}





		                    //observableSlim
		                    /*p.changeBar1 = false;*/
		                    var chartData = activePoints[0]['_chart'].config.data;
		             

		                    //parcourir toutes les barres pour les mettre en gris sauf celles cliquées
		                    var nb_segments_existants = params_pieChart_deepCopy.list_idx_segments_existants.length;
		                    var nb_categories = params_pieChart_deepCopy.nb_categories;
							

		                    //ne s'applique qu'en cas de sélection multiple
		    
		                        for (var i = 0; i < (nb_segments_existants); i++) {
		                            //si le segment n'appartient pas à la liste des segments selectionnés, le mettre en gris
		                            var segment_a_traiter = list_idx_segments_existants[i];

		                            //si le segment actuel a déjà été selectionné, ne pas le griser
		                            if (params_pieChart_deepCopy.list_idx_segments_multiples_selected.indexOf(segment_a_traiter) === -1) {
		                                this_chart.data.datasets[0].backgroundColor[i] = "rgba(240, 240, 240, 0.5)";
		                                
		                            }
		                            //else increase it's opacity if the slice is still maintained
		                            else {		                            	
		                            	var cat_value = params_pieChart_deepCopy.data[0].labels[0][i];
		                            	var index_cat = params_pieChart_deepCopy.active_slices.findIndex(x => x.category_field === cat_value);
		                            	
		                            	if (index_cat > -1) {
			                            	var bckg_color = params_pieChart_deepCopy.active_slices[index_cat].backgroundColor
			                            	this_chart.data.datasets[0].backgroundColor[i] = bckg_color;
			                            }
			                            /*catch(error) {
			                            	console.log(error)
			                            }*/
		                            }

		                        };
		                        this_chart.update();
		                    }

		        },false)
	}

}


