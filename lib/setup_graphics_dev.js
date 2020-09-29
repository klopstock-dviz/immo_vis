sharedParams1 = new sharedParams()
//--------------------------------------------
sharedParams1.transformations = {filter: [{field: "INSEE_COM", operation: "include", values: ["33063","64445","64102","33281","64024","64122"]},//'33', '75', '64'
										{field: "nb_pieces", operation: "<", value: 9}, {field: "prix_m2_vente", operation: "<", value: 15000},{field: "taux_rendement_n7", operation: "<", value: 0.2}, {field: "surface", operation: "<", value: 300}]}
sharedParams1.language = "fr"
sharedParams1.prepare_data_source({operational_data: data_annonces_details_ventes, geojson_data: polys})




//instancier nouveau graph 1
params_barChart1 = new param_customSpec_BarChartsJS()

params_barChart1.ctx = ctx_1
params_barChart1.id = "bar1"
params_barChart1.category_field = "INSEE_COM"
//params_barChart1.hierarchy_levels = {0: "REG", 1: "DEP", 2: "INSEE_COM", 3: "CODE_IRIS"}
params_barChart1.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'mean'}
params_barChart1.label_tooltip = "Prix m² mean"
params_barChart1.title[0].text = "title of the chart"
params_barChart1.title_x_axis = 'Communes'
params_barChart1.title_y_axis = "Prix m² mean"
//here you can deactivate the hover & selection effects applied to the chart, by default these effects are activated
/*params_barChart1.interactions_chart_options = {hoverOptions: false, selectionOptions: false}*/
//here you can declare a set of transformations that will be applied to this particular chart
/*params_barChart1.transformations = {filter: [{field: "INSEE_COM", operation: "include", values: ["33281","87085","17306"]},
										{field: "nb_pieces", operation: "<", value: 9}]}*/

var instantiateur_barChart1 = new simple_BarChart(params_barChart1);

//evo
instantiateur_barChart1.createChart(params_barChart1, sharedParams1) //here you can pass a dataset as 2nd parameter, this will override the main dataset of the sharedParams1












//instancier nouvelle map
params_map1 = new params_map()
params_map1.category_field = "INSEE_COM" //used to sync with other charts sharing same cat field, especially in rm crossfilter process
params_map1.htmlNode = document.getElementById('map1')
params_map1.id = "map1"
params_map1.params_fields = {lat: "mapCoordonneesLatitude", lng: "mapCoordonneesLongitude", hue_params: {hue_field: "taux_rendement_n7", hue_color: "interpolateRdYlGn", 
                            domain: ["auto", "p0.98"], domain_scope: "whole_dataset"}}


/*complete parameters for params_fields
params_map1.params_fields = {lat: "mapCoordonneesLatitude", lng: "mapCoordonneesLongitude", hue_params: {hue_field: "taux_rendement_n7", hue_color: "interpolateRdYlGn", 
                            domain: ["auto", "p0.95"]}, opacity_params: {opacity_field: "nb_pieces", domain: ["min", "max"], , domain_scope: "whole_dataset", reverse: true},
                            size_field: "some_field"} */
/*documentaion:
requiered parameters:
  in the hue_params, the hue_field is required, hue_color, domain & domain_scope are not
  the default hue_color is interpolateBlues, other colors from https://github.com/d3/d3-scale-chromatic
  domain represents the extent of the data used to generate the color hue
  for this domain, the p parameter in p0.95 represents percentile, accepted values goes from p0.01 to p0.99
  domain_scope indicates if the data extent for the domain concerns the whole (source, original) dataset, or the dataset which is filtred along the different interactions
  domain_scope accepts 2 parameters: whole_dataset or filtred_dataset

optional parameters:
size_field that accepts numerical values and modify the radius of the circle
opacity_params: 
  opacity_field modify the opacity of the circle (accepts numerical value type), 
  domain: same behaviour than hue params
  reverse: if set true, makes the highest values less opaque, and the lowest values more opaque
*/
params_map1.popup_fields = {6:{fieldName: "taux_rendement_n7" ,textBefore: "Tx de rendement"}, 0:{fieldName: "CODE_IRIS", slice:[0, 5] ,textBefore: "Quartier"}, 1: {fieldName: "prix_bien", textBefore: "Prix du bien", textAfter: " €"},
2: {fieldName: "prix_m2_vente", textBefore: "Prix vente au m²", textAfter: " €"}, 3: {fieldName: "nb_pieces", textBefore: "Nb de pièces"},
4: {fieldName: "surface", textBefore: "Surface", textAfter: " m²"}, 5: {fieldName: "dpeL", textBefore: "DPE"}}
params_map1.title.text = "title of the chart"
params_map1.bounds_adjustment = {adjustment: true, domain: ["p0.05", "p0.95"]} //-> bounds_adjustment param help to exclude the coordinates that are out of the given domain
//here you can declare a set of transformations that will be applied to this particular chart
params_map1.transformations = {filter: [{field: "taux_rendement_n7", operation: ">", value: 0}]}
params_map1.params_legends = {show: true, position: "", shape: "", nb_cells: 8}


var instantiateur_map1 = new Map(params_map1);

//evo
instantiateur_map1.createChart(params_map1, sharedParams1) //here you can pass a dataset as 2nd parameter, this will override the main dataset of the sharedParams1










sharedParams1.setup_crossfilter(sharedParams1)


















sharedParams2 = new sharedParams()
//--------------------------------------------
sharedParams2.transformations = {filter: [{field: "INSEE_COM", operation: "include", values: ["33063","64445","64102","33281","64024","64122"]},//'33', '75', '64'
                    {field: "nb_pieces", operation: "<", value: 9}, {field: "prix_m2_vente", operation: "<", value: 15000},{field: "taux_rendement_n7", operation: "<", value: 0.2}, {field: "surface", operation: "<", value: 300}]}
