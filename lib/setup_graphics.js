function setup_graphics(communes_selected) {

    //-----------------------------------------

    //--------------------------------------------
    //--------------------------------------------
    sharedParams.transformations = {filter: [{field: "INSEE_COM", operation: "include", values: communes_selected}, 
    {field: "nb_pieces", operation: "<", value: 7}, {field: "prix_m2_vente", operation: "<", value: 15000}, 
    {field: "taux_rendement_n7", operation: "<", value: 0.2}, {field: "surface", operation: "<", value: 300}]}
    sharedParams.language = "fr"
    sharedParams.prepare_data_source({operational_data: data_annonces_details_ventes, geojson_data: polys})

    sharedParams.data_main.map(r=> {r.taux_rendement_n7 = r.taux_rendement_n7 * 100})





    //instancier nouveau graph 1
    params_barChart1 = new param_customSpec_BarChartsJS()

    params_barChart1.ctx = ctx_1
    params_barChart1.id = "bar1"
    params_barChart1.category_field = "INSEE_COM"
    //params_barChart1.hiearchy_levels = {0: "REG", 1: "DEP", 2: "INSEE_COM", 3: "CODE_IRIS"}
    params_barChart1.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'median'}
    params_barChart1.label_tooltip = "Prix m² mean"
    params_barChart1.title[0].text = "Prix de vente au m²"
    params_barChart1.title_x_axis = 'Communes'
    params_barChart1.title_y_axis = "Prix m² mean"
    params_barChart1.decode = true
    //here you can deactivate the hover & selection effects applied to the chart, by default these effects are activated
    /*params_barChart1.interactions_chart_options = {hoverOptions: false, selectionOptions: false}*/
    //here you can declare a set of transformations that will be applied to this particular chart
    /*params_barChart1.transformations = {filter: [{field: "INSEE_COM", operation: "include", values: ["33281","87085","17306"]},
                        {field: "nb_pieces", operation: "<", value: 9}]}*/

    var instantiateur_barChart1 = new simple_BarChart(params_barChart1);

    //evo
    instantiateur_barChart1.createChart(params_barChart1) //here you can pass a dataset as 2nd parameter, this will override the main dataset of the sharedParams




    //simple label
    /*params_label1 = new params_label()
    params_label1.htmlNode = 'r2c1'
    params_label1.prefix = "Population"
    params_label1.data_params = {join_field_source: "INSEE_COM", dataset_target: data_stats_insee_com, join_field_target: "CODGEO", value_field_target: "P17_POP", selection: "sum"}
    params_label.id = 'label1'

    var instantiateur_label1 = new Label(params_label1)
    instantiateur_label1.createLabel(params_label1)*/




  params_barChart6 = new param_customSpec_BarChartsJS()

  params_barChart6.id = "stackedBar1"
  params_barChart6.ctx = ctx_2
  params_barChart6.category_field = "surface"
  params_barChart6.sub_category_field = "nb_pieces"
  params_barChart6.numerical_field = "count"
  params_barChart6.label_tooltip = "nb de logements"
  params_barChart6.title[0].text = "Nb de logements selon la taille"
  params_barChart6.title_x_axis = 'classes de surfaces'
  params_barChart6.title_y_axis = "Nb de log"
  params_barChart6.legend_title = "Nb pieces"
  params_barChart6.colorsConfig = {scheme: "interpolateRainbow", colorsOrder: ""}
  params_barChart6.bin_params = {bin: true, agg_type: "count", domain: [0, "p0.95"], thresholds: 10} //p for percentile
  params_barChart6.selection_params = {selection_mode: "filter", selection_field: "sub_category_field", highlight_mode: "all"} //highlight_mode: "one" don't work on classes with negative values


  var instantiateur_barChart6 = new stacked_barChart(params_barChart6);


  instantiateur_barChart6.createChart(params_barChart6)











//instancier nouvelle map
params_map1 = new params_map()
params_map1.category_field = "INSEE_COM" //used to sync with other charts sharing same cat field, especially in rm crossfilter process
params_map1.htmlNode = document.getElementById('map1');
params_map1.id = "map1"
params_map1.params_fields = {lat: "mapCoordonneesLatitude", lng: "mapCoordonneesLongitude", hue_params: {hue_field: "taux_rendement_n7", hue_color: "interpolateRdYlGn", 
                            domain: ["auto", "p0.98"], domain_scope: "whole_dataset"}}
