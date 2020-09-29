class Map_choroplethe {

	constructor(params_chart) {
		this.id = params_chart.id
		this.htmlNode = params_chart.htmlNode
	    this.category_field = params_chart.category_field
	    this.numerical_field = params_chart.numerical_field
	    this.label_tooltip = params_chart.label_tooltip
		this.type = params_chart.type
	    this.responsive = true
	    this.title = params_chart.title.text
	    this.list_segments_selected = []
	    this.nb_categories = 0
		

	}

	createChart(params_chart, sharedParams, data_to_transform) {
		
		this.setup_defaults_parameters(params_chart)

		var data_filtred = this.prepare_data_p1(params_chart, sharedParams, data_to_transform)

		this.prepare_data_p2(data_filtred, params_chart, sharedParams)

		params_chart.inject_type = "init"
		
		//if (params_chart.instanciator === undefined) {
			var chart_instance = this.init_chart(params_chart)
		//}

		
		/*if (params_chart.interactions_chart_options.hoverOptions === true) {
			this.add_options_hover(chart_instance, params_chart) }
		if (params_chart.interactions_chart_options.selectionOptions === true) {
			this.addListeners(params_chart.ctx, chart_instance, params_chart) }*/



		//register the instanciator
		params_chart.instanciator = this


		this.setup_legends(params_chart, sharedParams, 'init')


		//add params chart to shared params if no present
		if (sharedParams.params_charts.includes(params_chart) === false) {
			sharedParams.params_charts.push(params_chart)
		}
	}

	

	updateChart(params_chart, sharedParams) {
		var data_filtred = this.prepare_data_p1(params_chart, sharedParams)

		this.prepare_data_p2(data_filtred, params_chart, sharedParams)

		var data_type = "data"; var injection_type = "update"
		this.inject_metadata(params_chart.map_instance, params_chart)

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

			//add the filter parameters to to main filter list
				//1.transform the filterList into an array that we can push in it filter objects
				filterList = Object.values(filterList)
				//2.extract & push the parameters of the initial filter list into the main filter list
				params_chart.transformations.filter.map(e=> filterList.push(e))
				//3.remove the empty fields
				filterList = filterList.filter(l=> l.field !== "")
			
			//if the current filter ID is different from the shared filter id, call the filter function
			//data_chuncks = getFiltredData(data_chart, filterList, params_chart.id)
		}


		//if the state management proccess detected filtering values, prepare & engage the crossfilter here
		if (Object.keys(filterList).length > 0) {
			data_chuncks = prepare_engage_crossfilter(data_chart, params_chart, filterList, data_chuncks, sharedParams)

		}


		//data_chuncks.length > 0 ? data_chart = [...data_chuncks] : {}
		data_chart = [...data_chuncks]


		//if the filter doesn't match any data, jump to the map and show nothing
		if (data_chuncks.length === 0 && params_chart.data[1].borders.length > 0) {			
			params_chart.inject_type = "show_nothing"
			//fly to the borders 
			params_chart.map_instance.flyToBounds(params_chart.data[1].borders);
			//remove previous shapes
			Object.values(params_chart.map_instance._layers).filter(l=> l.hasOwnProperty("_tiles") === false && l.hasOwnProperty("_url") === false).map(l=> {
                params_chart.map_instance.removeLayer(l)
            })
	    	return {dataset: [], geojson_data: []}

		}
		/*else {
			params_chart.inject_type = "show_nothing"
			return {dataset: [], geojson_data: []}
		}*/
	



		//select the fields requiered
		var tooltip_fields = []; Object.keys(params_chart.tooltip_fields).forEach(key => tooltip_fields.push(params_chart.tooltip_fields[key]["fieldName"]));
		var fields = []; Object.assign(fields, tooltip_fields); fields.push(params_chart.params_fields.lat); fields.push(params_chart.params_fields.lng); 
		if (params_chart.params_fields.hue_params) {
			fields.push(params_chart.params_fields.hue_params.hue_field)
		}
		else if (params_chart.params_fields.color_params) {
			fields.push(params_chart.params_fields.color_params.color_field)	
		}
		else {
			console.log("specify hue params ou color params")
			return
		}
		
		var dataset = [...data_chart.map(l=> _.pick(l, fields.filter(f=> f !== undefined)))]
	    


		//filter the geojson data
	    //data source for the bar chart
	    if (params_chart.transformations.dataset === undefined) {
	    	var geojson_data = [...sharedParams.geojson_data]
	    	
	    }
	    else {
	    	var geojson_data = [...params_chart.transformations.dataset]	    	
	    }


	    //check if the filter list contains a useful value
	    var geographic_priority_layers = Object.values(params_chart.geographic_priority_layers)
	    if (Object.values(filterList).length > 0) { var ind_to_filter = filterList.filter(f=> geographic_priority_layers.indexOf(f.field) > -1) } else {var ind_to_filter = []}
	    if (ind_to_filter.length > 0) {
		    filterList.filter(o=> geographic_priority_layers.includes(o.field)).map(f=> {
		        if (f.operation === "include") {
		            geojson_data = geojson_data.filter((item)=> f.values.indexOf(item[f.field]) !== -1)
		        }
		        else if (f.operation === "exclude") {
		            geojson_data = geojson_data.filter((item)=> f.values.indexOf(item[f.field]) === -1)
		        }
		    })	    	
	    }

	    //filter the geojson according to data present in the operationnal dataset
	    const layer_field = params_chart.geographic_priority_layers[0]
	    var operationnal_areas = deduplicate_array(dataset.map(a=> a[layer_field]))
	    geojson_data = geojson_data.filter(function(item) {
		    return operationnal_areas.indexOf(item.CODE_IRIS) !== -1})


	    //params_chart.data[1].polygons.filter(p=> p.options["propreties"][hue_field] < 0.04)

	    
	
	    return {dataset: dataset, geojson_data: geojson_data}

	}




	prepare_data_p2(data_input, params_chart, sharedParams) {
			const layer_field = params_chart.geographic_priority_layers[0]			
			var el; var popup, tooltip; var fieldName; var fieldValue; var p1; var textAfter; var textBefore; var coef_colorHue;
			var opacity; var domain_opacity; var opacity_coef; var hue_color; var strokeColor

			params_chart.nb_axis = 1
			params_chart.category_field = layer_field

			//obtenir les catégories (les communes par ex)





			//in case when hue_field is numerical, handle the domain extent and domain scope params
			if (params_chart.params_fields.hue_params) {
				const hue_field = params_chart.params_fields.hue_params.hue_field;
				params_chart.legends_field = hue_field + "_binned"
				//get min & max values	 
				var domain_hue = params_chart.params_fields.hue_params.domain				

				if (domain_hue === undefined) {domain_hue = ["min", "max"]}

				//---------------------------------------------------get data extent for the hue field
				var domain_scope = params_chart.params_fields.hue_params.domain_scope;
				//if the user specifies to use the whole dataset
				if (domain_scope === "whole_dataset") {
					params_chart.hue_dataset_extent = dataset_extent(domain_hue, sharedParams.data_main, hue_field);
				}
				else if (domain_scope === "filtred_dataset" || domain_scope === undefined) {
					params_chart.hue_dataset_extent = dataset_extent(domain_hue, data_input.dataset, hue_field);
				}			
				var hueMin = params_chart.hue_dataset_extent.min; var hueMax = params_chart.hue_dataset_extent.max; 
				params_chart.params_fields.hue_params.hue_color !== undefined ? hue_color = params_chart.params_fields.hue_params.hue_color : hue_color = "interpolateBlues";
				//---------------------------------------------------
			}

			//in case when hue_field is categorical, handle the domain extent and domain scope params
			else if (params_chart.params_fields.color_params) {
				const color_field = params_chart.params_fields.color_params.color_field;
				params_chart.legends_field = color_field
				var color = params_chart.params_fields.color_params.color; color === undefined ? color = params_chart.params_fields.color_params.color : {};
				var selection = params_chart.params_fields.color_params.selection; selection === undefined ? selection = "first" : {};
				const categories = deduplicate_dict(data_input.dataset, color_field)


				//if the colors are not already set, generate them
				if (params_chart.polygons_colors_setup === undefined) {
					if (sharedParams.used_color_schemes.hasOwnProperty(color_field) === true) {
						var generated_colors = generateColors(nb_sous_categories, sharedParams.used_color_schemes[color_field], "", "", sharedParams) }
					else {
						var generated_colors = generateColors(categories.length, color, "", "", sharedParams);}

					var categories_colors = []
					for (var i = 0; i < categories.length; i++) {
						categories_colors.push({[color_field]: categories[i], color: generated_colors[i]})
					}
					params_chart.polygons_colors_setup = [...categories_colors]
				}
			}









					

			//get data to build polygones, colors and tooltips
			params_chart.data[1].markers = []; params_chart.data[1].popups = []; params_chart.data[1].polygons = []; params_chart.data[1].borders = []; params_chart.data[1].tooltips = [];
			params_chart.legends_config = []; params_chart.data[1].polygons_subset_legends = []

			data_input.geojson_data.map(p=> {

				//in case when the color field is numerical:
				if (params_chart.params_fields.hue_params) {

					//compute the statistical value for the hue color
					var agg_type = params_chart.params_fields.hue_params.agg_type; var hue_field = params_chart.params_fields.hue_params.hue_field;
					var hue_statistical_value = d3[agg_type](data_input.dataset.filter(o=> o[layer_field] === p.polygone.properties[layer_field]), v=> v[hue_field])

					coef_colorHue = ((hue_statistical_value - hueMin) / (hueMax - hueMin)).toPrecision(4);
					var polygonColor = d3[hue_color](coef_colorHue);

					var border = [[p.polygone.bbox[1], p.polygone.bbox[0]], [p.polygone.bbox[3], p.polygone.bbox[2]]];


					//handle the polygon's opacity depending on legends binded or full map
					//here setups for the active polygons
					if (params_chart.inject_type === "legends_binding") {	
						//if (hue_statistical_value >= params_chart.legends_binding_params.valueMin && hue_statistical_value < params_chart.legends_binding_params.valueMax) {
						var inside_interval = params_chart.legends_binding_params.map(o=> {
							if (hue_statistical_value >= o.valueMin && hue_statistical_value < o.valueMax) {return true} else {return false}
						})
						if (inside_interval.filter(r=> r === true)[0] === true) {
							var fillOpacity = 0.7; 
							params_chart.params_legends.filter_params.showTooltips === false ? p.polygone.properties["show_tooltip"] = true : p.polygone.properties["show_tooltip"] = true  
							//collect the bounds of the active polygons
							params_chart.data[1].borders.push(border)
							inside_interval = [false]
						}
						//here setups for the filtred polygons
						else {
							var fillOpacity = 0.2; 
							params_chart.params_legends.filter_params.showTooltips === false ? p.polygone.properties["show_tooltip"] = false : p.polygone.properties["show_tooltip"] = true

							//collect the bounds of the active polygons
							if (params_chart.params_legends.filter_params.flyToBounds === false) {
								params_chart.data[1].borders.push(border)
							}

						}

						var value_to_project = hue_statistical_value; var color_field = hue_field
					}
					else {
						var fillOpacity = 0.7; 
						p.polygone.properties["show_tooltip"] = true
						params_chart.data[1].borders.push(border)
					}

					params_chart.legends_config.push({layer_field: p.polygone.properties[layer_field], hue_statistical_value: hue_statistical_value,  coef_colorHue: coef_colorHue, polygonColor: polygonColor})
				}


				//in case when the color field is categorical:
				else if (params_chart.params_fields.color_params) {
					var color_field = params_chart.params_fields.color_params.color_field;
					var values_to_project = deduplicate_dict(data_input.dataset.filter(v=> v[layer_field] === p.polygone.properties[layer_field]), color_field)
					if (values_to_project.length > 1) {
						console.log("caution, the color field [" + color_field + "] for one of the choroplethe maps contains the multiple values:")
						console.table(values_to_project)
						console.log("only the " + selection + " value will be selected") }
					if (selection === "first") { var value_to_project = values_to_project[0] } else { var selected_value = values_to_project.pop()}


					var polygonColor = params_chart.polygons_colors_setup.filter(c=> c[color_field] === value_to_project)[0].color.replace(", 0.65)", ")")
					var border = [[p.polygone.bbox[1], p.polygone.bbox[0]], [p.polygone.bbox[3], p.polygone.bbox[2]]];
					

					//handle the polygon's opacity depending on legends binded or full map
					//here setups for the active polygons
					if (params_chart.inject_type === "legends_binding") {	
						if (params_chart.legends_binding_params.indexOf(value_to_project) > -1) {
							var fillOpacity = 0.7; 
							params_chart.params_legends.filter_params.showTooltips === false ? p.polygone.properties["show_tooltip"] = true : p.polygone.properties["show_tooltip"] = true  
							//collect the bounds of the active polygons
							params_chart.data[1].borders.push(border)
							
						}
						//here setups for the filtred polygons
						else {
							var fillOpacity = 0.2; 
							params_chart.params_legends.filter_params.showTooltips === false ? p.polygone.properties["show_tooltip"] = false : p.polygone.properties["show_tooltip"] = true

							//collect the bounds of the active polygons
							if (params_chart.params_legends.filter_params.flyToBounds === false) {
								params_chart.data[1].borders.push(border)
							}

						}

					}
					else {
						var fillOpacity = 0.7; 
						p.polygone.properties["show_tooltip"] = true
						params_chart.data[1].borders.push(border)
					}

					
				}



				var myStyle = {
				    "color": "red",
				    "fillColor": polygonColor,
				    "weight": 0.3,
				    "opacity": 1,
				    "fillOpacity": fillOpacity
				};

				

				//manage display
				p.polygone.properties["show_on_map"] = true

				//add hue value to poly properties
				p.polygone.properties[color_field] = value_to_project

				


				//---------------------------------------------------build tooltips
				tooltip = []; el = []; params_chart.data_source[1].tooltips = []
				Object.keys(params_chart.tooltip_fields).forEach(key => { 
					el = [];
					var fieldName = params_chart.tooltip_fields[key]["fieldName"];
					var agg_type = params_chart.tooltip_fields[key]["agg_type"];
					var round = params_chart.tooltip_fields[key]["round"];
					var precision = params_chart.tooltip_fields[key]["toPrecision"];
					var selection = params_chart.tooltip_fields[key]["selection"];
					
					var tooltipValues = data_input.dataset.filter(v=> v[layer_field] === p.polygone.properties[layer_field]).map(v=> v[fieldName]);

					//regroup & aggregate values
					var geTooltipValue = function(tooltipValues, agg_type, round, precision,selection) {
						if (agg_type === 'count') {return tooltipValues.length}
						else if (agg_type && agg_type.length>0) {
							if (round === true) {return Math.round(d3[agg_type](tooltipValues))}
							else if (precision) {return d3[agg_type](tooltipValues).toPrecision(precision)}
						}
						else if (selection) {
							if (selection === undefined || selection === 'first') { tooltipValue = tooltipValues[0] }
							else if (selection === 'last') { tooltipValue = tooltipValues.pop() }
							return tooltipValue
						}
					}


					/*try {
						var tooltipValue = geTooltipValue(tooltipValues, agg_type, round, precision, selection) 
					}
					catch {
						console.log(tooltipValues)
					}*/
					
					if (tooltipValues.length > 0) {
						var tooltipValue = geTooltipValue(tooltipValues, agg_type, round, precision, selection) 
						


						//check if a value is returned, and proccess it
						if (tooltipValue || isFinite(tooltipValue)) {

							textBefore = params_chart.tooltip_fields[key].textBefore + ": "; el.push(textBefore);

							if (params_chart.tooltip_fields[key].slice) {
								fieldValue = tooltipValue.toString().slice(params_chart.tooltip_fields[key].slice[0], params_chart.tooltip_fields[key].slice[1])							
							}
							else {
								fieldValue = tooltipValue.toString()
							}
							el.push(fieldValue)

								
							textAfter = params_chart.tooltip_fields[key].textAfter; el.push(textAfter);
							
							tooltip.push(el.filter(e=> e!== undefined));

						}
						//popup.filter(e=> e!== undefined).map(f=> f + "<br />").join("")
					}

				})

					p1 = tooltip.map(f=> f.map(e=> e).join("")); tooltip = p1.map(f=> f + "<br />").join("")
				
				//---------------------------------------------------





				var polygon = new L.geoJSON(p.polygone, 
						{style: myStyle},
						//{onEachFeature: onEachFeature}
					).bindTooltip(tooltip);



				//manage colors on mouse over
				var _this = this
				polygon.on('mouseover',function(evt) {
					_this.polygon_animate_colors(evt, params_chart)
					_this.polygon_display_tooltip(evt, params_chart)

				});

				polygon.on('mouseout', function(evt) {
					_this.polygon_reset_colors(evt, params_chart)
				})

				polygon.on("click", function(evt) {
					_this.polygon_store_selection(evt, params_chart)
				})

				//add data propreties
				polygon.options["propreties"] = {[layer_field]: p.polygone.properties[layer_field], [color_field]: value_to_project}

				//add polygon to main list
				if (params_chart.inject_type === "legends_binding") {params_chart.data[1].polygons_subset_legends.push(polygon)}
				else {params_chart.data[1].polygons.push(polygon)}


				
			})


			params_chart.data[1].geojson = data_input.geojson_data
			params_chart.data[1].datasets = data_input.dataset

	    			

 
			//.sauvegarder une image des données source avant transformation
			if (params_chart.data_source_raw.length === 0) {
				params_chart.data_source_raw = data_input
				//params_chart.data_source[0].labels.push(categories)
		        params_chart.data_source[1].borders = [...params_chart.data[1].borders]; params_chart.data_source[1].polygons = [...params_chart.data[1].polygons]; 

		    }		

	}


	init_chart(params_chart) {		


		var mymap = new L.map(params_chart.htmlNode).fitBounds([[51.072228, 2.528016], [42.442288, 3.159714]]);

		/*to disable shift key on zoom:
		var mymap = new L.map(params_chart.htmlNode, { boxZoom: false, customBoxZoom: true }).fitBounds([[51.072228, 2.528016], [42.442288, 3.159714]]);*/

		var layer = new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		})
		mymap.addLayer(layer)

		//register the map instance
		params_chart.map_instance = mymap; params_chart.chart_instance = mymap
		params_chart.chart_type = "leaflet"; params_chart.chart_subType ="choroplethe"

		mymap.on('mouseover', function(evt) {
			evt.target
		})

		if (params_chart.inject_type === "init") {
			this.inject_metadata(mymap, params_chart)
		}

		
	



		//init legend
		/*var legend = new params_legend();
		legend.domain = [params_chart.hue_dataset_extent.min, params_chart.hue_dataset_extent.max]*/
		


	}




	inject_metadata(mymap, params_chart, data_type, injection_type, updateTime) {

		//remove previous layer
		if (params_chart.data[1].polygons.length > 0) {
			//Object.values(params_chart.map_instance._layers).filter(l=> l._bounds && l.feature).map(l=> {
            Object.values(params_chart.map_instance._layers).filter(l=> l.hasOwnProperty("_tiles") === false && l.hasOwnProperty("_url") === false).map(l=> {
                params_chart.map_instance.removeLayer(l)
            })

            console.log("remove previous layer")
		}

 
		mymap.on('zoomend', function(e) {
			/*if (params_chart.inject_type === "legends_binding") {
				params_chart.data[1].polygons_subset_legends.map(e=> params_chart.map_instance.addLayer(e))
				params_chart.legends_status = "filtred"
				
			}*/
			var nb_poly_prepared = params_chart.data[1].polygons.length, nb_poly_injected = Object.values(params_chart.map_instance._layers).filter(l=> l._bounds && l.defaultOptions && l.feature).length
			if (params_chart.inject_type === "init" || params_chart.inject_type === "update" && nb_poly_injected < nb_poly_prepared ) {	



			    params_chart.data[1].polygons.map(p=> {				
			    	p.addTo(params_chart.map_instance)
			    })
	
				//save new copy of the layers injected to the map
				params_chart.data[1].polygons_injected = [...Object.values(params_chart.map_instance._layers).filter(l=> l._bounds && l.defaultOptions && l.feature)]

				//params_chart.legends_status = "all"
				//console.log("inject main data")
			    
			}

		});		
		

		

		if (params_chart.inject_type === "init" || params_chart.inject_type === "update") {
			mymap.flyToBounds(params_chart.data[1].borders);
			console.log("flyToBounds")
		}


		setInterval(invalidateSize, 1000)

		function invalidateSize() {
			params_chart.map_instance.invalidateSize()
		}

		

	
	}






	polygon_animate_colors(evt, params_chart) {
		//animate if there is no legends interraction
		if (params_chart.inject_type !== 'legends_binding') {// && (params_chart.list_idx_segments_multiples_selected.length === 0)
			var leaflet_poly_id = evt.target._leaflet_id.toString()
			var poly_opacity = evt.target.options.style.fillOpacity
			//increase opacity of current polygon
			evt.target.setStyle({fillOpacity: 1}); evt.target.setStyle({weight: 0.8})
			
			//set to standard opacity of all other polygons
			Object.keys(params_chart.map_instance._layers).forEach(key => { 
				//target a polygon layer that is not selected by click event
				if (key !== leaflet_poly_id && params_chart.map_instance._layers[key].hasOwnProperty("_layers") && params_chart.map_instance._layers[key].hasOwnProperty("_events") 
					&& params_chart.map_instance._layers[key].hasOwnProperty("_container") === false && params_chart.leaflet_polys_id_selected.indexOf(key) === -1) {
					//console.log(key)
					//if no polygon selected, return to normal opacity of 0.7
					if (params_chart.list_idx_segments_multiples_selected.length === 0) {
						params_chart.map_instance._layers[key].setStyle({fillOpacity: 0.7}); params_chart.map_instance._layers[key].setStyle({weight: 0.3})
					}//if a polygon is selected, return to lower opacity of 0.3
					else {
						params_chart.map_instance._layers[key].setStyle({fillOpacity: 0.3}); params_chart.map_instance._layers[key].setStyle({weight: 0.3})	
					}
				} 
			})
		}
	}

	polygon_reset_colors(evt, params_chart) {
		//reset if there is no legends interraction or no polygon selected
		if (params_chart.inject_type !== 'legends_binding') {// && (params_chart.list_idx_segments_multiples_selected.length === 0)
			//set to standard opacity of all other polygons
			Object.keys(params_chart.map_instance._layers).forEach(key => { 
				//target a polygon layer that is not selected by click event
				if (params_chart.map_instance._layers[key].hasOwnProperty("_layers") && params_chart.map_instance._layers[key].hasOwnProperty("_events") 
					&& params_chart.map_instance._layers[key].hasOwnProperty("_container") === false && params_chart.leaflet_polys_id_selected.indexOf(key) === -1) {
					//console.log(key)
					//if no polygon selected, return to normal opacity of 0.7
					if (params_chart.list_idx_segments_multiples_selected.length === 0) {
						params_chart.map_instance._layers[key].setStyle({fillOpacity: 0.7}); params_chart.map_instance._layers[key].setStyle({weight: 0.3})
					}//if a polygon is selected, return to lower opacity of 0.3
					else {
						params_chart.map_instance._layers[key].setStyle({fillOpacity: 0.3}); params_chart.map_instance._layers[key].setStyle({weight: 0.3})	
					}
				} 
			})		
		}
		else if (params_chart.inject_type === "legends_binding" && evt.type !== "mouseout") {evt.target.setStyle({fillOpacity: 0.7}); evt.target.setStyle({weight: 0.3})}
	}

	polygon_display_tooltip(evt, params_chart) {
		//display the tooltip only if the polygon is not filtred by the legends
		if (evt.target.getTooltip && evt.target._layers && (params_chart.params_legends.show_tooltip === false || params_chart.params_legends.show_tooltip === undefined)) {
			var show_tooltip = Object.values(evt.target._layers); 
			if (show_tooltip[0].feature.properties.hasOwnProperty("show_tooltip") && show_tooltip[0].feature.properties["show_tooltip"] === false) {				
				var toolTip = evt.target.getTooltip();
				if (toolTip) {
				    params_chart.map_instance.closeTooltip(toolTip);
				}
			}
		}
	}

	polygon_store_selection(evt, params_chart) {
		
		//if the click comes from map filtred by legends, and the target is hidden, don't activate the sotre selection process
		if (params_chart.inject_type === "legends_binding" && Object.values(evt.target._layers)[0].feature.properties.show_tooltip === false) {
			return}

		//extract key/value & leaflet id
		var layer_field = params_chart.geographic_priority_layers[0]
		if (evt.target._layers) { 
			var layer = Object.values(evt.target._layers); var selected_value = layer[0].feature.properties[layer_field]
		}
		else {
			var layer = evt.target.feature; var selected_value = layer.properties[layer_field]
		}

		
		var selection = {[layer_field]: [selected_value]};
		var leaflet_poly_id = evt.target._leaflet_id.toString(); 


		//if the same polygon is pressed twice on single selection event, restore initial state
		if ((evt.originalEvent.ctrlKey === undefined || evt.originalEvent.ctrlKey === false) && params_chart.leaflet_polys_id_selected.indexOf(leaflet_poly_id) > -1)	{
			//remove previous values stored
			params_chart.list_idx_segment_single_selected = []; params_chart.list_keys_values_segment_single_selected = []; params_chart.list_labels_segment_single_selected; params_chart.leaflet_polys_id_selected=[]
			params_chart.list_idx_segments_multiples_selected = []; params_chart.list_keys_values_segments_multiples_selected = []; params_chart.list_labels_segments_multiples_selected = [];

			params_chart.instanciator.polygon_reset_colors(evt, params_chart)
			return

		}
		//if the same polygon is pressed twice on multiple selection event, restore initial state
		else if (evt.originalEvent.ctrlKey && params_chart.leaflet_polys_id_selected.indexOf(leaflet_poly_id) > -1)	{
			//get the pos of the selected value & remove it from the arrays
			//1.
			var pos = params_chart.list_idx_segments_multiples_selected.indexOf(selected_value); params_chart.list_idx_segments_multiples_selected.splice(pos, 1); 
			//2.
			//2.1.create an array of the values
			//var values = params_chart.list_idx_segments_multiples_selected.map(o=> o[layer_field][0]);
			var pos = params_chart.list_keys_values_segments_multiples_selected.findIndex(i=> i[layer_field][0] === selected_value); params_chart.list_keys_values_segments_multiples_selected.splice(pos,1)
			//3.
			var pos = params_chart.list_labels_segments_multiples_selected.findIndex(i=> i.category_field === selected_value); params_chart.list_labels_segments_multiples_selected.splice(pos,1);
			//4.
			var pos = params_chart.leaflet_polys_id_selected.indexOf(leaflet_poly_id); params_chart.leaflet_polys_id_selected.splice(pos, 1); 
			//add selection effects by adjusting opacity
			params_chart.leaflet_polys_id_selected.length > 0 ? adjusting_opacity(evt, params_chart) : params_chart.instanciator.polygon_reset_colors(evt, params_chart);

			params_chart.list_idx_segment_single_selected = []; params_chart.list_keys_values_segment_single_selected = []; params_chart.list_labels_segment_single_selected;
			return			
			
		}


		if ((evt.originalEvent.ctrlKey === undefined || evt.originalEvent.ctrlKey === false)) {// && params_chart.list_idx_segments_multiples_selected.length === 0
			
			//remove previous values stored
			params_chart.list_idx_segment_single_selected = []; params_chart.list_keys_values_segment_single_selected = []; params_chart.list_labels_segment_single_selected=[]; params_chart.leaflet_polys_id_selected=[]
			params_chart.list_idx_segments_multiples_selected = []; params_chart.list_keys_values_segments_multiples_selected = []; params_chart.list_labels_segments_multiples_selected = [];

			//save new selection
			params_chart.list_idx_segment_single_selected.push(selected_value); params_chart.list_keys_values_segment_single_selected.push(selection) ; params_chart.list_labels_segment_single_selected.push({category_field: selected_value})
			params_chart.list_idx_segments_multiples_selected.push(selected_value); params_chart.list_keys_values_segments_multiples_selected.push(selection); params_chart.list_labels_segments_multiples_selected.push({category_field: selected_value})

			//save the id of the layer selected
			params_chart.leaflet_polys_id_selected.push(leaflet_poly_id)
			
			//add selection effects by adjusting opacity
			adjusting_opacity(evt, params_chart);
		}
		else if (evt.originalEvent.ctrlKey === true) {
			//remove previous values stored in the single selection listes
			params_chart.list_idx_segment_single_selected = []; params_chart.list_keys_values_segment_single_selected = []; params_chart.list_labels_segment_single_selected = [];			

			//save new selection			
			params_chart.list_idx_segments_multiples_selected.push(selected_value); 						
			params_chart.list_keys_values_segments_multiples_selected.push(selection); 
			params_chart.list_labels_segments_multiples_selected.push({category_field: selected_value})


			//params_chart.list_keys_values_segments_multiples_selected[0][layer_field].push(selected_value)
			
			//save the id of the layer selected
			params_chart.leaflet_polys_id_selected.push(leaflet_poly_id)			

			//add selection effects by adjusting opacity
			adjusting_opacity(evt, params_chart);
		}
		



		function adjusting_opacity(evt, params_chart) {
			//1.increase opacity of the selected polygon
			evt.target.setStyle({fillOpacity: 1}); evt.target.setStyle({weight: 0.7})

			if (params_chart.inject_type !== "legends_binding") {
			//2.reduce opacity of other polygons, excepted the ones already selected		
				Object.keys(params_chart.map_instance._layers).forEach(key => { 
					if (params_chart.leaflet_polys_id_selected.indexOf(key) === -1 && params_chart.map_instance._layers[key].hasOwnProperty("_layers") && params_chart.map_instance._layers[key].hasOwnProperty("_events") 
						&& params_chart.map_instance._layers[key].hasOwnProperty("_container") === false) {
						//console.log(key)
						params_chart.map_instance._layers[key].setStyle({fillOpacity: 0.3}); params_chart.map_instance._layers[key].setStyle({weight: 0.3})
					}
				})
			}
		}
	}





	setup_legends(params_chart, sharedParams, mode) {
		var max_cells = 10; const layer_field = params_chart.geographic_priority_layers[0]
		params_chart.params_legends.max_cells !== undefined ? max_cells = params_chart.params_legends.max_cells : max_cells = 6
		params_chart.params_legends.max_cells !== "" ? max_cells = params_chart.params_legends.max_cells : max_cells = 6

		if (params_chart.params_legends.show !== true) {
			return
		}


		//in case when the color field is numerical:
		if (params_chart.params_fields.hue_params) {
			//binning the legend field
			var binGenerator = d3.histogram()
				  .domain([params_chart.hue_dataset_extent.min, params_chart.hue_dataset_extent.max])// Set the domain to cover the entire intervall [0;]
				  .thresholds(max_cells);  // number of thresholds; this will create 19+1 bins		



			//bin hue values
			var hue_statistical_values = params_chart.legends_config.map(h=> h.hue_statistical_value)
			var array_binned = binGenerator(hue_statistical_values).filter(a=> a.length > 0) ; params_chart.legend_dataset_binned = array_binned

			//build an array of coef colors and extents to feed d3 colors interpolator
			var coef_colors = []
			array_binned.map(a=> {coef_colors.push( {hue_value: d3.mean(a), x0: a.x0, x1: a.x1} ) })

			var legends_colors_setup = [], precision = params_chart.params_legends.toPrecision
			coef_colors.map(c=> { legends_colors_setup.push( {hue_value :c.hue_value, label: (c.x0).toPrecision(precision) + " - " + (c.x1).toPrecision(precision), 
				color: d3.interpolateRdYlGn((c.hue_value - params_chart.hue_dataset_extent.min) / (params_chart.hue_dataset_extent.max - params_chart.hue_dataset_extent.min)) } ) } )

			params_chart.legends_colors_setup = legends_colors_setup
		}

		//in case when the color field is categorical:
		else if (params_chart.params_fields.color_params) {
			const color_field = params_chart.params_fields.color_params.color_field
			var legends_colors_setup = _.cloneDeep(params_chart.polygons_colors_setup)
			legends_colors_setup.map(o=> { o["label"] = o[color_field]; delete o[color_field] })
			
		}			


		//check if a legends container exists, remove it first		
		if (mode === 'update') {
			var legendsContainer = d3.select("#grid-container_legends_" + params_chart.id)
			legendsContainer.remove()	

		}

		//create the legends
		var legends_params = {htmlNode: "#"+params_chart.params_legends.htmlNode, chart_id: params_chart.id, max_cells: legends_colors_setup.length, 
			legends_colors_setup: legends_colors_setup, legend_title: "Tx rendement"}
		generateLegends(legends_params, params_chart, sharedParams)
	


      

        //add listener for collecting legend values
        /*var cells = document.querySelector("#map1_legends_svg > g > g")
        //if (mode === 'init') {
	        cells.addEventListener("click", function(evt){ 

		        //mode multiple_selection
		        if (evt.ctrlKey && evt.srcElement.id !== "legends_circle_oversee") {   
		        	params_chart.params_datapoints.circling_datapoints = false
		        	var legend_text_selected = evt.target.nextSibling.innerHTML;
		        	

		        	//check if the legend selected is already in the list of active legends
		        	var pos_active_legend = params_chart.selected_legends.indexOf(legend_text_selected) 
		        	//if absent, add it & filter the chart
		        	if (pos_active_legend === -1) {
		        		//add the value of the legend in the list ofactive legends
			        	params_chart.selected_legends.push(legend_text_selected)

			        	//filter the map
			        	//var mode = "multiple_selection"
			        	filter_map(params_chart, legend_text_selected, mode)

			        	//deactivate non selected legends
			        	legends_color_management(params_chart, array_binned.length)



		        	}
		        	//if present, delete it from  the list of active legends
		        	else {
		        		params_chart.selected_legends.splice(pos_active_legend)

			        	//filter the map
			        	filter_map(params_chart, legend_text_selected)

		        		legends_color_management(params_chart, array_binned.length)
		        	}
		        }

		        else if (evt.type === "click" && evt.srcElement.id !== "legends_circle_oversee"){
		        	params_chart.params_datapoints.circling_datapoints = false
		        	var legend_text_selected = evt.target.nextSibling.innerHTML;
		        	

	        		//add the value of the legend in the list ofactive legends
		        	

		        	//if the legend selected is already active, delete it from the list of active legend, in order to restore all active legends
		        	var pos_active_legend = params_chart.selected_legends.indexOf(legend_text_selected)
		        	if (pos_active_legend > -1) {
		        		params_chart.selected_legends = []
		        	}
		        	else {
		        		params_chart.selected_legends = []	
		        		params_chart.selected_legends.push(legend_text_selected)
		        	}

		        	//filter the map
		        	//var mode = "multiple_selection"
		        	filter_map(params_chart, legend_text_selected)

		        	//deactivate non selected legends
		        	legends_color_management(params_chart, array_binned.length)



		        }

	        } )*/
	    //}


	        function filter_map(params_chart, legend_text_selected) {
	        	//format the value of the selected legend text
	        	var filter_field = params_chart.params_fields.hue_params.hue_field + "_binned";

	        	//build the data_input based on the legend(s) selected
	        	var data_input = []
		        //if legends are active, filter the data source
		        if (params_chart.selected_legends.length > 0) {
		        	params_chart.selected_legends.map(l=> {
		        		var filter_value = l.replace(" ", "").replace(" ", "")
				        params_chart.transformations.crossfilter = {[filter_field]: [filter_value]}

				        //if the map is filtred, transfert all the values to the crossfilter object
				        if (params_chart.filtered_by.axis !== undefined && Object.keys(params_chart.filtered_by.axis).length > 0) 
				        	{Object.assign(params_chart.transformations.crossfilter, params_chart.filtered_by.axis)}

			        	var data_filtred = params_chart.instanciator.prepare_data_p1(params_chart, sharedParams)
			        	data_input = data_input.concat(data_filtred)
		        	})
		        }
		        else {
			        //if the map is filtred, transfert all the values to the crossfilter object
			        if (params_chart.filtered_by.axis !== undefined && Object.keys(params_chart.filtered_by.axis).length > 0) 
			        	{Object.assign(params_chart.transformations.crossfilter, params_chart.filtered_by.axis)}

		        	data_input = params_chart.instanciator.prepare_data_p1(params_chart, sharedParams)
		        }




	        	
	        	
	        	params_chart.interaction_type = "legends"
	        	params_chart.selected_legends.length > 0 ? params_chart.params_datapoints.circles_color_mode = "discrecte_color" : params_chart.params_datapoints.circles_color_mode = "continuous_color"
	        	params_chart.instanciator.prepare_data_p2(data_input, params_chart, sharedParams)
	        	params_chart.instanciator.inject_metadata(params_chart.map_instance, params_chart)
	        	params_chart.interaction_type = ""

	        }


	        function legends_color_management(params_chart, legends_length) {
	            //if there is not active legends, restore all the legends
	            if (params_chart.selected_legends.length === 0) {
	         
		        	for (var a = 0; a < legends_length; a++) {
		        		var aa =a+1
			            document.querySelector("#map1_legends_svg > g > g > g:nth-child(" + aa + ") > rect").style.fill = params_chart.legendColors[a].color	

			        }
		        }

		        else {
			        for (var i = 0; i < legends_length; i++) {
			        	var ii = i+1	          
			            var text = document.querySelector("#map1_legends_svg > g > g > g:nth-child(" + ii + ") > text").innerHTML
			            var color = document.querySelector("#map1_legends_svg > g > g > g:nth-child(" + ii + ") > rect").style.fill


			            //if the text value assessed is not an active legend, turn it into grey
			            if (params_chart.selected_legends.indexOf(text) === -1) {
			            	document.querySelector("#map1_legends_svg > g > g > g:nth-child(" + ii + ") > rect").style.fill = "rgb(220, 222, 220)"
			            }
			            //else set it's original color
			            else {
			            	var color_seek = params_chart.legendColors.map(l=> {
			            		if (text === l.text) {
			            			var col = l.color
			            			return l.color	
			            		}
			            		//text === l.text ? color = l.color : {} 
			            	}).filter(c=> c !== undefined)[0]
			            	document.querySelector("#map1_legends_svg > g > g > g:nth-child(" + ii + ") > rect").style.fill = color_seek
			            	
			            }


			        }
			    }
        }






	}


	exclusion_extrem_coordinates(params_chart ,data_input, domain) {

		//extraire liste des  latitudes
		var lat_p = getPercentiles(data_input, domain, params_chart.params_fields.lat); var lat_p0 = lat_p.p0; var lat_p1 = lat_p.p1;
		//extraire liste des  longitudes
		var lng_p = getPercentiles(data_input, domain, params_chart.params_fields.lng); var lng_p0 = lng_p.p0; var lng_p1 = lng_p.p1;


		function getPercentiles(data_input, domain, col) {
			if (domain[0] === "auto" || domain[0] === 0 || domain[0] === "min") {
				var p0 = d3.min(data_input.map(e=> e[col]))
			}
			else if (typeof(domain[0]) === "string") {
				if (domain[0].indexOf("p") > -1) {
					var quartil = domain[0]
					quartil = parseFloat(quartil.replace("p",""))
					var p0 = Quartile(data_input.map(e=> e[col]), quartil)
				}
			};

			//check if a max domain is provided, if no pick up the max value of the bin_field
			if (domain[1] === "auto" || domain[1] === "max") {
				var p1 = d3.max(data_input.map(e=> e[col]))
			}
			else if (typeof(domain[1]) === "string") {
				if (domain[1].indexOf("p") > -1) {
					var quartil = domain[1]
					quartil = parseFloat(quartil.replace("p",""))
					var p1 = Quartile(data_input.map(e=> e[col]), quartil)
				}
			}

			return {p0: p0, p1: p1}
		}


		//filtrer la liste sur les coordonées > au p0 et < au p1
		var list_lat_lng = data_input.filter(e=> (e[params_chart.params_fields.lat] >= lat_p0 && e[params_chart.params_fields.lat] <= lat_p1) && (e[params_chart.params_fields.lng] >= lng_p0 && e[params_chart.params_fields.lng] <= lng_p1)) 

		return list_lat_lng

	}

	setup_defaults_parameters(params_chart) {
		if (params_chart.params_fields.hue_params) {
			params_chart.params_fields.hue_params.domain === undefined ? params_chart.params_fields.hue_params.domain = ["min", "max"] : {}
		}		
		params_chart.params_fields.color_mode === undefined ? params_chart.params_fields.color_mode = "continuous_color" : params_chart.params_fields.color_mode = "continuous_color"
		params_chart.params_legends.max_cells === undefined ? params_chart.params_legends.max_cells = 6 : {}
		params_chart.params_legends.show === undefined ? params_chart.params_legends.show = true : {}
	}


}

