class mixed_BarLineChart_singleScale {

	constructor(params_mixed_barChart) {		
		this.id = params_mixed_barChart.id
		this.ctx = params_mixed_barChart.ctx
	    this.category_field = params_mixed_barChart.category_field
	    this.line_category_field = params_mixed_barChart.line_field_params.CategoryFieldName
	    this.numerical_field = params_mixed_barChart.numerical_field
	    this.title_x_axis = params_mixed_barChart.title_x_axis
	    this.title_y_axis = params_mixed_barChart.title_y_axis
		this.type = params_mixed_barChart.type
	    this.responsive = true
	    this.legend_position = params_mixed_barChart.legend_params.position
	    this.legend_title = params_mixed_barChart.legend_title
	    this.legend_clicked = params_mixed_barChart.legend_clicked
	    this.title = params_mixed_barChart.title[0]
	    this.list_segments_selected = []
	    this.nb_categories = 0
	    this.nb_sous_categories = 0
	    this.line_field_params = params_mixed_barChart.line_field_params

	}

	createChart(params_mixed_barChart) {
		
		var data_filtred = this.prepare_data_p1(params_mixed_barChart)

		this.prepare_data_p2(data_filtred, params_mixed_barChart)

		var chart_instance = this.init_chart(params_mixed_barChart)
		
		if (params_mixed_barChart.interactions_chart_options.hoverOptions === true) {
			this.add_options_hover(chart_instance, params_mixed_barChart) }
		if (params_mixed_barChart.interactions_chart_options.selectionOptions === true) {
			this.addListeners(params_mixed_barChart.ctx, chart_instance, params_mixed_barChart) }



		params_mixed_barChart.instanciator = this
		params_mixed_barChart.chart_type = "chartJS"

		//add params chart to shared params
		sharedParams.params_charts.push(params_mixed_barChart)

	}