params_map1.popup_fields = {6:{fieldName: "taux_rendement_n7" ,textBefore: "Taux de rendement", textAfter: " %"}, 0:{fieldName: "CODE_IRIS", slice:[0, 5] ,textBefore: "Quartier"}, 1: {fieldName: "prix_bien", textBefore: "Prix du bien", textAfter: " €"},
2: {fieldName: "prix_m2_vente", textBefore: "Prix vente au m²", textAfter: " €"}, 3: {fieldName: "nb_pieces", textBefore: "Nb de pièces"},
4: {fieldName: "surface", textBefore: "Surface", textAfter: " m²"}, 5: {fieldName: "dpeL", textBefore: "DPE"}}
params_map1.title.text = "title of the chart"
params_map1.bounds_adjustment = {adjustment: true, domain: ["p0.05", "p0.95"]} //-> bounds_adjustment param help to exclude the coordinates that are out of the given domain
//here you can declare a set of transformations that will be applied to this particular chart
params_map1.transformations = {filter: [{field: "taux_rendement_n7", operation: ">", value: 0}]}
params_map1.params_legends = {show: true, position: "", shape: "", nb_cells: 8}


var instantiateur_map1 = new Map(params_map1);

//evo
instantiateur_map1.createChart(params_map1) //here you can pass a dataset as 2nd parameter, this will override the main dataset of the sharedParams









    

    //group label
    params_labelGroup1 = new params_label()
    params_labelGroup1.htmlNode = 'labelGroup1'
    params_labelGroup1.id = 'labelGroup1'
    params_labelGroup1.title = 'Population'
    params_labelGroup1.nb_of_columns = 6
    params_labelGroup1.labels_data_params = [
                                            {shared_params: {join_field_source: "INSEE_COM", join_field_target: "CODGEO", dataset_target: data_stats_insee_com}},
                                            {id: 'Population_label1', prefix: 'Habitants', data_params: {value_field_target: "P17_POP", selection: "sum"}},
                                            
                                            {id: 'Population_label2', prefix: 'Croissance démographique', suffix: '%',
                                              data_params: {operation: {function: function(arguments) {return ( ((arguments.yearN - arguments.yearN_1)/arguments.yearN_1)*100 ).toFixed(2) }, 
                                              arguments: {yearN: "P17_POP", yearN_1: "P12_POP"}, selection: "mean" } } },
                                              {id: 'Population_label3', prefix: 'Nb ménages', data_params: {value_field_target: "P17_MEN", selection: "sum"}}
                                            ]

    var instantiateur_labelGroup1 = new LabelGroup(params_labelGroup1)
    instantiateur_labelGroup1.createLabel(params_labelGroup1)


    function adjust_display_card() {
      document.querySelector("#card_labelGroup1").style.display = "inline-grid";
    }
    setInterval(adjust_display_card, 5)


    //group label
    params_labelGroup2 = new params_label()
    params_labelGroup2.htmlNode = 'labelGroup2'
    params_labelGroup2.id = 'labelGroup2'
    params_labelGroup2.title = 'Economie'
    params_labelGroup2.nb_of_columns = 6
    params_labelGroup2.labels_data_params = [
                                            {shared_params: {join_field_source: "INSEE_COM", join_field_target: "CODGEO", dataset_target: data_stats_insee_com}},
                                            {id: 'Economie_label1', prefix: 'Revenu par ménage', data_params: {value_field_target: "MED17", selection: "mean"}},
                                            {id: 'Economie_label2', prefix: 'Tx chômage', suffix: '%',
                                              data_params: {operation: {function: (arguments)=> {return ( (arguments.a1/arguments.a2)*100 ).toFixed(2) }, 
                                              arguments: {a1: "P17_CHOM1564", a2: "P17_ACT1564"}, selection: "median" } } },
                                              {id: 'Economie_label3', prefix: 'Tx pauvreté', suffix: '%',  data_params: {value_field_target: "TP6017", selection: "mean"}}
                                            ]

    var instantiateur_labelGroup2 = new LabelGroup(params_labelGroup2)
    instantiateur_labelGroup2.createLabel(params_labelGroup2)


    function adjust_display_card2() {
      document.querySelector("#card_labelGroup2").style.display = "inline-grid";
    }
    setInterval(adjust_display_card2, 5)    



    //group label
    params_labelGroup3 = new params_label()
    params_labelGroup3.htmlNode = 'labelGroup3'
    params_labelGroup3.id = 'labelGroup3'
    params_labelGroup3.title = 'Logements'
    params_labelGroup3.nb_of_columns = 6
    params_labelGroup3.labels_data_params = [
                                            {shared_params: {join_field_source: "INSEE_COM", join_field_target: "CODGEO", dataset_target: data_stats_insee_com}},
                                            {id: 'logements_label1', prefix: 'Nb de logements', data_params: {value_field_target: "P17_LOG", selection: "sum"}},
                                            {id: 'logements_label2', prefix: 'Tx vacance', suffix: '%',
                                              data_params: {operation: {function: (arguments)=> {return ( (arguments.a1/arguments.a2)*100 ).toFixed(2) }, 
                                              arguments: {a1: "P17_LOGVAC", a2: "P17_LOG"}, selection: "mean" } } },
                                              {id: 'logements_label3', prefix: 'Occupants propriétaires',  data_params: {value_field_target: "P17_RP_PROP", selection: "sum"}}
                                            ]

    var instantiateur_labelGroup3 = new LabelGroup(params_labelGroup3)
    instantiateur_labelGroup3.createLabel(params_labelGroup3)


    function adjust_display_card3() {
      document.querySelector("#card_labelGroup2").style.display = "inline-grid";
    }
    setInterval(adjust_display_card3, 5)    








  params_scatterChart1 = new params_scatterChart()

  params_scatterChart1.id = "scatter1"
  params_scatterChart1.ctx = ctx_3
  ctx_3.style = 'position: absolute'
  params_scatterChart1.x_field = "surface"
  params_scatterChart1.y_field = "taux_rendement_n7"
  params_scatterChart1.category_field = 'dpeL'
  params_scatterChart1.transformations = {filter: [{field: "taux_rendement_n7", operation: ">", value: 0}, {field: "taux_rendement_n7", operation: "<", value: 20}, 
  {field: "dpeL", operation: "include", values: ["0", "A", "B", "C", "D", "E", ,"F", "G"]}, {field: "surface", operation: "<", value: 200}
  ]}
  
  params_scatterChart1.shape = {type: 'scatter'} // for area set options: {'area', fill: 'origin'}. you can set the following fill options: '+2' to fill to upper dataset, 
  params_scatterChart1.label_tooltip = [{field_title: "dpeL", as: "DPE"}, {field_detail: "surface", as: "Surface"}, {field_detail: "taux_rendement_n7", as: "Taux de rendement"}]
  params_scatterChart1.title = "Tx de rendement selon la surface"
  params_scatterChart1.title_x_axis = 'Surface'
  params_scatterChart1.title_y_axis = "Taux rendement"
  params_scatterChart1.legend_title = ""
  params_scatterChart1.colorsConfig = {scheme: "", colorsOrder: ""}
  params_scatterChart1.selection_params.brush.mode = 'endEvent'
  //params_scatterChart1.decode = true

  var instantiateur_scatterChart1 = new scatterChart(params_scatterChart1);

  //préparer la var data à injecter dans le chart
  instantiateur_scatterChart1.createChart(params_scatterChart1)

  var htmlNode1 = document.getElementById('brush1')
  brush_scatterPlot(params_scatterChart1, htmlNode1)






















