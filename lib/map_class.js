class Map {

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
	    this.hovered_points = {previous: "", current: ""}
	    this.legends_points = {previous: "", current: ""}


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




		//select the fields requiered
		var popup_fields = []; Object.keys(params_chart.popup_fields).forEach(key => popup_fields.push(params_chart.popup_fields[key]["fieldName"]));
		var fields = []; Object.assign(fields, popup_fields); fields.push(params_chart.params_fields.lat); fields.push(params_chart.params_fields.lng); fields.push(params_chart.params_fields.hue_params.hue_field)
		data_chart = [...data_chart.map(l=> _.pick(l, fields))]
	    

        //trier tableau
        if (data_chart.length > 20000) {
        	var dataset = [...data_chart.slice(1, 2000)]
        }
        else {
        	var dataset = [...data_chart]
        }

	    
	    function round_values(dataset, agg_fieldName) {
	    	for (var d = 0; d < dataset_ChartJS.length; d++) {	        
	            dataset[d][agg_fieldName] = Math.round(dataset[d][agg_fieldName] * 100) / 100
	        };
	        return dataset
	    }

	    return dataset

	}




	prepare_data_p2(data_input, params_chart) {
			const hue_field = params_chart.params_fields.hue_params.hue_field;
			const size_field = params_chart.params_fields.size_field; 
			var opacity_field = undefined
			params_chart.params_fields.opacity_params !== undefined ? opacity_field = params_chart.params_fields.opacity_params.opacity_field : opacity_field = undefined;
			var data_circle; var circleColor; var circleSize; var x_y; var el; var popup; var fieldName; var fieldValue; var p1; var textAfter; var textBefore; var coef_colorHue;
			var size_coef; const radius = 25; var opacity; var domain_opacity; var circleOpacity; var opacity_coef; var hue_color

			params_chart.nb_axis = 1
			params_chart.category_field = ""

			//obtenir les catégories (les communes par ex)


			//get min & max values	 
			var domain_hue = params_chart.params_fields.hue_params.domain
			opacity_field !== undefined ? domain_opacity = params_chart.params_fields.opacity_params.domain : domain_opacity = ["min", "max"];

			if (domain_hue === undefined) {domain_hue = ["min", "max"]}
			if (domain_opacity === undefined) {domain_opacity = ["min", "max"]}

			params_chart.hue_dataset_extent = dataset_extent(domain_hue, data_input, hue_field);

			params_chart.opacity_dataset_extent = dataset_extent(domain_opacity, data_input, opacity_field);
			
			var hueMin = params_chart.hue_dataset_extent.min; var hueMax = params_chart.hue_dataset_extent.max; 
			params_chart.params_fields.hue_params.hue_color !== undefined ? hue_color = params_chart.params_fields.hue_params.hue_color : hue_color = "interpolateBlues";

			var opacityMin = params_chart.opacity_dataset_extent.min; var opacityMax = params_chart.opacity_dataset_extent.max;
			
			
			//bounds_adjustment
			if (params_chart.bounds_adjustment.adjustment === true) {
				data_input = this.exclusion_extrem_coordinates(params_chart ,data_input, params_chart.bounds_adjustment.domain)
			}

			//get data to build popup & data points to project
			params_chart.data[1].markers = []; params_chart.data[1].popups = []; params_chart.data[1].x_y = []; 
			data_input.map(r=> {
				//form x y coord
				x_y = [r[params_chart.params_fields.lat], r[params_chart.params_fields.lng]]; 
				//form popup msg
				popup = []; el = [];
				Object.keys(params_chart.popup_fields).forEach(key => { 
					el = [];
					fieldName = params_chart.popup_fields[key]["fieldName"];
					if (r[fieldName]) {

						textBefore = params_chart.popup_fields[key].textBefore + ": "; el.push(textBefore);

						if (params_chart.popup_fields[key].slice) {
							fieldValue = r[fieldName].toString().slice(params_chart.popup_fields[key].slice[0], params_chart.popup_fields[key].slice[1])							
						}
						else {
							fieldValue = r[fieldName].toString()
						}
						el.push(fieldValue)

							
						textAfter = params_chart.popup_fields[key].textAfter; el.push(textAfter);
						
						popup.push(el.filter(e=> e!== undefined));

					}
					//popup.filter(e=> e!== undefined).map(f=> f + "<br />").join("")


				});

				p1 = popup.map(f=> f.map(e=> e).join("")); popup = p1.map(f=> f + "<br />").join("")
				



				//form the data circle
				//setup the color
				coef_colorHue = ((r[hue_field] - hueMin) / (hueMax - hueMin)).toPrecision(4);
				circleColor = d3[hue_color](coef_colorHue);

				//form the radius
				if (size_field === undefined) {
					circleSize = radius;
					size_coef = 1
				}
				else {
					size_coef = r[size_field]
					circleSize = size_coef * radius
				}
				
				//setup the opacity				
				if (opacity_field === undefined) {
					circleOpacity = 1;
				}
				else {
					circleOpacity = ((r[opacity_field] - opacityMin) / (opacityMax - opacityMin)).toPrecision(4);
					params_chart.params_fields.opacity_params.reverse === true ? circleOpacity = 1 - circleOpacity: {}
				}
				
				data_circle = new L.circle(x_y, circleSize, {
					color: circleColor,
					weight: 0.5,
					fillColor: circleColor,
					fillOpacity: circleOpacity
				}).bindTooltip(popup);
				data_circle.options.size_field = size_field; data_circle.options.size_coef = size_coef
				
				params_chart.data[1].markers.push(data_circle); 
				params_chart.data[1].popups.push(popup); 
				params_chart.data[1].x_y.push(x_y)

			})

			params_chart.data[1].datasets = data_input

	    			

 
			//.sauvegarder une image des données source avant transformation
			if (params_chart.data_source_raw.length === 0) {
				params_chart.data_source_raw = data_input
				//params_chart.data_source[0].labels.push(categories)
		        params_chart.data_source[1].markers = data_input; params_chart.data_source[1].popups = [...params_chart.data[1].popups]; params_chart.data_source[1].x_y = [...params_chart.data[1].x_y]; 

		    }		

	}


	init_chart(params_chart) {		

		var mymap = L.map(params_chart.htmlNode).fitBounds([[51.072228, 2.528016], [42.442288, 3.159714]]);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(mymap);

		//------------init layerGroup
		//cercle fictif
		/*var cercle = new L.circle([51.520, -0.11], 2, {
			color: "white",
			weight: 1,
			fillColor: "white",
			fillOpacity: 1
		});
		list_markers.push(cercle);*/


		var layerGroup1 = this.inject_metadata(mymap, params_chart)




	}




	inject_metadata(mymap, params_chart, data_type, injection_type, updateTime) {

		/*if (params_chart.layer) {
			params_chart.layerGroup_instance.removeLayer(params_chart.layer)
		}*/


		var layer = params_chart.data[1].markers
		var layerGroup1 = L.layerGroup(layer);		

		layerGroup1.addTo(mymap);

		layerGroup1.eachLayer(function (layer) {
		    if (layer instanceof L.Circle) {
		      layer.setRadius(20);
		    }
		})


		//register the map instance
		params_chart.map_instance = mymap
		params_chart.chart_type = "leaflet"


		params_chart.layerGroup_instance = layerGroup1
		params_chart.layer = layer


		mymap.on('zoomend', function() {
			//get current zoom
		    let zoom = mymap.getZoom();
		    //const size_field = params_chart.params_fields.size_field;
		    adapt_tailleCercles(layerGroup1, zoom); //, size_field
		});		
	

		

		setTimeout(()=> {
			mymap.flyToBounds(params_chart.data[1].x_y);	
		}, 2000
			)
		

		return layerGroup1

	
	}





	maj_couleurs(Map, params_chart) {
		//on entre dans cette func pour enlever le focus posé sur les segments

		var nb_categories = params_chart.nb_categories;
		var backgroundColorArray = [];

		//parcours catégories
		for (var i = 0; i < nb_categories; i++) {		
			
				var backgroundColor = params_chart.backgroundColorArray_source[Map.config.data.labels[i]];

				Map.config.data.datasets[0].backgroundColor[i] = backgroundColor;
				Map.config.data.datasets[0].borderColor[i] = "white";
				Map.config.data.datasets[0].borderWidth[i] = 2

			/*Map.config.data.datasets[i].backgroundColor = backgroundColorArray;*/
		}
		Map.update();
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
