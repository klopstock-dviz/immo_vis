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
		

	}

	createChart(params_chart, data_to_transform) {
		
		this.setup_defaults_parameters(params_chart)

		var data_filtred = this.prepare_data_p1(params_chart, data_to_transform)

		this.prepare_data_p2(data_filtred, params_chart)

		var chart_instance = this.init_chart(params_chart)


		
		/*if (params_chart.interactions_chart_options.hoverOptions === true) {
			this.add_options_hover(chart_instance, params_chart) }
		if (params_chart.interactions_chart_options.selectionOptions === true) {
			this.addListeners(params_chart.ctx, chart_instance, params_chart) }*/



		//register the instanciator
		params_chart.instanciator = this


		this.setup_legends(params_chart, 'init')


		//add params chart to shared params
		sharedParams.params_charts.push(params_chart)
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
			data_chuncks = getFiltredData(data_chart, filterList, params_chart.id)
		}


		//if the state management proccess detected filtering values, prepare & engage the crossfilter here
		if (Object.keys(filterList).length > 0) {
			data_chuncks = prepare_engage_crossfilter(data_chart, params_chart, filterList, data_chuncks)

		}


		data_chuncks.length > 0 ? data_chart = [...data_chuncks] : {}





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
			params_chart.legends_field = hue_field + "_binned"
			const size_field = params_chart.params_fields.size_field; 
			var opacity_field = undefined
			params_chart.params_fields.opacity_params !== undefined ? opacity_field = params_chart.params_fields.opacity_params.opacity_field : opacity_field = undefined;
			var data_circle; var circleColor; var circleSize; var x_y; var el; var popup; var fieldName; var fieldValue; var p1; var textAfter; var textBefore; var coef_colorHue;
			var size_coef; const radius = 5; var opacity; var domain_opacity; var circleOpacity; var opacity_coef; var hue_color; var strokeColor

			params_chart.nb_axis = 1
			//params_chart.category_field = ""

			//obtenir les catégories (les communes par ex)


			//get min & max values	 
			var domain_hue = params_chart.params_fields.hue_params.domain
			opacity_field !== undefined ? domain_opacity = params_chart.params_fields.opacity_params.domain : domain_opacity = ["min", "max"];

			if (domain_hue === undefined) {domain_hue = ["min", "max"]}
			if (domain_opacity === undefined) {domain_opacity = ["min", "max"]}





			//get data extent for the hue field
			var domain_scope = params_chart.params_fields.hue_params.domain_scope;
			//if the user specifies to use the whole dataset
			if (domain_scope === "whole_dataset") {
				params_chart.hue_dataset_extent = dataset_extent(domain_hue, sharedParams.data_main, hue_field);
			}
			else if (domain_scope === "filtred_dataset" || domain_scope === undefined) {
				params_chart.hue_dataset_extent = dataset_extent(domain_hue, data_input, hue_field);
			}			
			var hueMin = params_chart.hue_dataset_extent.min; var hueMax = params_chart.hue_dataset_extent.max; 
			params_chart.params_fields.hue_params.hue_color !== undefined ? hue_color = params_chart.params_fields.hue_params.hue_color : hue_color = "interpolateBlues";






			//get data extent for the opacity field
			var domain_scope
			params_chart.params_fields.opacity_params !== undefined ? domain_scope = params_chart.params_fields.opacity_params.domain_scope : domain_scope = undefined;
			//if the user specifies to use the whole dataset
			if (domain_scope === "whole_dataset") {
				params_chart.opacity_dataset_extent = dataset_extent(domain_opacity, sharedParams.data_main, opacity_field);
			}
			else if (domain_scope === "filtred_dataset" || domain_scope === undefined) {
				params_chart.opacity_dataset_extent = dataset_extent(domain_opacity, data_input, opacity_field);
			}
			var opacityMin = params_chart.opacity_dataset_extent.min; var opacityMax = params_chart.opacity_dataset_extent.max;
			




			
			//bounds_adjustment
			if (params_chart.bounds_adjustment.adjustment === true) {
				var essai = this.exclusion_extrem_coordinates(params_chart ,data_input, params_chart.bounds_adjustment.domain)
				if (essai.length > 0) {
					data_input = [...essai]
				}
			}

			//get data to build popup & data points for projection
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


				//if the process is fired by legends selection, take the color registred in the 				
				if (params_chart.params_datapoints.circles_color_mode === "discrecte_color") {

					var hue_value = r[hue_field]					
				
					circleColor = params_chart.legendColors.filter(e=> hue_value >= e.x0 && hue_value < e.x1).map(c=> c.color)[0]
				}
				else if (params_chart.params_datapoints.circles_color_mode === "continuous_color") {
					circleColor = d3[hue_color](coef_colorHue);
				}

				//circleColor = d3[hue_color](coef_colorHue);

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
				
				//setup stroke color
				params_chart.params_datapoints.circleColor === "red" ? strokeColor = "red" : strokeColor = circleColor


				data_circle = new L.circleMarker(x_y, {
					radius: circleSize,
					color: strokeColor,
					weight: 0.3,
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
		        params_chart.data_source[1].markers = data_input; params_chart.data_source[1].popups = [...params_chart.data[1].popups]; 
		        params_chart.data_source[1].borders = [...params_chart.data[1].x_y]; 

		    }		

	}


	init_chart(params_chart) {		

		var mymap = new L.map(params_chart.htmlNode).fitBounds([[51.072228, 2.528016], [42.442288, 3.159714]]);


		var layer = new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		})
		mymap.addLayer(layer)

		//------------init layerGroup
		//cercle fictif
		/*var cercle = new L.circle([51.520, -0.11], 2, {
			color: "white",
			weight: 1,
			fillColor: "white",
			fillOpacity: 1
		});
		list_markers.push(cercle);*/

		//register the map instance
		params_chart.map_instance = mymap
		params_chart.chart_type = "leaflet"
		params_chart.chart_subType = "points"



		var layerGroup1 = this.inject_metadata(mymap, params_chart)

	



		//init legend
		/*var legend = new params_legend();
		legend.domain = [params_chart.hue_dataset_extent.min, params_chart.hue_dataset_extent.max]*/
		


	}




	inject_metadata(mymap, params_chart, data_type, injection_type, updateTime) {

		/*if (params_chart.layer) {
			params_chart.layerGroup_instance.removeLayer(params_chart.layer)
		}*/

		//remove previous layer
		if (params_chart.layer) {
		//retrieve the layer stored in the params_map
			var layer = params_chart.layer
			var layerGroup1 = params_chart.layerGroup_instance
			layer.map(l => layerGroup1.removeLayer(l))		
		}

		//Creating a layer group

		//init the layer group
		var layer = [...params_chart.data[1].markers]
		var layerGroup1 = L.layerGroup(layer);		



		params_chart.layerGroup_instance = layerGroup1
		params_chart.layer = [...params_chart.data[1].markers]


		mymap.on('moveend', function(e) {
		   layerGroup1.addTo(mymap);
		});		

		mymap.flyToBounds(params_chart.data[1].x_y);

		mymap.on('zoomend', function() {
			//get current zoom
		    let zoom = mymap.getZoom();
		    //const size_field = params_chart.params_fields.size_field;
		    //adapt_tailleCercles(layerGroup1, zoom); //, size_field
		});
				




		

		return layerGroup1

	
	}





	setup_legends(params_chart, mode) {
		var nb_cells = 6
		if (params_chart.params_legends.show !== true) {
			return
		}


		//binning the legend field
		params_chart.params_legends.nb_cells !== undefined ? nb_cells = params_chart.params_legends.nb_cells : nb_cells = 6
		params_chart.params_legends.nb_cells !== "" ? nb_cells = params_chart.params_legends.nb_cells : nb_cells = 6
		var binGenerator = d3.histogram()
			  .domain([params_chart.hue_dataset_extent.min, params_chart.hue_dataset_extent.max])// Set the domain to cover the entire intervall [0;]
			  .thresholds(nb_cells);  // number of thresholds; this will create 19+1 bins

		var arr_to_bin = params_chart.data[1].datasets.map(h=> h[params_chart.params_fields.hue_params.hue_field])
		var array_binned = binGenerator(arr_to_bin); array_binned = array_binned.filter(a=> a.length > 0)






		//check if a legends container exists, remove it first		
		if (mode === 'update') {
			var legendsContainer = d3.select(".legendSequential")
			legendsContainer.remove()
		}


		var svg = d3.select("#map1_legends_svg")
		//generate the legends
         var sequentialScale = d3.scaleSequential(d3.interpolateRdYlGn)
           .domain([params_chart.hue_dataset_extent.min, params_chart.hue_dataset_extent.max]);

         

         svg.append("g")
           .attr("class", "legendSequential")
           .attr("transform", "translate(20,20)");

         var legendSequential = d3.legendColor()
             .shapeWidth(30)
             .cells(array_binned.length)
             .orient("vertical")
             .scale(sequentialScale)
             .labelFormat(d3.format(".2f"))
              //.useClass(true)
              .title("Rendement")

         svg.select(".legendSequential")
           .call(legendSequential);
                   




        //adjust colors & fonts
        params_chart.legendColors = []
        for (var i = 0; i < array_binned.length; i++) {
        	var ii = i+1
            var text = document.querySelector("#map1_legends_svg > g > g > g:nth-child(" + ii + ") > text")

            //adjust colors according to the data extent
            var color = d3.interpolateRdYlGn( ( d3.mean(array_binned[i]) - params_chart.hue_dataset_extent.min) / (params_chart.hue_dataset_extent.max - params_chart.hue_dataset_extent.min))
            document.querySelector("#map1_legends_svg > g > g > g:nth-child(" + ii + ") > rect").style.fill = color

            //adjust fonts
            text.style.fontFamily = "helvetica neue";
            text.style.fontSize = "12px"


            var round_factor; var value_to_round = array_binned[i].x1
            if (value_to_round < 1) {round_factor = 1000}
            else if (value_to_round < 100) {round_factor = 100}
            else {round_factor = 1}

            var l2 = Math.floor(value_to_round*round_factor)/round_factor; var l2_100 = l2/100;
            var data = Math.floor(array_binned[i].x0*round_factor)/round_factor + ' - ' + Math.floor((l2 - l2_100)*round_factor)/round_factor
            text.innerHTML = data + " %";

            //register the color scale in the params            
            params_chart.legendColors.push({x0: array_binned[i].x0, x1: array_binned[i].x1, color: color, text: data})

            //add listener to show cursor above the legend colors
            var cell = document.querySelector("#map1_legends_svg > g > g > g:nth-child(" + ii + ") > rect")
			cell.addEventListener("mouseover", function(evt){ 			        	
				evt.target.style.cursor = "pointer"
			} )

			//change width of the cell
			cell.width.baseVal.value = 25
        }


//remove extra useless cells
var legendCells = d3.select(".legendCells"); var count = legendCells._groups[0][0].childElementCount
for (var i = 0; i < count; i++) {
	ii = i+1
	if (document.querySelector("#map1_legends_svg > g > g > g:nth-child(" + ii + ") > text").innerHTML.includes(" - ") === false) {
		document.querySelector("#map1_legends_svg > g > g > g:nth-child(" + ii + ") > text").remove()
		document.querySelector("#map1_legends_svg > g > g > g:nth-child(" + ii + ") > rect").remove()
	}
}

        var legendCells = d3.select(".legendCells")
        var transform = legendCells._groups[0][0].lastElementChild.getAttribute('transform'); var y = parseFloat(transform.substring(transform.indexOf("(0, ")+4).replace(")", "")) + 40
        legendCells.append('g')
        	.attr('class', "cell")
        	.attr('id', "legends_circle_container")
        	.attr("transform", "translate(0, " + y + ")")
  			.attr("width", 50)
            .attr("height", 50);        	

        var legends_circle_container = d3.select("#legends_circle_container")
        legends_circle_container.append('circle')
        	.attr("id", "legends_circle_oversee")
        	.attr("transform", "translate(5,0)")
        	.attr('cx', "10")
        	.attr('cy', "10")
        	.attr('r', "10")
        	.attr('stroke', "red")
        	//.attr('color', "red")
        	.attr('fill', "white")


        legends_circle_container.append("text")
        	.attr("class", "label")
        	.attr("id", "legends_circle_oversee_label_container")
        	.attr("transform", "translate( 38, -8)") 


        var legends_circle_oversee_label_container = d3.select("#legends_circle_oversee_label_container")
        legends_circle_oversee_label_container.append("tspan")
        	//.attr("class", "label")
        	.attr("id", "legends_circle_oversee_label_l1")
        	//.attr("transform", "translate( 33, 12.5)") 
        	.attr("style", 'font-family: "helvetica neue"; font-size: 12px')
        	.attr("x", "0")
        	.attr("dy", "1.2em")

        var text1, text2
        if (sharedParams.language === "en") {text1 = "Circle the"; text2 = "data points"}
        else if (sharedParams.language === "fr") {text1 = "Entourer les"; text2 = "données"}
        document.getElementById('legends_circle_oversee_label_l1').innerHTML = text1

        legends_circle_oversee_label_container.append("tspan")
        	//.attr("class", "label")
        	.attr("id", "legends_circle_oversee_label_l2")
        	//.attr("transform", "translate( 33, 12.5)") 
        	.attr("style", 'font-family: "helvetica neue"; font-size: 12px')
        	.attr("x", "0")
        	.attr("dy", "1.2em")

        document.getElementById('legends_circle_oversee_label_l2').innerHTML = text2




        

        var legends_circle_oversee = document.getElementById('legends_circle_oversee')
		legends_circle_oversee.addEventListener("mouseover", function(evt){ 			        	
			evt.target.style.cursor = "pointer"
		} )

		legends_circle_oversee.addEventListener("click", function(evt){

					//filter the data & pass parameter for red circling the data points
					if (params_chart.params_datapoints.circling_datapoints === false) {
						params_chart.params_datapoints.circleColor = "red"
						filter_map(params_chart); params_chart.params_datapoints.circling_datapoints = true
					}
					else {
						params_chart.params_datapoints.circleColor = ""
						filter_map(params_chart); params_chart.params_datapoints.circling_datapoints = false
					}
					
		})


      

        //add listener for collecting legend values
        var cells = document.querySelector("#map1_legends_svg > g > g")
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

                        //trigger the crossfiltering process
                        params_chart.legend_clicked = true			        	


		        	}
		        	//if present, delete it from  the list of active legends
		        	else {
		        		params_chart.selected_legends.splice(pos_active_legend)

			        	//filter the map
			        	filter_map(params_chart, legend_text_selected)

		        		legends_color_management(params_chart, array_binned.length)
                        
                        //trigger the crossfiltering process
                        params_chart.legend_clicked = true		        		
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

                    //trigger the crossfiltering process
                    params_chart.legend_clicked = true

		        }

	        } )

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

			        	var data_filtred = params_chart.instanciator.prepare_data_p1(params_chart)
			        	data_input = data_input.concat(data_filtred)
		        	})
		        }
		        else {
			        //if the map is filtred, transfert all the values to the crossfilter object
			        if (params_chart.filtered_by.axis !== undefined && Object.keys(params_chart.filtered_by.axis).length > 0) 
			        	{Object.assign(params_chart.transformations.crossfilter, params_chart.filtered_by.axis)}

		        	data_input = params_chart.instanciator.prepare_data_p1(params_chart)
		        }




	        	
	        	
	        	params_chart.interaction_type = "legends"
	        	params_chart.selected_legends.length > 0 ? params_chart.params_datapoints.circles_color_mode = "discrecte_color" : params_chart.params_datapoints.circles_color_mode = "continuous_color"
	        	params_chart.instanciator.prepare_data_p2(data_input, params_chart)
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
		params_chart.params_fields.hue_params.domain === undefined ? params_chart.params_fields.hue_params.domain = ["min", "max"] : {}
		params_chart.params_datapoints.circling_datapoints === undefined ? params_chart.params_datapoints.circling_datapoints = false : {}
		params_chart.params_datapoints.circleColor === undefined ? params_chart.params_datapoints.circleColor = "" : {}
		params_chart.params_datapoints.circles_color_mode === undefined ? params_chart.params_datapoints.circles_color_mode = "continuous_color" : params_chart.params_datapoints.circles_color_mode = "continuous_color"
		params_chart.params_legends.nb_cells === undefined ? params_chart.params_legends.nb_cells = 6 : {}
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