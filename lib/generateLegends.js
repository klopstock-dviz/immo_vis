//legends_setup = [{color: "red", label: 1}, {color: "green", label: 2}, {color: "blue", label: 3}, {color: "yellow", label: 4}, {color: "purple", label: 5}]
//legends_params = {htmlNode: "body", chart_id: "map_1", nb_cells: 5, legends_setup: legends_setup, legend_title: legend_title}

function generateLegends(legends_params, params_chart, sharedParams) {
    
    const body_htmlNode = legends_params.htmlNode
    const chart_id = legends_params.chart_id
    const nb_cells = legends_params.max_cells
    const legends_setup = legends_params.legends_colors_setup
    const legend_title = legends_params.legend_title

    //select the parent element
    var body = d3.select(body_htmlNode)

    //-------------------------create title legend
    //append the title
    body.append("p")
            .attr("class", "legend_title")
            .attr("id", "legend_title_" + chart_id)          
            .attr("style", 'font-family: "helvetica neue"; font-size: 12px; padding-left: 10px')

    //append text
    document.getElementById("legend_title_" + chart_id).innerHTML = legend_title
    //---------------------------------------------


    //-------------------------create legends layout container
    //append the div
    body.append("div")
            .attr("class", "grid-container_legends")
            .attr("id", "grid-container_legends_" + chart_id)          
            .attr("style", 'display: inline-grid; grid-column-gap: 10px; grid-template-columns: auto auto; padding: 2.5px;')

    //--------------------------------------------- 


    //-------------------------create colors container
    //append the div
    var container_legends = d3.select("#grid-container_legends_" + chart_id)
    container_legends.append("div")
            .attr("class", "grid-container_colors")
            .attr("id", "grid-container_colors_" + chart_id)          
            .attr("style", 'display: inline-grid; grid-row-gap: 10px; grid-template-columns: auto; padding: 2.5px;')

    //---------------------------------------------  


    //-------------------------create labels container
    //append the div
    container_legends.append("div")
            .attr("class", "grid-container_labels")
            .attr("id", "grid-container_labels_" + chart_id)          
            .attr("style", 'display: inline-grid; grid-row-gap: 10px; grid-template-columns: auto; padding: 2.5px;') //grid-column-gap: 50px

    //---------------------------------------------  



    //-------------------------create color shapes && labels
    var container_colors = d3.select("#grid-container_colors_" + chart_id)
    var container_labels = d3.select("#grid-container_labels_" + chart_id)
    params_chart.legendColors = []
    for (var i = 0; i < nb_cells; i++) {
      

        //add color
        var color = legends_setup[i].color; var label = legends_setup[i].label
        container_colors.append("div")
        .attr("class", "grid-item")
        .attr("id", chart_id + "_legendColor_" + i)
        .attr("style", "background-color: " +color + "; padding: 2.5px; border-radius: 15%;")//border: 1px solid rgba(0, 0, 0, 0.8)
        .attr("data-label", label)
        .attr("data-rank", i)

        //add content for the auto resizing    
        var colorCell = document.getElementById(chart_id + "_legendColor_" + i); colorCell.innerHTML = "____"; colorCell.style.color = color


        //add click & hover events
        var legend_cell = document.getElementById(chart_id + "_legendColor_" + i);
        legend_cell.addEventListener("click", function(evt){                 
            console.log("click on: " + evt.target)
            legend_selections_choroplethe(evt, params_chart, nb_cells)
        } )
        legend_cell.addEventListener("mouseover", function(evt){                 
            evt.target.style.cursor = "pointer"
        } )



        //add label        
        container_labels.append("div")
        .attr("class", "grid-item")
        .attr("id", chart_id + "_legendLabel_" + i)
        .attr("style", "padding: 2.5px; font-size: 12px; font-family: helvetica neue;")

        //append text
        document.getElementById(chart_id + "_legendLabel_" + i).innerHTML = label


        params_chart.legendColors.push({text: label, color: color})


    }

    


    function legend_selections_choroplethe(evt, params_chart, nb_cells) {
                //multiple selection
                if (evt.ctrlKey) {   
                    
                    var legend_label_selected = evt.target.attributes["data-label"].value
                    var legend_rank_selected = evt.target.attributes["data-rank"].value
                    

                    //check if the legend selected is already in the list of active legends
                    var pos_active_legend = params_chart.selected_legends.indexOf(legend_label_selected) 
                    //if absent, add it & filter the chart
                    if (pos_active_legend === -1) {
                        //add the value of the legend in the list ofactive legends
                        params_chart.selected_legends.push(legend_label_selected)

                        //filter the map
                        filter_map_choroplete(params_chart)

                        //deactivate non selected legends
                        legends_color_management(params_chart, nb_cells)

                        //trigger the crossfiltering process
                        params_chart.legend_clicked = true


                    }
                    //if present, delete it from  the list of active legends
                    else {
                        params_chart.selected_legends.splice(pos_active_legend)

                        //filter the map
                        filter_map_choroplete(params_chart)

                        legends_color_management(params_chart, nb_cells)

                        //trigger the crossfiltering process
                        params_chart.legend_clicked = true

                    }
                }

                //single selection
                else if (evt.ctrlKey === undefined || evt.ctrlKey === false){
                    var legend_label_selected = evt.target.attributes["data-label"].value

                    //if the legend selected is already active, delete it from the list of active legend, in order to restore all active legends
                    var pos_active_legend = params_chart.selected_legends.indexOf(legend_label_selected)
                    if (pos_active_legend > -1) {
                        params_chart.selected_legends = []
                    }


                    //else
                    else {
                        params_chart.selected_legends = []    
                        params_chart.selected_legends.push(legend_label_selected)
                        filter_map_choroplete(params_chart)
                    }


                    //deactivate non selected legends
                    legends_color_management(params_chart, nb_cells)

                    //trigger the crossfiltering process
                    params_chart.legend_clicked = true

                }        
    }


    function filter_map_choroplete(params_chart, legend_label_selected) {
        params_chart.legend_label_selected = legend_label_selected


        params_chart.inject_type = "legends_binding"
        params_chart.data[1].borders = []


        //filter the poly according to the selected legend
        var legend_labels = []
        //in case when hue_field is numerical, handle the domain extent and domain scope params
        if (params_chart.params_fields.hue_params) {

            params_chart.selected_legends.map(o=> {
                //determine the kind of legend value picked: categorical value of binned value
                //check if the value is a numerical class, and contains a " - " separator split the value
                if (o.match(/\b\d{1,}\s\-\s\d{1,}\b/g) !== null) {           
                    //extract useful values
                    var pos_sep = o.indexOf("-"); legend_labels.push({valueMin: parseFloat(o.substring(0, pos_sep)), valueMax: parseFloat(o.substring(pos_sep+1, 20))});
                }
            })
            //params_chart.legends_binding_params = {valueMin: d3.min(legend_labels), valueMax: d3.max(legend_labels)}
            params_chart.legends_binding_params = [...legend_labels]
        }
        //else categorical value
        else if (params_chart.params_fields.color_params) {
            params_chart.legends_binding_params = [...params_chart.selected_legends]    
        }

        //prepare & filter datasets
        var data_filtred = {dataset: params_choroplethe_map1.data[1].datasets, geojson_data: params_choroplethe_map1.data[1].geojson}
        params_chart.instanciator.prepare_data_p2(data_filtred, params_chart, sharedParams)



        //remove existing polygons from the map
        Object.values(params_choroplethe_map1.map_instance._layers).filter(l=> l.hasOwnProperty("_tiles") === false && l.hasOwnProperty("_url") === false).map(l=> {
            params_chart.map_instance.removeLayer(l)
        })



        //load the filtred polygons to the map
        params_chart.map_instance.on('zoomend', function() {
            if (params_chart.inject_type === "legends_binding") {
                params_chart.data[1].polygons_subset_legends.map(p=> {

                    /*var layerGroup = new L.LayerGroup();
                    layerGroup.addTo(params_chart.map_instance);
                    layerGroup.addLayer(p);*/
                
                    p.addTo(params_chart.map_instance)
                })

            }

        })

        //center the map
        if (params_chart.data[1].borders.length > 2) {
            params_chart.map_instance.flyToBounds(params_chart.data[1].borders);
        }
        else {
            params_chart.adjustZoom = true
            params_chart.map_instance.fitBounds(params_chart.data[1].borders);
            setTimeout(() => {
                var CurrentZoom = params_chart.map_instance.getZoom()
                console.log("CurrentZoom: " + CurrentZoom)
                params_chart.map_instance.setZoom(CurrentZoom-1, false)
                console.log("zoom adjusted: " + params_chart.map_instance.getZoom())
            }, 260)
            
        }
        
        params_chart.interaction_type = ""

    }



    function legends_color_management(params_chart, legends_length) {
        //if there is not active legends, restore all the legends
        if (params_chart.selected_legends.length === 0) {
     
            for (var a = 0; a < legends_length; a++) {
                var aa =a//+1
                document.querySelector("#" + params_chart.id + "_legendColor_" +  aa).style.backgroundColor = params_chart.legendColors[a].color;
                document.querySelector("#" + params_chart.id + "_legendColor_" +  aa).style.color = params_chart.legendColors[a].color    
                params_chart.inject_type = "init";


            }
            //restore all faded/hidden polygons
            restore_hidden_polygons(params_chart)            
        }

        else {
            for (var i = 0; i < legends_length; i++) {
                var ii = i//+1              
                var text = document.querySelector("#" + params_chart.id + "_legendColor_" +  ii).attributes["data-label"].value                


                //if the text value assessed is not an active legend, turn it into grey
                if (params_chart.selected_legends.indexOf(text) === -1) {
                    document.querySelector("#" + params_chart.id + "_legendColor_" +  ii).style.backgroundColor = "rgb(220, 222, 220)"
                    document.querySelector("#" + params_chart.id + "_legendColor_" +  ii).style.color = "rgb(220, 222, 220)"
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
                    document.querySelector("#" + params_chart.id + "_legendColor_" +  ii).style.backgroundColor = color_seek
                    document.querySelector("#" + params_chart.id + "_legendColor_" +  ii).style.color = color_seek
                    
                }


            }
        }
    }

    function restore_hidden_polygons(params_chart) {
        //data_input = params_chart.instanciator.prepare_data_p1(params_chart)
        //if (params_chart.legends_status === "restored") {
            //if the map is filtred by another chart, transfert all the filter values to the crossfilter object
            params_chart.inject_type = "restore_polygons"
            if (params_chart.filtered_by.axis !== undefined && Object.keys(params_chart.filtered_by.axis).length > 0) 
                {Object.assign(params_chart.transformations.crossfilter, params_chart.filtered_by.axis)}

            var data_filtred = params_chart.instanciator.prepare_data_p1(params_chart, sharedParams)
            params_chart.instanciator.prepare_data_p2(data_filtred, params_chart, sharedParams)


            console.log("restore legends all")
            params_chart.legends_status = "restored"

            //remove all layers from the map, except the map tile layer it self
            Object.values(params_choroplethe_map1.map_instance._layers).filter(l=> l.hasOwnProperty("_tiles") === false && l.hasOwnProperty("_url") === false).map(l=> {
                params_chart.map_instance.removeLayer(l)
            })

/*Object.values(params_choroplethe_map1.map_instance._layers).map(l=> {
    params_chart.map_instance.removeLayer(l)
})

var layer = new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})
params_chart.map_instance.addLayer(layer)*/


            //load the restored polygons to the map
            params_chart.map_instance.on('zoomend', function() {
              if (params_chart.inject_type === "restore_polygons") {
                params_chart.data[1].polygons.map(p=> {
                   if (p.hasOwnProperty("_layers")) {
                        var layer = Object.values(p._layers);
                        layer[0].feature.properties["show_tooltip"] = true
                    }
                    //addListeners(p, params_chart)
                    /*var layerGroup = new L.LayerGroup();
                    layerGroup.addTo(params_chart.map_instance);
                    layerGroup.addLayer(p);*/



                
                    p.addTo(params_chart.map_instance)
                    params_chart.inject_type = ""
                })

              //save new copy of the layers injected to the map
              params_chart.data[1].polygons_injected = [...Object.values(params_choroplethe_map1.map_instance._layers).filter(l=> l._bounds && l.defaultOptions && l.feature)]
                
                
              }
            })


            //center the map
            if (params_chart.data[1].borders.length > 2) {
                params_chart.map_instance.flyToBounds(params_chart.data[1].borders);
            }
            else {
                params_chart.map_instance.fitBounds(params_chart.data[1].borders);
                var CurrentZoom = params_chart.map_instance.getZoom()
                params_chart.map_instance.setZoom = CurrentZoom-1
            }
            

            /*params_chart.inject_type = "update"
            params_chart.instanciator.inject_metadata(params_chart.map_instance, params_chart)*/
            console.log("restore_hidden_polygons")


        //}

    }

    function addListeners(polygon, params_chart) {
        //manage colors on mouse over
        var _this = this
        polygon.on('mouseover',function(evt) {
            params_chart.instanciator.polygon_animate_colors(evt, params_chart)
            params_chart.instanciator.polygon_display_tooltip(evt, params_chart)
            //path to tooltip: (Object.values(evt.target._eventParents)[0].getTooltip()).getContent()

        });

        polygon.on('mouseout', function(evt) {
            params_chart.instanciator.polygon_reset_colors(evt, params_chart)
        })

        polygon.on("click", function(evt) {
            params_chart.instanciator.polygon_store_selection(evt, params_chart)
        })

        /*//add data propreties
        polygon.options["propreties"] = {[layer_field]: p.polygone.properties[layer_field], [hue_field]: hue_statistical_value}

        //add polygon to main list
        params_chart.data[1].polygons.push(polygon)*/

    }
}    
