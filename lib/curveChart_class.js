class curveChart {

	constructor(params_curveChart) {		
		this.id = params_curveChart.id
		this.ctx = params_curveChart.ctx
	    this.category_field = params_curveChart.category_field
	    this.sub_category_field = params_curveChart.sub_category_field
	    this.numerical_field = params_curveChart.numerical_field
	    this.title_x_axis = params_curveChart.title_x_axis
	    this.title_y_axis = params_curveChart.title_y_axis
		this.type = params_curveChart.type
	    this.responsive = true
	    this.legend_position = params_curveChart.legend_position[0]
	    this.legend_title = params_curveChart.legend_title
	    this.legend_clicked = params_curveChart.legend_clicked
	    this.title = params_curveChart.title
	    this.list_segments_selected = []
	    this.nb_categories = 0
	    this.nb_sous_categories = 0
	    this.fill = params_curveChart.shape.fill
	    this.stackedChart = params_curveChart.stackedChart


	}

	createChart(params_curveChart, sharedParams, data_to_transform) {
		
		var data_filtred = this.prepare_data_p1(params_curveChart, sharedParams, data_to_transform)

		this.prepare_data_p2(data_filtred, params_curveChart, sharedParams)

		//if (params_curveChart.instanciator === undefined) {
			var chart_instance = this.init_chart(params_curveChart)
		//}

		params_curveChart.chart_type = "chartJS"

		params_curveChart.instanciator = this

		//add params chart to shared params if no present
		if (sharedParams.params_charts.includes(params_curveChart) === false) {
			sharedParams.params_charts.push(params_curveChart)
		}

	}


	updateChart(params_curveChart, sharedParams) {
		var data_filtred = this.prepare_data_p1(params_curveChart, sharedParams)

		this.prepare_data_p2(data_filtred, params_curveChart, sharedParams)

		var data_type = "data"; var injection_type = "update"
		this.inject_metadata(params_curveChart.chart_instance, params_curveChart, data_type, injection_type)

	}

	prepare_data_p1(params_chart, sharedParams, data_to_transform) {

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
			data_chuncks = prepare_engage_crossfilter(data_chart, params_chart, filterList, data_chuncks, sharedParams)
			data_chart = data_chuncks
		}

		if (data_chart.length === 0) {
			return data_chart
		}
		//data_chuncks.length > 0 ? data_chart = [...data_chuncks] : {}



	    


	    //zone de regroupements
	    //if one categorical axis, use this groupy method
	    
        var dataset_ChartJS = [];
        var agg_name_lodash = params_chart.numerical_field_params.agg_type + "By";
        var agg_fieldName = params_chart.numerical_field_params.agg_type + "_" + params_chart.numerical_field_params.fieldName
        params_chart.numerical_field_params.agg_fieldName = agg_fieldName
        let groupedItem = _.groupBy(data_chart, record => record[params_chart.category_field] + '_' +
	          record[params_chart.sub_category_field]);
        if (params_chart.numerical_field_params.agg_type === "count") {
	        dataset_ChartJS = _.map(groupedItem, (group, key) => {
	          return {
	            [params_chart.category_field]: group[0][params_chart.category_field],
	            [params_chart.sub_category_field]: group[0][params_chart.sub_category_field],
	            [agg_fieldName]: (group.length)
	          };
	        });
        }
        else {
	        dataset_ChartJS = _.map(groupedItem, (group, key) => {
	          return {
	            [params_chart.category_field]: group[0][params_chart.category_field],
	            [params_chart.sub_category_field]: group[0][params_chart.sub_category_field],
	            [agg_fieldName]: _[agg_name_lodash](group, params_chart.numerical_field_params.fieldName)
	            
	          };
	        });
	    }
        console.log("tps exec lodash: " + (new Date() - d1)/1000)
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





	prepare_data_p2(data_input, params_curveChart, sharedParams) {
		//processus de création d'un nouveau dataset: 
		//params_curveChart.data[1].datasets.push({"label":0, backgroundColor: 'red', data: [39889, 19889, 14889]})
		//répeter l'opération autant de fois qu'il y a de sous-catégories (nb_sous_categories)
					
			if (params_curveChart.list_of_axis.length === 0) {
				params_curveChart.list_of_axis.push(this.category_field); params_curveChart.list_of_axis.push(this.sub_category_field)
			}
			params_curveChart.nb_axis = 2

			//1.obtenir les catégories (les communes par ex)
			var categories = data_input.map(r=> r[this.category_field])
			if (data_input[0].hasOwnProperty(this.category_field + "_decoded")) {
				var categories_decoded = data_input.map(r=> r[this.category_field + "_decoded"])
			}

			//2.obtenir les sous-catégories (la taille des logements par ex: 1p, 2p ...)
			var sous_categories = deduplicate_dict(data_input, this.sub_category_field); sous_categories.sort()
			var nb_categories = categories.length; var nb_sous_categories = sous_categories.length;
	        params_curveChart.nb_categories = categories.length;
	        params_curveChart.nb_sous_categories = sous_categories.length

			//3.création des catégories dans la spec ChartJS (champ labels dans chartJS)
			if (categories_decoded) {
				params_curveChart.data[0].labels.push(categories_decoded)
				params_curveChart.data_input = data_input
			}
			else {params_curveChart.data[0].labels.push(categories)}

			params_curveChart.activ_categories_values = []; params_curveChart.activ_categories_values.push(categories);
			params_curveChart.activ_sub_categories_values = []; params_curveChart.activ_sub_categories_values.push(sous_categories)
			var nb_categories = params_curveChart.data[0].labels[0].length
            


        	if (Object.keys(params_curveChart.backgroundColorArray_source).length === 0) {
        		var i = 0
        		function select_generated_color(backgroundColorArray_source, i) { return backgroundColorArray_source[i].replace("0.65", "1") }
        		var status_colors = "empty";
        		//chech if a color has been generated for the same category field, if so re use it
        		var colored_axis = params_curveChart.sub_category_field
        		if (sharedParams.used_color_schemes.hasOwnProperty(colored_axis) === true) {
	        		var backgroundColorArray_source = generateColors(nb_sous_categories, sharedParams.used_color_schemes[colored_axis], params_curveChart.colorsConfig.colorsOrder, colored_axis, sharedParams)
					sous_categories.map(axis => {
						params_curveChart.backgroundColorArray_source[axis] = select_generated_color(backgroundColorArray_source, i); 
						i++
						} )
        		}
        		else {
	        		var backgroundColorArray_source = generateColors(nb_sous_categories, sharedParams.used_color_schemes[colored_axis], params_curveChart.colorsConfig.colorsOrder, colored_axis, sharedParams)
					sous_categories.map(axis => {
						params_curveChart.backgroundColorArray_source[axis] = select_generated_color(backgroundColorArray_source, i); 
						i++
						} )
        		}
        	}


	        
			//créer les datasets composés des sous_categories, du champ numérique à représenter, des couleurs des barres et leur bordure
	        for (var i = 0; i < nb_sous_categories; i++) {
	        	//1.recupérer la valeur de chaque sous-catégorie (1p, 2p ...)
	        	var sous_categorie = sous_categories[i]

	        	//2.récupérer l'array contenant les data associées à la sous-catégorie
	        	//2.1.filtrer le tableau d'entrée de la sous-catégorie    
	        	var dataset = data_input.filter((item)=> item[this.sub_category_field] === sous_categorie)
	            
	            //2.2.récupérer l'array contenant les data
	            //var data_array = dataset.map(o=> o[params_curveChart.numerical_field_params.agg_fieldName])

	            var data_array = [], dataset_dates = dataset.map(o=> o.date)
	            categories.map(d=> { 
	            	if (dataset_dates.includes(d)) {
	            		var value = dataset.filter(o=> o.date === d).map(v=> v.mean_prix_m2_vente)[0]; 
	            		data_array.push(value)
	            	}
	            	else {data_array.push(0)} 
	            })


	            //3.création des sous-catégories (champ label), data associée (champ data dans ChartJS) et couleurs et bordures dans la spec ChartJS 
	            params_curveChart.data[1].datasets.push({label: sous_categorie, backgroundColor: params_curveChart.backgroundColorArray_source[i],
	            	borderColor: params_curveChart.backgroundColorArray_source[sous_categorie], data: data_array, fill: this.fill, pointStyle: 'circle'})

	        };


			//if the chart is already clicked, preserve the deactivated slices and maintain their color effect (grey or lower opacity)            
			if (params_curveChart.prepare_data_type === "preserve backgroundColor") {

				
			}





			params_curveChart.list_idx_segments_existants = [];
			var list_idx_segments_existants = params_curveChart.list_idx_segments_existants
	        //1.collecter les clés de tous les segments existants
			for (var i = 0; i < (nb_categories); i++) {			

					for (var a = 0; a < (nb_sous_categories); a++) {
						list_idx_segments_existants.push(a + "-" + i)
					}
			}                       

			//.sauvegarder une image des données source avant transformation
			if (params_curveChart.data_source_raw.length === 0) {
				params_curveChart.data_source_raw = data_input
				params_curveChart.data_source[0].labels.push(categories)
		        params_curveChart.data_source[1].datasets = params_curveChart.data[1].datasets

		    }


	}


	init_chart(params_curveChart) {	
		var plugin = {
			id: "CurveChart_legend_handler",
		    beforeDraw: function (chart) {
		    		var this_chart = params_curveChart.chart_instance
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

		var curveChart = new Chart(this.ctx, {
				        type: this.type,
				        data: [],
						options: {
								responsive: true,
								title: this.title,
								tooltips: {
								      mode: 'nearest',
								      intersect: true
								},
								hover: {
									mode: 'nearest',
									intersect: true
								},
								scales: {
									xAxes: [{
										display: true,
										scaleLabel: {
											display: true,
											labelString: this.title_x_axis
										}
									}],
									yAxes: [{
										display: true,
										scaleLabel: {
											display: true,
											labelString: this.title_y_axis
										},
										stacked: this.stackedChart
									}]
								},
								legend : {
									labels : {usePointStyle : true},
				                    onHover: function(e) {
				                        if (e) {
				                      		e.target.style.cursor = 'pointer';
				                     	}
				                      },
				                    onClick: function (evt, item) {
								        //preserve default behaviour on click
								        Chart.defaults.global.legend.onClick.call(this, evt, item)
				                        //register click event
				                        if (evt) {
				                      		params_curveChart.legend_clicked = true
				                     	}			                     	
				                      }									
								}							
						},
				    	plugins: [plugin]						
				      });




		//alimenter avec les labels ET LES DATASETS
		var data_type = "data"; var injection_type = "init"
		this.inject_metadata(curveChart, params_curveChart, data_type, injection_type)

		return curveChart 				
	}


	

	inject_metadata(curveChart, params_curveChart, data_type, injection_type) {
		//alimenter avec les labels
		if (curveChart.config.data.labels.length === 0) {
			curveChart.config.data.labels = [...params_curveChart[data_type][0].labels[0]]
		}


		//alimenter avec les datasets
		if (injection_type === "init") {
			var l = params_curveChart[data_type][1].datasets.length;
			var datasets = [];
			for (var i = 0; i < l; i++) {
				datasets.push(params_curveChart[data_type][1].datasets[i])
				curveChart.config.data.datasets[i] = _.cloneDeep(datasets[i])
			}
			curveChart.config.data.datasets = _.cloneDeep(datasets)
		}
		else if (injection_type === "update") {
			var l = params_curveChart[data_type][1].datasets.length;
			var datasets = [];
			try {
				for (var i = 0; i < l; i++) {
					datasets.push(params_curveChart[data_type][1].datasets[i])
					curveChart.config.data.datasets[i].data = _.cloneDeep(datasets[i].data)
					curveChart.config.data.datasets[i].label = _.cloneDeep(datasets[i].label)
					curveChart.config.data.datasets[i].backgroundColor = _.cloneDeep(datasets[i].backgroundColor)
					curveChart.config.data.datasets[i].borderColor = _.cloneDeep(datasets[i].borderColor)
					curveChart.config.data.datasets[i].borderWidth = _.cloneDeep(datasets[i].borderWidth)

				}
			}
			catch (error) {				
				curveChart.config.data.datasets.push({label: datasets[i].label, data: datasets[i].data, backgroundColor: datasets[i].backgroundColor, borderColor: datasets[i].borderColor, borderWidth: datasets[i].borderWidth})
			}			

		}

		//clean datasets
		curveChart.data.datasets = curveChart.data.datasets.filter(d=> d.label !== "")		


		curveChart.update(750)


		//procedure manuelle pour remmetre les couleurs source
		/*bar1.config.data.datasets[2].backgroundColor = _.cloneDeep(params_bar1_deepCopy.data[1].datasets[2].backgroundColor)*/

		//register the chart instance in the param array
		params_curveChart.chart_instance = curveChart


		return curveChart
	}



	maj_couleurs(curveChart, params_curveChart) {
		//on entre dans cette func pour enlever le focus posé sur les segments

		var nb_categories = params_curveChart.nb_categories;
		var backgroundColorArray = [];

		//parcours catégories
		for (var i = 0; i < nb_categories; i++) {		
			
			//parcours sous-catégories
			var nb_sous_categories = params_curveChart.nb_sous_categories;
			for (var a = 0; a < nb_sous_categories; a++) {
	/*			backgroundColorArray.push(params_curveChart.data[1].datasets[a].backgroundColor[i])*/
				var backgroundColor = params_curveChart.data_source[1].datasets[a].backgroundColor[i];
	/*			var borderColor = params_curveChart.data[1].datasets[a].borderColor[i];*/
				curveChart.config.data.datasets[a].backgroundColor[i] = backgroundColor;
				/*curveChart.config.data.datasets[a].borderColor[i] = "rgba(230, 11, 11, 0)";*/
			}

			/*curveChart.config.data.datasets[i].backgroundColor = backgroundColorArray;*/
			curveChart.update();



		}
	}	

	reset_border_color(this_chart, params_curveChart_deepCopy) {
		/*console.log("entree_zone_blanche"); console.log(this_chart); console.log(params_curveChart_deepCopy);*/

		//remettre config sans bordures
		var nb_categories = params_curveChart_deepCopy.nb_categories;

		//parcours catégories
		for (var i = 0; i < nb_categories; i++) {		
			
			//parcours sous-catégories
			var nb_sous_categories = params_curveChart_deepCopy.nb_sous_categories;
			for (var a = 0; a < nb_sous_categories; a++) {
				this_chart.config.data.datasets[a].borderColor[i] = "rgba(230, 11, 11, 0)";
			};
			
		}

		this_chart.update();

	}





}