/*
    //instancier nouveau graph 1
    params_barChart2 = new param_customSpec_BarChartsJS()

    params_barChart2.ctx = ctx_4
    params_barChart2.id = "bar2"
    params_barChart2.category_field = "INSEE_COM"
    //params_barChart2.hiearchy_levels = {0: "REG", 1: "DEP", 2: "INSEE_COM", 3: "CODE_IRIS"}
    params_barChart2.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'median'}
    params_barChart2.label_tooltip = "Prix m² mean"
    params_barChart2.title[0].text = "Prix de vente au m²"
    params_barChart2.title_x_axis = 'Communes'
    params_barChart2.title_y_axis = "Prix m² mean"
    params_barChart2.decode = true
    //params_barChart2.transformations = {filter: [{field: "INSEE_COM", operation: "include", values: ["33281","87085","17306"]},
                        {field: "nb_pieces", operation: "<", value: 9}]}

    var instantiateur_barChart2 = new simple_BarChart(params_barChart2);

    //evo
    instantiateur_barChart2.createChart(params_barChart2) //here you can pass a dataset as 2nd parameter, this will override the main dataset of the sharedParams









//instancier nouveau graph 1
var params_pieChart1 = new param_customSpec_PieChartsJS()
params_pieChart1.type = "doughnut"
params_pieChart1.ctx = ctx_5
params_pieChart1.id = "pieChart1"
params_pieChart1.category_field = "nb_pieces"
params_pieChart1.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'count'}
params_pieChart1.label_tooltip = "Nb de logements"
params_pieChart1.title[0].text = "Nb de logements"
params_pieChart1.decode = true

//préparer la var data à injecter dans le chart
var instantiateur_pieChart1 = new PieChart(params_pieChart1);
instantiateur_pieChart1.createChart(params_pieChart1)







//choroplethe map
//instancier nouvelle map
params_choroplethe_map1 = new params_map()

params_choroplethe_map1.htmlNode = document.getElementById('map2');
params_choroplethe_map1.id = "choroplethe_map_1"
params_choroplethe_map1.geographic_priority_layers = {0: "CODE_IRIS", 1: "INSEE_COM"}
//params_choroplethe_map1.geographic_articulation_layers = {0: {levelName: "IRIS", fieldName: "CODE_IRIS"}} 

params_choroplethe_map1.params_fields = {hue_params: {hue_field: "taux_rendement_n7", agg_type: 'mean', hue_color: "interpolateRdYlGn", domain: ["auto", "p0.98"], domain_scope: "whole_dataset"}}
//params_choroplethe_map1.params_fields = {color_params: {color_field: "TYP_IRIS", selection: 'first'}}//, color: "interpolateRdYlGn"


params_choroplethe_map1.tooltip_fields = {0:{fieldName: "CODE_IRIS", slice:[0, 15] ,textBefore: "Quartier", selection: "first"},
                                         1:{fieldName: "taux_rendement_n7" ,textBefore: "Tx de rendement", agg_type: "mean", toPrecision: 4},
                                          2:{fieldName: "nb_pieces" ,textBefore: "Nb d'annonces", agg_type: "count", toPrecision: 4},//round: true/false
                                          3:{fieldName: "TYP_IRIS" ,textBefore: "Type IRIS", selection: "first"}}
params_choroplethe_map1.title.text = "title of the chart"
//params_map1.bounds_adjustment = {adjustment: true, domain: ["p0.05", "p0.95"]} //-> bounds_adjustment param help to exclude the coordinates that are out of the given domain
//here you can declare a set of transformations that will be applied to this particular chart
params_choroplethe_map1.transformations = {filter: [{field: "taux_rendement_n7", operation: ">", value: 0}]}
params_choroplethe_map1.params_legends = {show: true, htmlNode: "map2_legends_node", position: "", shape: "", max_cells: 10, toPrecision: 2, filter_params: {mode: "fade", flyToBounds: true,showTooltips: false}}

var instantiateur_choroplethe_map1 = new Map_choroplethe(params_choroplethe_map1);

//evo
instantiateur_choroplethe_map1.createChart(params_choroplethe_map1) //here you can pass a dataset as 2nd parameter, this will override the main dataset of the sharedParams









  params_scatterChart1 = new params_scatterChart()

  params_scatterChart1.id = "scatter1"
  params_scatterChart1.ctx = ctx_3
  ctx_3.style = 'position: absolute'
  params_scatterChart1.x_field = "surface"
  params_scatterChart1.y_field = "taux_rendement_n7"
  params_scatterChart1.category_field = 'dpeL'
  params_scatterChart1.transformations = {filter: [{field: "taux_rendement_n7", operation: ">", value: 0}, {field: "taux_rendement_n7", operation: "<", value: 20}, 
  {field: "dpeL", operation: "include", values: ["0", "A", "B", "C", "D", "E", ,"F", "G"]}, {field: "surface", operation: "<", value: 200}
  ]}
  
  params_scatterChart1.shape = {type: 'scatter'} // for area set options: {'area', fill: 'origin'}. you can set the following fill options: '+2' to fill to upper dataset, 
  params_scatterChart1.label_tooltip = [{field_title: "INSEE_COM", as: "Commune"}, {field_detail: "surface", as: "Surface"}, {field_detail: "taux_rendement_n7", as: "Taux de rendement"}, {field_detail: "dpeL", as: "DPE"}]
  params_scatterChart1.title = "Tx de rendement selon la surface"
  params_scatterChart1.title_x_axis = 'Surface'
  params_scatterChart1.title_y_axis = "Taux rendement"
  params_scatterChart1.legend_title = ""
  params_scatterChart1.colorsConfig = {scheme: "", colorsOrder: ""}
  params_scatterChart1.selection_params.brush.mode = 'endEvent'
  //params_scatterChart1.decode = true

  var instantiateur_scatterChart1 = new scatterChart(params_scatterChart1);

  //préparer la var data à injecter dans le chart
  instantiateur_scatterChart1.createChart(params_scatterChart1)

  var htmlNode1 = document.getElementById('brush1')
  brush_scatterPlot(params_scatterChart1, htmlNode1)
*/


    


    
    sharedParams.setup_crossfilter()
}