	prepare_data_p1(params_chart) {

	    var d1 = new Date();

	    //zone de filtrage
	    //filter the primary data source according to the scope of the vizualisation (limited geographic area, range of time, any specific observation)

	    //data source for the bar chart
	    if (params_chart.transformations.barChart.dataset === undefined) {
	    	//var data_filtred = sharedParams.data_main.map(o=> _.pick(o, [sharedParams.list_of_axis, params_chart.numerical_field_params.fieldName]))
	    	var data_barChart = [...sharedParams.data_main]
	    	
	    }
	    else if (params_chart.transformations.lineChart.dataset && params_chart.transformations.lineChart.dataset.length > 0) {
	    	var data_barChart = [...params_chart.transformations.barChart.dataset]	    	
	    }

	    //data source for the line chart
	    if (params_chart.transformations.lineChart.dataset === undefined) {	    	
	    	if (params_chart.line_field_params.dataset === "source") {
		    	var data_lineChart = [...sharedParams.data_source]	    	
	    	}
	    	else if (params_chart.line_field_params.dataset === "transformed" && sharedParams.data_main.length > 0) {
		    	var data_lineChart = [...sharedParams.data_main]	    	
	    	}
	    	else {
		    	var data_lineChart = [...sharedParams.data_source]	    	
	    	}

	    }
	    else if (params_chart.transformations.lineChart.dataset && params_chart.transformations.lineChart.dataset.length > 0) {
	    	var data_lineChart = [...params_chart.transformations.lineChart.dataset]	    	
	    }	    





		/*var filterList_barChart = {}; var filterList_lineChart = {}

		//if the crossfilter is provided, extract & transform values of the filter_array (provided by the crossfilter process)
		if (params_chart.transformations.crossfilter !== undefined && Object.keys(params_chart.transformations.crossfilter).length > 0 ) {
			var filter_array_source = {}; filter_array_transformed = {}
			Object.assign(filter_array_source, params_chart.transformations.crossfilter)
			var filter_array_transformed = Object.values(_.mapValues(params_chart.transformations.crossfilter,
			 function(value, key) {
			 	if (key.indexOf("binned") > -1) {
				 	var valueMin = parseFloat(value[0].substring(0, value[0].indexOf(0, "-")+1));
				 	var valueMax = parseFloat(value[0].substring(value[0].indexOf(0, "-")+2, 20));
				  	return {field:key, operation: "between_binMode", valueMin: valueMin, valueMax: valueMax};
				}
				else {
					return {field:key, operation: "include", values: value};
				}
			}))
			filter_array_transformed = filter_array_transformed.filter(o=> o.field !== "undefined")
			//add the values into the filter bar chart list
			Object.assign(filterList_barChart, filter_array_transformed);

			//delete the category field from the filter array source, before to injet it into the filter line chart list
			delete filter_array_source[params_chart.category_field];

			var filter_array_transformed = Object.values(_.mapValues(filter_array_source,
			 function(value, key) {
			 	if (key.indexOf("binned") > -1) {
				 		var pos_sep = value[0].indexOf("-");
					 	var valueMin = parseFloat(value[0].substring(0, pos_sep));
					 	var valueMax = parseFloat(value[0].substring(pos_sep+1, 20));
				  	return {field:key, operation: "between_binMode", valueMin: valueMin, valueMax: valueMax};
				}
				else {
					return {field:key, operation: "include", values: value};
				}
			}))
			filter_array_transformed = filter_array_transformed.filter(o=> o.field !== "undefined")

			Object.assign(filterList_lineChart, filter_array_transformed);

			params_chart.transformations.crossfilter = {}
		}*/



var filterList_barChart = {}, filterList_lineChart = {}
//if the crossfilter is provided, extract & transform values of the filter_array (provided by the crossfilter process)
if (params_chart.transformations.crossfilter !== undefined && Object.keys(params_chart.transformations.crossfilter).length > 0 ) {
	params_chart.reset_crossfilter = false
	filterList_barChart = formFilterArray(params_chart);
	//save image of crossfilter object
	var crossfilter = {...params_chart.transformations.crossfilter}
	//delete the category field from the filter array source, before to injet it into the filter line chart list
	delete params_chart.transformations.crossfilter[params_chart.category_field];	
	filterList_lineChart = formFilterArray(params_chart)
	//restore the crossfilter object
	params_chart.transformations.crossfilter = {...crossfilter}	
	params_chart.transformations.crossfilter = {}
}



		//if a filter arguments has been provided for the bar data source, call them back here
		if (params_chart.transformations.barChart.filter !== undefined) {

			//transform the filterList into an array that we can push in it filter objects
			filterList_barChart = Object.values(filterList_barChart)

			params_chart.transformations.barChart.filter.map(e=> filterList_barChart.push(e))


			//call the filter function
			filterList_barChart = filterList_barChart.filter(l=> l.field !== "")
			var data_barChart = CrossFilterDataSource(data_barChart, filterList_barChart)
			//extract the line_field values to inject in the line data source filter
			var line_field_values = deduplicate_dict(data_barChart, params_BarLineChart.line_field_params.CategoryFieldName)
			var line_field_object = {field: params_BarLineChart.line_field_params.CategoryFieldName, operation: "include", values: line_field_values}
			filterList_lineChart = Object.values(filterList_lineChart);
			filterList_lineChart.push(line_field_object);
			//filter_array.map(p=> params_BarLineChart.transformations.barChart.filter.push(p))
		}

		//if a filter arguments has been provided for the line data source, call them back here
		if (params_chart.transformations.lineChart.filter !== undefined) {
			params_chart.transformations.lineChart.filter.map(e=> filterList_lineChart.push(e))

			//transform the filterList into an array that can be mapped by the filter function
			
			//call the filter function
			filterList_lineChart = filterList_lineChart.filter(l=> l.field !== "")
			var data_lineChart = CrossFilterDataSource(data_lineChart, filterList_lineChart)

		}




	    



	    //zone de regroupements
	    //if one categorical axis, use this groupy method
    

        var agg_name_lodash = params_chart.numerical_field_params.agg_type + "By";
        var agg_fieldName = params_chart.numerical_field_params.agg_type + "_" + params_chart.numerical_field_params.fieldName
        params_chart.numerical_field_params.agg_fieldName = agg_fieldName

        //group & agg the first dataset for the bar chart
        var dataset_ChartJS_1 = [];
        var groupedItem = _.groupBy(data_barChart, record => record[params_chart.category_field]);
        if (params_chart.numerical_field_params.agg_type === "count") {
	        dataset_ChartJS_1 = _.map(groupedItem, (group, key) => {
	          return {
	            [params_chart.category_field]: group[0][params_chart.category_field],
	            [agg_fieldName]: (group.length)
	          };
	        });
        }
        else {
	        dataset_ChartJS_1 = _.map(groupedItem, (group, key) => {
	          return {
	            [params_chart.category_field]: group[0][params_chart.category_field],	            
	            [agg_fieldName]: _[agg_name_lodash](group, params_chart.numerical_field_params.fieldName)	            
	          };
	        });
	    }

        //console.log("tps exec lodash: " + (new Date() - d1)/1000)
        /*console.log('output: ', dataset_ChartJS);*/

        //trier tableau
        dataset_ChartJS_1.sort(trier(params_chart.category_field, 'asc'))
        //round values
        dataset_ChartJS_1 = round_values(dataset_ChartJS_1, agg_fieldName)        
    




        //group & agg the second dataset for the line chart
        var dataset_ChartJS_2 = [];
        var groupedItem = _.groupBy(data_lineChart, record => record[params_chart.line_field_params.CategoryFieldName]);
        if (params_chart.numerical_field_params.agg_type === "count") {
	        dataset_ChartJS_2 = _.map(groupedItem, (group, key) => {
	          return {
	            [params_chart.line_field_params.CategoryFieldName]: group[0][params_chart.line_field_params.CategoryFieldName],
	            [agg_fieldName]: (group.length)
	          };
	        });
        }
        else {
	        dataset_ChartJS_2 = _.map(groupedItem, (group, key) => {
	          return {
	            [params_chart.line_field_params.CategoryFieldName]: group[0][params_chart.line_field_params.CategoryFieldName],
	            [agg_fieldName]: _[agg_name_lodash](group, params_chart.numerical_field_params.fieldName)
	          };
	        });
	    }

        console.log("tps exec lodash: " + (new Date() - d1)/1000)
        /*console.log('output: ', dataset_ChartJS);*/

        //trier tableau
        dataset_ChartJS_2.sort(trier(params_chart.line_field_params.CategoryFieldName, 'asc'))
        //round values
        dataset_ChartJS_2 = round_values(dataset_ChartJS_2, agg_fieldName)



	    


	    function round_values(dataset_ChartJS, agg_fieldName) {
	    	for (var d = 0; d < dataset_ChartJS.length; d++) {	        
	            dataset_ChartJS[d][agg_fieldName] = Math.round(dataset_ChartJS[d][agg_fieldName] * 100) / 100
	        };
	        return dataset_ChartJS
	    }

	    return {barDataset: dataset_ChartJS_1, lineDataset: dataset_ChartJS_2}

	}