sharedParams2.language = "fr"
sharedParams2.prepare_data_source({operational_data: data_annonces_details_ventes, geojson_data: polys})




//instancier nouveau graph 1
params_barChart2 = new param_customSpec_BarChartsJS()

params_barChart2.ctx = ctx_5
params_barChart2.id = "bar1"
params_barChart2.category_field = "INSEE_COM"
//params_barChart2.hierarchy_levels = {0: "REG", 1: "DEP", 2: "INSEE_COM", 3: "CODE_IRIS"}
params_barChart2.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'mean'}
params_barChart2.label_tooltip = "Prix m² mean"
params_barChart2.title[0].text = "title of the chart"
params_barChart2.title_x_axis = 'Communes'
params_barChart2.title_y_axis = "Prix m² mean"
//here you can deactivate the hover & selection effects applied to the chart, by default these effects are activated
/*params_barChart2.interactions_chart_options = {hoverOptions: false, selectionOptions: false}*/
//here you can declare a set of transformations that will be applied to this particular chart
/*params_barChart2.transformations = {filter: [{field: "INSEE_COM", operation: "include", values: ["33281","87085","17306"]},
                    {field: "nb_pieces", operation: "<", value: 9}]}*/

var instantiateur_barChart2 = new simple_BarChart(params_barChart2);

//evo
instantiateur_barChart2.createChart(params_barChart2, sharedParams2) //here you can pass a dataset as 2nd parameter, this will override the main dataset of the sharedParams1












//choroplethe map
//instancier nouvelle map
params_choroplethe_map1 = new params_map()

params_choroplethe_map1.htmlNode = document.getElementById('map2')
params_choroplethe_map1.id = "choroplethe_map_1"
params_choroplethe_map1.geographic_priority_layers = {0: "CODE_IRIS", 1: "INSEE_COM"}
//params_choroplethe_map1.geographic_articulation_layers = {0: {levelName: "IRIS", fieldName: "CODE_IRIS"}} 
/*simple configuration: if no articulation needed between different geographic levels, provide a dict of the field names and their display priority, in order to link the geojson input with the operational data set.
advanced configuration: in order to articulate the transition between different geographic levels, provide the levelName and fieldName that will be searched in the propreties of the geojson input file
in this example ( {0: {levelName: "IRIS", fieldName: "CODE_IRIS"}} ), 0 represents the order of the level*/
params_choroplethe_map1.params_fields = {hue_params: {hue_field: "taux_rendement_n7", agg_type: 'mean', hue_color: "interpolateRdYlGn", domain: ["auto", "p0.98"], domain_scope: "whole_dataset"}}
//params_choroplethe_map1.params_fields = {color_params: {color_field: "TYP_IRIS", selection: 'first'}}//, color: "interpolateRdYlGn"


/*documentaion:
requiered parameters:
  hue_params:
  in case when the field used for coloration is a numercial value, the hue_params accept the following parameters:
    hue_field, on which the color is based
    agg_type is required, and accepts all d3 aggregation types, plus "count". hue_color, domain & domain_scope are optional
    the default hue_color is interpolateBlues, other colors from https://github.com/d3/d3-scale-chromatic
    domain represents the extent of the data used to generate the color hue
    for this domain, the p parameter in p0.95 represents percentile, accepted values goes from p0.01 to p0.99
    domain_scope indicates if the data extent for the domain concerns the whole (source, original) dataset, or the dataset which is filtred along the different interactions
    domain_scope accepts 2 parameters: whole_dataset or filtred_dataset

  in case when the field used for coloration is a categorical value, the color_params accept the following parameters:
    color_field, on which the color is based
    an optional selection param, noted "selection", can be passed, with "first" or "last" value. hue_color is optional



opacity_params: 
  opacity_field modify the opacity of the circle (accepts numerical value type), 
  domain: same behaviour than hue params
  reverse: if set true, makes the highest values less opaque, and the lowest values more opaque
*/
params_choroplethe_map1.tooltip_fields = {0:{fieldName: "CODE_IRIS", slice:[0, 15] ,textBefore: "Quartier", selection: "first"},
                                         1:{fieldName: "taux_rendement_n7" ,textBefore: "Tx de rendement", agg_type: "mean", toPrecision: 4},
                                          2:{fieldName: "nb_pieces" ,textBefore: "Nb d'annonces", agg_type: "count", toPrecision: 4},//round: true/false
                                          3:{fieldName: "TYP_IRIS" ,textBefore: "Type IRIS", selection: "first"}}
params_choroplethe_map1.title.text = "title of the chart"
//params_map1.bounds_adjustment = {adjustment: true, domain: ["p0.05", "p0.95"]} //-> bounds_adjustment param help to exclude the coordinates that are out of the given domain
//here you can declare a set of transformations that will be applied to this particular chart
params_choroplethe_map1.transformations = {filter: [{field: "taux_rendement_n7", operation: ">", value: 0}]}
params_choroplethe_map1.params_legends = {show: true, htmlNode: "map2_legends_node", position: "", shape: "", max_cells: 10, toPrecision: 2, filter_params: {mode: "fade", flyToBounds: true,showTooltips: false}}
/*params_legends options:
filter_mode: "fade" -> lower opacity of polygons filtred, "hide" -> hide the polygons filtred
show_tooltip: false -> don't display the tooltips of the filtred polygons

*/
var instantiateur_choroplethe_map1 = new Map_choroplethe(params_choroplethe_map1);

//evo
instantiateur_choroplethe_map1.createChart(params_choroplethe_map1, sharedParams2) //here you can pass a dataset as 2nd parameter, this will override the main dataset of the sharedParams1




sharedParams2.setup_crossfilter(sharedParams2)
