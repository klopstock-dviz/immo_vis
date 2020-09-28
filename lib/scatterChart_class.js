class scatterChart {

	constructor(params_chart) {		
		this.id = params_chart.id
		this.ctx = params_chart.ctx
	    this.category_field = params_chart.category_field
	    this.x_field = params_chart.x_field
	    this.y_field = params_chart.y_field	   
	    this.title_x_axis = params_chart.title_x_axis
	    this.title_y_axis = params_chart.title_y_axis
		this.type = params_chart.shape.type
	    this.responsive = true
	    //this.legend_position = params_chart.legend_position[0]
	    this.legend_title = params_chart.legend_title
	    this.legend_clicked = params_chart.legend_clicked
	    this.title = params_chart.title
	    this.list_segments_selected = []
	    this.nb_categories = 0
	    //this.nb_sous_categories = 0
	    this.fill = params_chart.shape.fill
	    this.stackedChart = params_chart.stackedChart


	}

	createChart(params_chart, data_to_transform) {
		
		var data_filtred = this.prepare_data_p1(params_chart, data_to_transform)

		this.prepare_data_p2(data_filtred, params_chart)

		//if (params_chart.instanciator === undefined) {
			var chart_instance = this.init_chart(params_chart)
		//}


		params_chart.instanciator = this
		params_chart.chart_type = "chartJS"

		//add params chart to shared params if no present
		if (sharedParams.params_charts.includes(params_chart) === false) {
			sharedParams.params_charts.push(params_chart)
		}
		
	}

	updateChart(params_chart) {
		var data_filtred = this.prepare_data_p1(params_chart)

		this.prepare_data_p2(data_filtred, params_chart)

		var data_type = "data"; var injection_type = "update"
		this.inject_metadata(params_chart.chart_instance, params_chart, data_type, injection_type)

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
			//data_chuncks = getFiltredData(data_chart, filterList, params_chart.id)
		}


		//if the state management proccess detected filtering values, prepare & engage the crossfilter here
		if (Object.keys(filterList).length > 0) {
			data_chuncks = prepare_engage_crossfilter(data_chart, params_chart, filterList, data_chuncks)

		}


		data_chuncks.length > 0 ? data_chart = [...data_chuncks] : {}


	    

		//preserve the fields to be used
		if (params_chart.list_of_axis.length === 0) {
			var label_tooltip_fields_keep = params_chart.label_tooltip.map(o=> o.field_detail).filter(o=> o !== undefined)
			var label_tooltip_title = params_chart.label_tooltip.map(o=> o.field_title).filter(o=> o !== undefined)[0]
			label_tooltip_fields_keep.push(label_tooltip_title)
			params_chart.list_of_axis = [...label_tooltip_fields_keep]
		}
		else {
			var label_tooltip_fields_keep = [...params_chart.list_of_axis]	
		}

		var dataset_ChartJS = data_chart.map(o=> _.pick(o, label_tooltip_fields_keep));

		

  
	    function round_values(dataset_ChartJS, agg_fieldName) {
	    	for (var d = 0; d < dataset_ChartJS.length; d++) {	        
	            dataset_ChartJS[d][agg_fieldName] = Math.round(dataset_ChartJS[d][agg_fieldName] * 100) / 100
	        };
	        return dataset_ChartJS
	    }


		//save the current data max values
		params_chart.scale_x_MaxValue = d3.max(dataset_ChartJS, m=> m[params_chart.x_field]) - d3.min(dataset_ChartJS, m=> m[params_chart.x_field]);
		params_chart.scale_y_MaxValue = d3.max(dataset_ChartJS, m=> m[params_chart.y_field]) - d3.min(dataset_ChartJS, m=> m[params_chart.y_field]);

	    
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





	prepare_data_p2(data_input, params_chart) {
		//processus de création d'un nouveau dataset: 
		//params_chart.data[1].datasets.push({"label":0, backgroundColor: 'red', data: [39889, 19889, 14889]})
		//répeter l'opération autant de fois qu'il y a de sous-catégories (nb_sous_categories)
					
			params_chart.nb_axis = 1
			params_chart.legends_field = this.category_field
			params_chart.active_legends.hasOwnProperty(params_chart.legends_field) ? {} : params_chart.active_legends[params_chart.legends_field] = [];
			params_chart.hidden_legends.hasOwnProperty(params_chart.legends_field) ? {} : params_chart.hidden_legends[params_chart.legends_field] = [];

			//1.obtenir les catégories (les communes par ex)
			var categories = data_input.map(r=> r[this.category_field]); categories = deduplicate_array(categories).sort()
			if (data_input[0].hasOwnProperty(this.category_field + "_decoded")) {
				var categories_decoded = data_input.map(r=> r[this.category_field + "_decoded"])
			}

			var nb_categories = categories.length; //var nb_sous_categories = sous_categories.length;
	        params_chart.nb_categories = categories.length;
	        //params_chart.nb_sous_categories = sous_categories.length

			if (params_chart.decode) {var category_field = params_chart.category_field + "_decoded"}
			else {var category_field = params_chart.category_field}			


        	if (Object.keys(params_chart.backgroundColorArray_source).length === 0) {
        		var i = 0
        		function select_generated_color(backgroundColorArray_source, i) { return backgroundColorArray_source[i] }//.replace("0.65", "1")
        		var status_colors = "empty";
        		//chech if a color has been generated for the same category field, if so re use it
        		var colored_axis = params_chart.category_field


        		if (sharedParams.used_color_schemes.hasOwnProperty(colored_axis) === true) {
	        		var backgroundColorArray_source = generateColors(nb_categories, sharedParams.used_color_schemes[colored_axis], params_chart.colorsConfig.colorsOrder, colored_axis)
					categories.map(axis => {
						params_chart.backgroundColorArray_source[axis] = select_generated_color(backgroundColorArray_source, i); 
						i++
						} )
					if (params_chart.decode) {
						i = 0;
						categories_decoded.map(axis => {
							params_chart.backgroundColorArray_source[axis] = select_generated_color(backgroundColorArray_source, i); 
							i++
							} )					
					}
        		}
        		else {
	        		var backgroundColorArray_source = generateColors(nb_categories, sharedParams.used_color_schemes[colored_axis], params_chart.colorsConfig.colorsOrder, colored_axis)
					categories.map(axis => {
						params_chart.backgroundColorArray_source[axis] = select_generated_color(backgroundColorArray_source, i); 
						i++
						} )
					if (params_chart.decode) {
						i = 0;
						categories_decoded.map(axis => {
							params_chart.backgroundColorArray_source[axis] = select_generated_color(backgroundColorArray_source, i); 
							i++
							} )					
					}					
        		}
        	}


	        
			//créer les datasets regroupés par categ
			var groupedItem = _.groupBy(data_input, record => record[category_field])
			var groups = _.mapValues(groupedItem, function(value, key) {
			
				var backgroundColorArray = _.repeat(params_chart.backgroundColorArray_source[key]+";", value.length).split(";")
				var group = {label: key, backgroundColor: backgroundColorArray, data: value.map(o=> {return {x: o[params_chart.x_field], y: o[params_chart.y_field], o}}), pointStyle: 'circle'}
				return group
			})		

			params_chart.data[1].datasets = [...Object.values(groups)]


			//.sauvegarder une image des données source avant transformation
			if (params_chart.data_source_raw.length === 0) {
				params_chart.data_source_raw = data_input
				params_chart.data_source[0].labels.push(categories)
		        params_chart.data_source[1].datasets = params_chart.data[1].datasets

		    }


	}


	init_chart(params_chart) {	
		var plugin = {
			id: "scatterChart_legend_handler",
		    beforeDraw: function (chart) {
		    		var this_chart = params_chart.chart_instance
		            let legends = chart.legend.legendItems;
		            try {
			            legends.forEach(function (e, i) {
			              	if (e.text !== "") {
				              	var backgroundColor = params_chart.data[1].datasets.filter(l=> l.label === e.text)[0].backgroundColor[0];
				              	if (backgroundColor) {
					              	e.fillStyle = backgroundColor
					            }
					        }
			              	//e.strokeStyle = "rgba(252, 252, 252, 1)"
			             
						/*else {
			              	var col = this_chart.config.data.datasets[i].borderColor
			              	e.fillStyle = col
			              	e.strokeStyle = col
			              }*/

			            });
			        }
			        catch (error) {console.log(error)}
		    }
		

		};

			var scatterChart = new Chart(this.ctx, {
			    type: this.type,
			    data: {},
			    options: {
			    	title: {
						display: true,
						text: this.title
					},			    
			        scales: {
			            xAxes: [{
			                type: 'linear',
			                position: 'bottom',
			                ticks: {
		                        beginAtZero: true
		                    },
		                    scaleLabel: {
						        display: true,
						        labelString: this.title_x_axis
						    }		                    
			            }],
			            yAxes: [{
			                type: 'linear',
			                position: 'left',
			                ticks: {
		                        beginAtZero: true
		                    },
		                    scaleLabel: {
						        display: true,
						        labelString: this.title_y_axis
						    }		                    
			            }]	            
			        },
			        //tooltips: {enabled: false}
					tooltips: 
					{
						callbacks: {
						title: function(tooltipItem, data) {
						  return params_chart.label_tooltip.filter(e=> e.field_title)[0].as + ": " + data.datasets[tooltipItem[0].datasetIndex].label
						}, 
						label: function(tooltipItem, data) {
							var tooltips = params_chart.label_tooltip.filter(e=> e.field_detail).map(e=> {var l = e.as + ": " +  data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]["o"][e.field_detail];
							  	return l })
							return tooltips
						}
						},
					      backgroundColor: 'rgba(0, 0, 0, 0.6)',
					      titleFontSize: 12,
					      titleFontColor: '#fff',
					      bodyFontColor: '#fff',
					      bodyFontSize: 12,
					      displayColors: false
					},
					legend: {
							labels : {usePointStyle : true},
							display: true,
							position: "right",
							align: "start",
							padding: 30,
							rtl: true,		                    
					        labels: {
								/*filter: function(legendItem, data, fl) {
					                return legendItem.text !== fl
					           	}  */        
					        },			                    
		                    onHover: function(e) {
		                        if (e) {
		                      		e.target.style.cursor = 'pointer';
		                     	}
		                      },
		                    /*onClick: function (evt, item) {
						        //preserve default behaviour on click
						        Chart.defaults.global.legend.onClick.call(this, evt, item)
		                        //register click event
		                        if (evt) {
		                      		params_chart.legend_clicked = true
		                     	}			                     	
		                      }*/
							onClick: function(evt, item) {
						        
						        //Chart.defaults.global.legend.onClick.call(this, evt, item)
						        var pos_dataset = this.chart.data.datasets.map(l=> l.label).indexOf(item.text);
						        var legend_clicked = this.chart.getDatasetMeta(pos_dataset).hidden;
						        if (legend_clicked === false || legend_clicked === null) {
						        	this.chart.getDatasetMeta(pos_dataset).hidden = true;
						        	params_chart.legend_clicked = true;
						        	params_chart.chart_instance.update(0)
						        }
						        else {
						        	this.chart.getDatasetMeta(pos_dataset).hidden = false;
						        	params_chart.legend_clicked = true;
						        	params_chart.chart_instance.update(0)
						        }

								
	                            console.log('legend_clicked scatterChart: ' + item.text)
	                        }		                      
	                }					
			    },
				plugins: [plugin]
			});
			scatterChart.options.legend.labels.usePointStyle = true




		//alimenter avec les labels ET LES DATASETS
		var data_type = "data"; var injection_type = "init"
		this.inject_metadata(scatterChart, params_chart, data_type, injection_type)

		return scatterChart 				
	}


	

	inject_metadata(scatterChart, params_chart, data_type, injection_type, updateTime) {


		//alimenter avec les datasets
		if (injection_type === "init") {
			var l = params_chart[data_type][1].datasets.length;
			var datasets = [];
			for (var i = 0; i < l; i++) {
				datasets.push(params_chart[data_type][1].datasets[i])
				scatterChart.config.data.datasets[i] = {...(datasets[i])}
			}
			scatterChart.config.data.datasets = [...datasets]
		}
		else if (injection_type === "update") {
			var l = params_chart[data_type][1].datasets.length;
			var datasets = [];
			try {
				for (var i = 0; i < l; i++) {
					datasets.push(params_chart[data_type][1].datasets[i])
					scatterChart.config.data.datasets[i].data = [...datasets[i].data]
					scatterChart.config.data.datasets[i].label = datasets[i].label
					scatterChart.config.data.datasets[i].backgroundColor = [...datasets[i].backgroundColor]
					/*scatterChart.config.data.datasets[i].borderColor = [...datasets[i].borderColor]
					scatterChart.config.data.datasets[i].borderWidth = [...datasets[i].borderWidth]*/
				}
			}
			catch (error) {
				console.log("scatterChart ko:" + error.stack)
				scatterChart.config.data.datasets[0].data = []
				scatterChart.config.data.datasets[0].label = []
				scatterChart.config.data.datasets[0].backgroundColor = []				
			}


		}

		//save the current chart area before update
		//params_chart.chartArea = _.cloneDeep(scatterChart.chartArea)

		if (updateTime === undefined) {updateTime = 750}
		if (scatterChart.config.data.datasets[0].data.length > 0) {
			scatterChart.update(updateTime)
		}

		


		//procedure manuelle pour remmetre les couleurs source
		/*bar1.config.data.datasets[2].backgroundColor = _.cloneDeep(params_bar1_deepCopy.data[1].datasets[2].backgroundColor)*/

		//register the chart instance in the param array
		params_chart.chart_instance = scatterChart


		//if a brush is drawn, conserve it
		if (params_chart.prepare_data_type === "preserve backgroundColor" || Object.values(params_chart.brush_values).length > 0) {
			
			adapt_brush_v2(params_chart)
		}
		else {
			reposition_brushTransformer(params_chart)
		}


		return scatterChart
	}






	maj_couleurs(scatterChart, params_chart) {
		//on entre dans cette func pour enlever le focus posé sur les segments

		var nb_categories = params_chart.nb_categories;
		var backgroundColorArray = [];

		//parcours catégories
		for (var i = 0; i < nb_categories; i++) {		
			
			//parcours sous-catégories
			var nb_sous_categories = params_chart.nb_sous_categories;
			for (var a = 0; a < nb_sous_categories; a++) {
	/*			backgroundColorArray.push(params_chart.data[1].datasets[a].backgroundColor[i])*/
				var backgroundColor = params_chart.data_source[1].datasets[a].backgroundColor[i];
	/*			var borderColor = params_chart.data[1].datasets[a].borderColor[i];*/
				scatterChart.config.data.datasets[a].backgroundColor[i] = backgroundColor;
				/*scatterChart.config.data.datasets[a].borderColor[i] = "rgba(230, 11, 11, 0)";*/
			}

			/*scatterChart.config.data.datasets[i].backgroundColor = backgroundColorArray;*/
			scatterChart.update();



		}
	}	

	reset_border_color(this_chart, params_chart_deepCopy) {
		/*console.log("entree_zone_blanche"); console.log(this_chart); console.log(params_chart_deepCopy);*/

		//remettre config sans bordures
		var nb_categories = params_chart_deepCopy.nb_categories;

		//parcours catégories
		for (var i = 0; i < nb_categories; i++) {		
			
			//parcours sous-catégories
			var nb_sous_categories = params_chart_deepCopy.nb_sous_categories;
			for (var a = 0; a < nb_sous_categories; a++) {
				this_chart.config.data.datasets[a].borderColor[i] = "rgba(230, 11, 11, 0)";
			};
			
		}

		this_chart.update();

	}





}