function dataset_extent(domain, dataset, hue_field) {
	if (domain[0] === "auto" || domain[0] === 0 || domain[0] === "min") {
		var min = d3.min(dataset, o=> o[hue_field])
	}
	else if (typeof(domain[0]) === "string") {
		if (domain[0].indexOf("p") > -1) {
			var quartil = domain[0]
			quartil = parseFloat(quartil.replace("p",""))
			var min = Quartile(dataset.map(o=> o[hue_field]), quartil)
		}
	};

	//check if a max domain is provided, if no pick up the max value of the bin_field
	if (domain[1] === "auto" || domain[1] === "max") {
		var max = d3.max(dataset, o=> o[hue_field])
	}
	else if (typeof(domain[1]) === "string") {
		if (domain[1].indexOf("p") > -1) {
			var quartil = domain[1]
			quartil = parseFloat(quartil.replace("p",""))
			var max = Quartile(dataset.map(o=> o[hue_field]), quartil)
		}
	}

	return {min: min, max: max}
}


   function load_d3_legend()
   {
      var head= document.getElementsByTagName('head')[0];
      var script= document.createElement('script');
      script.src= 'https://cdnjs.cloudflare.com/ajax/libs/d3-legend/2.25.6/d3-legend.min.js';
      head.appendChild(script);
   }