	prepare_data_p2(data_input, params_mixed_barChart) {
		//processus de création d'un nouveau dataset: 

			params_mixed_barChart.nb_axis = 1

			//1.obtenir les catégories (les communes par ex)
			var categories = deduplicate_dict(data_input.barDataset, this.category_field); //categories.sort()
			//2.obtenir les sous-catégories (la taille des logements par ex: 1p, 2p ...)
			var line_categories = deduplicate_dict(data_input.lineDataset, this.line_field_params.CategoryFieldName); //line_categories.sort()
			var nb_categories = categories.length; var nb_line_categories = line_categories.length;
	        params_mixed_barChart.nb_categories = categories.length;
	        //params_mixed_barChart.nb_sous_categories = line_categories.length

			//3.création des catégories dans la spec ChartJS (champ labels dans chartJS)
			params_mixed_barChart.data[0].labels.push(categories)
			params_mixed_barChart.activ_categories_values = []; params_mixed_barChart.activ_categories_values.push(categories);
			params_mixed_barChart.activ_line_categories_values = []; params_mixed_barChart.activ_line_categories_values.push(line_categories)
			


        	if (Object.keys(params_mixed_barChart.backgroundColorArray_barChart_source).length === 0) {
        		var i = 0
        		function select_generated_color(backgroundColorArray_source, i) { return backgroundColorArray_source[i]}
        		var status_colors = "empty";
				var colored_axis = params_mixed_barChart.category_field
        		if (sharedParams.used_color_schemes.hasOwnProperty(colored_axis) === true) {
	        		var backgroundColorArray_source = generateColors(nb_categories, sharedParams.used_color_schemes[colored_axis], params_mixed_barChart.colorsConfig.colorsOrder, colored_axis)
					categories.map(axis => {
						params_mixed_barChart.backgroundColorArray_barChart_source[axis] = select_generated_color(backgroundColorArray_source, i); 
						i++
						} )
        		}
        		else {
	        		var backgroundColorArray_source = generateColors(nb_categories, params_mixed_barChart.colorsConfig.scheme, params_mixed_barChart.colorsConfig.colorsOrder, colored_axis)
					categories.map(axis => {
						params_mixed_barChart.backgroundColorArray_barChart_source[axis] = select_generated_color(backgroundColorArray_source, i); 
						i++
						} )
        		}


        		var backgroundColorArray_lineChart_source = generateColors(nb_line_categories, "", "");
        		status_colors = "filled";
        	}




			//extarct the data for the bar chart
			var bar_data_array = []; var backgroundColorArray_barDataset = []; var borderColorArray_barDataset = []; var borderWidthArray_barDataset = [];
	        for (var i = 0; i < nb_categories; i++) {

	        	//2.récupérer l'array contenant les data associées à la sous-catégorie
	            //2.2.récupérer l'array contenant les data	            
	            bar_data_array.push(data_input.barDataset[i][params_mixed_barChart.numerical_field_params.agg_fieldName]);


		        borderColorArray_barDataset.push('rgba(230, 11, 11, 0)'); borderWidthArray_barDataset.push(1);
		        
			    backgroundColorArray_barDataset.push(params_mixed_barChart.backgroundColorArray_barChart_source[categories[i]])
	        };


			//if the chart is already clicked, preserve the deactivated slices and maintain they color effect (grey or lower opacity)
            if (params_mixed_barChart.prepare_data_type === "preserve backgroundColor") {
            	var backgroundColorArray_barDataset = [];
            	var array_labels = params_mixed_barChart.data[0].labels[0];
            	var active_category_fields = [];
            	for (var c = 0; c < params_mixed_barChart.active_slices.length; c++) {
            		active_category_fields.push(params_mixed_barChart.active_slices[c].category_field)
            	}

            	//1.collecte the category_field value & background color of the active slice
            	for (var a = 0; a < params_mixed_barChart.active_slices.length; a++) {

	            	var active_category_field = params_mixed_barChart.active_slices[a].category_field


	            	//2.collecte the position of the active_category_field in the filtred array of labels
	            	
	            	var pos_active_category_field = array_labels.indexOf(active_category_field)

	            	//3.add grey backgroundColor to the slices, except the active slice setup above
	            	for (var i = 0; i < array_labels.length; i++) {
	            		//if the label looped is not in the array of active labels, set it's background color to grey
	            		pos_active_category_field = active_category_fields.indexOf(array_labels[i])
	            		if (pos_active_category_field === -1) {
		            		backgroundColorArray_barDataset.push('rgba(240, 240, 240, 0.5)');
	    				}
	    				else {
	            			var active_slice_backgroundColor = params_mixed_barChart.active_slices[pos_active_category_field].backgroundColor	    					
	    					backgroundColorArray_barDataset.push(active_slice_backgroundColor);
	    				}
	            	}
	            }
            }



            //creation of the dataset for the successiv line charts
            //if the chart is loaded for the first time, register the colors in the spec params
            //1.add border color to the input dataset
            var a = 0; 
            if (Object.keys(params_mixed_barChart.backgroundColorArray_lineChart_source).length === 0) {
	            data_input.lineDataset.map(line=> {

	            	var borderColor = backgroundColorArray_lineChart_source[a].replace("0.65", "1")
	            	line["borderColor"] = borderColor

			        //register the label/color config in the params spec
			        params_mixed_barChart.backgroundColorArray_lineChart_source[line_categories[a]] = backgroundColorArray_lineChart_source[a]

	            	a++

	        	})
	        }
	        else {
	            data_input.lineDataset.map(line=> {

	            	var borderColor = params_mixed_barChart.backgroundColorArray_lineChart_source[line[params_mixed_barChart.line_field_params.CategoryFieldName]].replace("0.65", "1")
	            	line["borderColor"] = borderColor

	            	a++

	        	})	        	
	        }

            //feed the param dataset spec
            data_input.lineDataset.map(line=> {

    			var line_data_array = _.repeat(line[params_mixed_barChart.numerical_field_params.agg_fieldName] + ";", nb_categories).split(";").filter(d=> d !== "");
    			line_data_array = line_data_array.map(d=> parseFloat(d));
	            params_mixed_barChart.data[1].datasets.push({label: line[params_mixed_barChart.line_field_params.CategoryFieldName], borderWidth: 2, 
	            	borderColor: line.borderColor, data: line_data_array, type: "line", fill: false, pointStyle: 'circle'})


            })



            //creation of the dataset for the bar chart
            params_mixed_barChart.data[1].datasets.push({label: "", backgroundColor: backgroundColorArray_barDataset, borderWidth: borderWidthArray_barDataset, 
            	borderColor: borderColorArray_barDataset, data: bar_data_array, type: "bar"})








			params_mixed_barChart.list_idx_segments_existants = [];
			var list_idx_segments_existants = params_mixed_barChart.list_idx_segments_existants
	        //1.collecter les clés de tous les segments existants
			for (var i = 0; i < (nb_categories); i++) {
						list_idx_segments_existants.push(i)
			}

			//.sauvegarder une image des données source avant transformation
			if (params_mixed_barChart.data_source_raw.length === 0) {
				params_mixed_barChart.data_source_raw = data_input
				params_mixed_barChart.data_source[0].labels.push(categories)
		        params_mixed_barChart.data_source[1].datasets = params_mixed_barChart.data[1].datasets

		    }


	}


	init_chart(params_mixed_barChart) {	

		var plugin = {
			id: "LineBarChart_legend_handler",
		    beforeDraw: function (chart) {
		    		var this_chart = params_mixed_barChart.chart_instance
		            let legends = chart.legend.legendItems;
		            try {
			            legends.forEach(function (e, i) {
			              if (e.text === "") {
			              	e.fillStyle = "rgba(252, 252, 252, 1)";
			              	e.strokeStyle = "rgba(252, 252, 252, 1)"
			              }
			              else {
			              	var col = this_chart.config.data.datasets[i].borderColor
			              	e.fillStyle = col
			              	e.strokeStyle = col
			              }

			            });
			        }
			        catch (error) {console.log(error)}
		    }
		

		};

		var barChart = new Chart(this.ctx, {
				        type: this.type,
				        data: [],
				        options: {
				            responsive: this.responsive,		
				            title: this.title,
							/*tooltips: {
								      mode: 'nearest',
								      intersect: true,
					        		  displayColors: false
								},*/
					tooltips: 
					{
						callbacks: {
						title: function(tooltipItem, data) {
							var datasetIndex = tooltipItem[0].datasetIndex; var field = data["datasets"][datasetIndex].label	
							if (field !== "") {return params_mixed_barChart.label_tooltips.line_label + ": " + field}
							else {return field}
							
						}, 
						label: function(tooltipItem, data) {
							var value = tooltipItem.yLabel;
							return params_mixed_barChart.label_tooltips.value_label + ": " + value
						}
						},
					      backgroundColor: 'rgba(0, 0, 0, 0.6)',
					      titleFontSize: 12,
					      titleFontColor: '#fff',
					      bodyFontColor: '#fff',
					      bodyFontSize: 12,
					      displayColors: false
					},								
							hover: {
								mode: 'nearest',
								intersect: true
							},				            
			                scales: {
			                    yAxes: [{
			                        ticks: {
			                            beginAtZero: true
			                        }
			                    ,scaleLabel: {
							        display: true,
							        labelString: this.title_y_axis
							      },
							        stacked: false
							     }],

			                    xAxes: [{
			                     scaleLabel: {
							        display: true,
							        labelString: this.title_x_axis
							      },
							     stacked: false
							     }]

			                },
			                
			                animation: {
			                        duration: 750,
			                        easing: 'easeOutQuad'
			                },
			             /*    tooltips: {
			                    mode: 'label'
			                },*/
			                legend: {
								display: true,								
								align: "start",
								padding: 30,
								rtl: true,
			                    position: 'right',
								labels : {usePointStyle : true}
							}
		                },
				    plugins: [plugin]
				});




		//alimenter avec les labels ET LES DATASETS
		var data_type = "data"; var injection_type = "init"
		this.inject_metadata(barChart, params_mixed_barChart, data_type, injection_type)

		return barChart 				
	}

	selections_listeners(params_mixed_barChart) {
/*		var t = 2
		singleSelect.params_mixed_barChart.list_labels_segment_single_selected.length = t; // console: 'hello_world set to test'
*/
	}
	

	inject_metadata(barChart, params_mixed_barChart, data_type, injection_type) {
		//alimenter avec les labels
		if (barChart.config.data.labels.length === 0) {
			barChart.config.data.labels = [...params_mixed_barChart[data_type][0].labels[0]]
		}


		//alimenter avec les datasets
		if (injection_type === "init") {
			var length_dataset_params_chart = params_mixed_barChart[data_type][1].datasets.length;
			var datasets = [];
			for (var i = 0; i < length_dataset_params_chart; i++) {
				datasets.push(params_mixed_barChart[data_type][1].datasets[i])
				barChart.config.data.datasets[i] = _.cloneDeep(datasets[i])
			}
			barChart.config.data.datasets = _.cloneDeep(datasets)
		}
		else if (injection_type === "update") {
			var length_dataset_params_chart = params_mixed_barChart[data_type][1].datasets.length;
			var length_dataset_instance_chart = barChart.config.data.datasets.length;
			var datasets = [];
			//if only 1 bar, apply the code below
			if (length_dataset_params_chart < length_dataset_instance_chart) {
				for (var i = 0; i < length_dataset_params_chart; i++) {
					datasets.push(params_mixed_barChart[data_type][1].datasets[i])
					//if the dataset is line type, fill the adequate dataset object in the data config chart
					if (datasets[i].type === 'line') {
						//barChart.config.data.datasets.filter(d=> d.type === datasets[i].type).filter(l=> l.label === "")

						barChart.config.data.datasets.filter(d=> d.type === datasets[i].type).filter(l=> l.label === "")[0].label = _.cloneDeep(datasets[i].label)
						barChart.config.data.datasets.filter(d=> d.type === datasets[i].type).filter(l=> l.label === datasets[i].label)[0].data = _.cloneDeep(datasets[i].data)
						barChart.config.data.datasets.filter(d=> d.type === datasets[i].type).filter(l=> l.label === datasets[i].label)[0].borderColor = _.cloneDeep(datasets[i].borderColor)
						barChart.config.data.datasets.filter(d=> d.type === datasets[i].type).filter(l=> l.label === datasets[i].label)[0].borderWidth = _.cloneDeep(datasets[i].borderWidth)

					}
					else if (datasets[i].type === 'bar') {
						//barChart.config.data.datasets.filter(d=> d.type === datasets[i].type).filter(l=> l.data.length > 0)
						barChart.config.data.datasets.filter(d=> d.type === datasets[i].type)[0].data = _.cloneDeep(datasets[i].data)
						barChart.config.data.datasets.filter(d=> d.type === datasets[i].type)[0].label = _.cloneDeep(datasets[i].label)
						barChart.config.data.datasets.filter(d=> d.type === datasets[i].type)[0].backgroundColor = _.cloneDeep(datasets[i].backgroundColor)
						barChart.config.data.datasets.filter(d=> d.type === datasets[i].type)[0].borderColor = _.cloneDeep(datasets[i].borderColor)
						barChart.config.data.datasets.filter(d=> d.type === datasets[i].type)[0].borderWidth = _.cloneDeep(datasets[i].borderWidth);
					}
				}	

			}

			//if multiple bars, apply the code below
			else if (length_dataset_params_chart === length_dataset_instance_chart) {
				for (var i = 0; i < length_dataset_params_chart; i++) {
					datasets.push(params_mixed_barChart[data_type][1].datasets[i])
					//if the dataset is line type, fill the adequate dataset object in the data config chart
					barChart.config.data.datasets[i].data = _.cloneDeep(datasets[i].data)
					barChart.config.data.datasets[i].label = _.cloneDeep(datasets[i].label)
					barChart.config.data.datasets[i].backgroundColor = _.cloneDeep(datasets[i].backgroundColor)
					barChart.config.data.datasets[i].borderColor = _.cloneDeep(datasets[i].borderColor)
					barChart.config.data.datasets[i].borderWidth = _.cloneDeep(datasets[i].borderWidth)
				}
			}

		}


		barChart.update(750)


		//procedure manuelle pour remmetre les couleurs source
		/*bar1.config.data.datasets[2].backgroundColor = _.cloneDeep(params_bar1_deepCopy.data[1].datasets[2].backgroundColor)*/

		//register the chart instance in the param array
		params_mixed_barChart.chart_instance = barChart


		return barChart
	}



	maj_couleurs(barChart, params_mixed_barChart) {
		//on entre dans cette func pour enlever le focus posé sur les segments

		var nb_categories = params_mixed_barChart.nb_categories;
		var backgroundColorArray = [];

		var backgroundColorArray = params_mixed_barChart.data_source[1].datasets.filter(dataset=> dataset.type === 'bar')[0].backgroundColor;
		barChart.config.data.datasets.filter(dataset=> dataset.type === 'bar')[0].backgroundColor = [...backgroundColorArray]

		/*barChart.config.data.datasets[i].backgroundColor = backgroundColorArray;*/
		barChart.update();

	}	

	reset_border_color(this_chart, params_mixed_barChart_deepCopy) {
		/*console.log("entree_zone_blanche"); console.log(this_chart); console.log(params_mixed_barChart_deepCopy);*/

		//remettre config sans bordures
		var nb_categories = params_mixed_barChart_deepCopy.nb_categories;

		//parcours catégories
		for (var i = 0; i < nb_categories; i++) {		
			
			//parcours sous-catégories
			var nb_sous_categories = params_mixed_barChart_deepCopy.nb_sous_categories;
			for (var a = 0; a < nb_sous_categories; a++) {
				this_chart.config.data.datasets[a].borderColor[i] = "rgba(230, 11, 11, 0)";
			};
			
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

	addListeners(ctx, this_chart, params_barChart_deepCopy) {

	            //gestion de la bordure en zone blanche
	            ctx.addEventListener("mouseover", function(evt){
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
							
							this_chart.config.data.datasets.filter(dataset=> dataset.type === 'bar')[0].borderColor[i] = "rgba(230, 11, 11, 0)";							

						}
						this_chart.update();
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

							var categorie = activePoints[0]._model.label;
							var sous_categorie = activePoints[0]._model.datasetLabel;




							//il faut annuler les segments multiples précédemment sélectionnés avant de passer à une sélection unique
							//controler que shift n'a pas été appuyé
							if (evt.shiftKey === false) {
								params_barChart_deepCopy.list_idx_segments_multiples_selected = []; params_barChart_deepCopy.list_labels_segments_multiples_selected = []
								params_barChart_deepCopy.list_keys_values_segments_multiples_selected = [];
							};
							////il faut annuler le segment unique sélectionné lors sur dernier clic
							params_barChart_deepCopy.list_labels_segment_single_selected = [];
							params_barChart_deepCopy.list_keys_values_segment_single_selected = [];

							var category_field = params_barChart_deepCopy.category_field;
							
							params_barChart_deepCopy.list_labels_segment_single_selected.push({category_field: categorie});
							params_barChart_deepCopy.list_keys_values_segment_single_selected.push({[category_field] : [categorie]});
							//observableSlim
							/*p.changeBar1 = key_composite;*/
							

							//controler que shift n'a pas été appuyé pour éviter des push multiples
							if (evt.shiftKey === false) {
								params_barChart_deepCopy.list_labels_segments_multiples_selected.push({category_field: categorie});
								params_barChart_deepCopy.list_keys_values_segments_multiples_selected.push({[category_field] : [categorie]});								
							}



		                    console.log("labels collectés:"); console.log(params_barChart_deepCopy.list_labels_segment_single_selected); /*console.log("valeur: " + value)*/

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

	            });


	            //gestion d'un clic unique sur un segment (pour désactiver les couleurs des segments non selectionnés)
	            ctx.onclick = function(evt) {
	            	
	                var activePoints = this_chart.getElementAtEvent(evt);
	                //si le clic est fait sur un des segments
	                if (activePoints[0]) {
	                	//1.remettre les couleurs d'origine sur tous les segments
		                params_barChart_deepCopy.instanciator.maj_couleurs(this_chart, params_barChart_deepCopy);

	                    var idx = activePoints[0]['_index'];
	                    //collect color of the slice
						var activePoint_backgroundColor = activePoints[0]._model.backgroundColor;
						//augmenter l'opacité du segment
						activePoint_backgroundColor = activePoint_backgroundColor.replace("0.65", "1")						

						////il faut annuler le segment unique sélectionné lors sur dernier clic					
						params_barChart_deepCopy.list_idx_segment_single_selected = [];
	                    params_barChart_deepCopy.list_idx_segment_single_selected.push(idx);

						//controler que shift n'a pas été appuyé pour éviter des push multiples
						if (evt.shiftKey === false) {
	    	                params_barChart_deepCopy.list_idx_segments_multiples_selected.push(idx);//++
							//evo
							params_barChart_deepCopy.active_slices = [];
							params_barChart_deepCopy.active_slices.push({category_field: activePoints[0]._model.label, backgroundColor: activePoint_backgroundColor, 
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
		                            		this_chart.config.data.datasets.filter(dataset=> dataset.type === 'bar')[0].backgroundColor[i] = "rgba(240, 240, 240, 0.5)";
		                            		//this_chart.config.data.datasets[0].backgroundColor[i] = "rgba(240, 240, 240, 0.5)";
		                                
		                            	}
										else {
											//collecter la couleur du segment											
											

											activePoints[0]._model.backgroundColor = activePoint_backgroundColor;
											this_chart.config.data.datasets.filter(dataset=> dataset.type === 'bar')[0].backgroundColor[i] = activePoint_backgroundColor;


										}

	                            	}                            	


	                        this_chart.update()                    

	                }

	                //remettre les couleurs d'origine lors d'un clic à l'extérieur des barres
	                else {

	                	params_barChart_deepCopy.prepare_data_type = "";
	                    params_barChart_deepCopy.instanciator.maj_couleurs(this_chart, params_barChart_deepCopy);
						//vider liste des segments selectionnés
						
						
						params_barChart_deepCopy.list_idx_segments_multiples_selected = [];
						params_barChart_deepCopy.list_labels_segments_multiples_selected = [];												
						params_barChart_deepCopy.list_idx_segment_single_selected = [];
						params_barChart_deepCopy.list_labels_segment_single_selected = [];
						params_barChart_deepCopy.list_keys_values_segment_single_selected = [];						
						params_barChart_deepCopy.list_keys_values_segments_multiples_selected = [];
						params_barChart_deepCopy.active_slices = []
	                }
	            }





	            //rés-activer les couleurs de tous les segments
	            ctx.ondblclick = function(evt) {
	            	params_barChart_deepCopy.prepare_data_type = ""
	                params_barChart_deepCopy.instanciator.maj_couleurs(this_chart, params_barChart_deepCopy);

					//vider liste des segments selectionnés
					params_barChart_deepCopy.list_idx_segments_multiples_selected = [];
					params_barChart_deepCopy.list_labels_segments_multiples_selected = [];												
					params_barChart_deepCopy.list_idx_segment_single_selected = [];
					params_barChart_deepCopy.list_labels_segment_single_selected = [];					
					params_barChart_deepCopy.list_keys_values_segment_single_selected = [];
					params_barChart_deepCopy.list_keys_values_segments_multiples_selected = [];
					params_barChart_deepCopy.active_slices = []
					
	            };
	     


		      /*gestion d'un clic + shift sur plusiers segments (pour désactiver les couleurs des segments non selectionnés)*/
		      ctx.addEventListener("click",
		        function(e) {
		          if (e.shiftKey) {
		                    console.log("Shift, yay!");
		                	//1.remettre les couleurs d'origine sur tous les segments
			                params_barChart_deepCopy.instanciator.maj_couleurs(this_chart, params_barChart_deepCopy);

		                    var activePoints = this_chart.getElementAtEvent(e);
		                    var idx = activePoints[0]['_index'];
							
							var categorie = activePoints[0]._model.label;
							var category_field = params_barChart_deepCopy.category_field;

							//collect the backgroundcolor of the slice
							var activePoint_backgroundColor = activePoints[0]._model.backgroundColor;
							//augmenter l'opacité du segment
							activePoint_backgroundColor = activePoint_backgroundColor.replace("0.65", "1")

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
		                    		this_chart.config.data.datasets.filter(dataset=> dataset.type === 'bar')[0].backgroundColor[i] = "rgba(240, 240, 240, 0.5)";
		                    	}
		                    	//sinon récupérer la couleur de l'index actif et l'affecter à l'index courant
		                    	else {
		                    		var bckg_color_activSlice = params_barChart_deepCopy.active_slices.filter(o=> o.index === i)[0].backgroundColor;
		                    		this_chart.config.data.datasets.filter(dataset=> dataset.type === 'bar')[0].backgroundColor[i] = bckg_color_activSlice;
		                    	}
		                    }
							//set bckg color for activated slices

		                    this_chart.update();
		            }

		        },false)
	}
}



