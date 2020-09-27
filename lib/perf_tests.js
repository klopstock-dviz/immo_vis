//class for registering the shared parameters for the charts (colors ...)
sharedParams.transformations = {filter: [{field: "nb_pieces", operation: "<", value: 9}, {field: "prix_m2_vente", operation: "<", value: 15000}]}


sharedParams.prepare_data_source(data_annonces_details_ventes)


//instancier nouveau graph 1
params_barChart1 = new param_customSpec_BarChartsJS()

params_barChart1.ctx = ctx_1
params_barChart1.id = "bar1"
params_barChart1.category_field = "REG"
params_barChart1.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'median'}
params_barChart1.label_tooltip = "Prix m² median"
params_barChart1.title[0].text = "title of the chart"
params_barChart1.title_x_axis = 'Communes'
params_barChart1.title_y_axis = "Prix m² median"
//here you can deactivate the hover & selection effects applied to the chart, by default these effects are activated
/*params_barChart1.interactions_chart_options = {hoverOptions: false, selectionOptions: false}*/
//here you can declare a set of transformations that will be applied to this particular chart
/*params_barChart1.transformations = {filter: [{field: "REG", operation: "include", values: ["33281","87085","17306"]},
										{field: "nb_pieces", operation: "<", value: 9}]}*/

var instantiateur_barChart1 = new simple_BarChart(params_barChart1);

//evo
instantiateur_barChart1.createChart(params_barChart1) //here you can pass a dataset as 2nd parameter, this will override the main dataset of the sharedParams






//bar 2 params
//instancier nouveau graph 1
params_barChart2 = new param_customSpec_BarChartsJS()

params_barChart2.id = "groupedBar1"
params_barChart2.ctx = ctx_2
params_barChart2.category_field = "REG"
params_barChart2.sub_category_field = "nb_pieces"
params_barChart2.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'median'}
params_barChart2.label_tooltip = "Prix m² median"
params_barChart2.title[0].text = "title of the chart"
params_barChart2.title_x_axis = 'Communes'
params_barChart2.title_y_axis = "Prix m² median"
params_barChart2.legend_title = "Nb pieces"
params_barChart2.colorsConfig = {scheme: "interpolateRainbow", colorsOrder: ""}


var instantiateur_barChart2 = new grouped_barChart(params_barChart2);

//préparer la var data à injecter dans le chart
instantiateur_barChart2.createChart(params_barChart2)










//instancier nouveau graph 3
params_barChart3 = new param_customSpec_BarChartsJS()

params_barChart3.ctx = ctx_3
params_barChart3.colorsConfig = {scheme: "interpolateRdYlGn", colorsOrder: "reverse"}
params_barChart3.id = "bar2"
params_barChart3.category_field = "dpeL"
params_barChart3.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'median'}
params_barChart3.label_tooltip = "Prix m² median"
params_barChart3.title[0].text = "title of the chart"
params_barChart3.title_x_axis = 'DPE'
params_barChart3.title_y_axis = "Prix m² median"


var instantiateur_barChart3 = new simple_BarChart(params_barChart3);

instantiateur_barChart3.createChart(params_barChart3)








//instancier nouveau graph 4
params_barChart4 = new param_customSpec_BarChartsJS()

params_barChart4.ctx = ctx_4
params_barChart4.id = "bar4"
params_barChart4.category_field = "typedebien"
params_barChart4.numerical_field_params = {fieldName: 'flag_ligne', agg_type: 'count'}
params_barChart4.label_tooltip = "NB de logements"
params_barChart4.title[0].text = "title of the chart"
params_barChart4.title_x_axis = 'Type de bien'
params_barChart4.title_y_axis = "Nb de logements"


var instantiateur_barChart4 = new simple_BarChart(params_barChart4);


instantiateur_barChart4.createChart(params_barChart4)






//instancier nouveau graph 1
var params_pieChart1 = new param_customSpec_PieChartsJS()
params_pieChart1.type = "doughnut"
params_pieChart1.ctx = ctx_5
params_pieChart1.id = "pieChart1"
params_pieChart1.category_field = "REG"
params_pieChart1.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'count'}
params_pieChart1.label_tooltip = "Nb de logements"
params_pieChart1.title[0].text = "title of the chart"


//préparer la var data à injecter dans le chart
var instantiateur_pieChart1 = new PieChart(params_pieChart1);
instantiateur_pieChart1.createChart(params_pieChart1)







params_barChart6 = new param_customSpec_BarChartsJS()

params_barChart6.id = "stackedBar1"
params_barChart6.ctx = ctx_6
params_barChart6.category_field = "surface"
params_barChart6.sub_category_field = "nb_pieces"
params_barChart6.numerical_field = "count"
params_barChart6.label_tooltip = "nb de logements"
params_barChart6.title[0].text = "title of the chart"
params_barChart6.title_x_axis = 'classes de surfaces'
params_barChart6.title_y_axis = "Nb de log"
params_barChart6.legend_title = "Nb pieces"
params_barChart6.colorsConfig = {scheme: "interpolateRainbow", colorsOrder: ""}
params_barChart6.bin_params = {bin: true, agg_type: "count", domain: [0, "p0.95"], thresholds: 10} //p for percentile
params_barChart6.selection_params = {selection_mode: "filter", selection_field: "sub_category_field", highlight_mode: "all"} //highlight_mode: "one" don't work on classes with negative values




var instantiateur_barChart6 = new stacked_barChart(params_barChart6);


instantiateur_barChart6.createChart(params_barChart6)







//chart 1 is put into the observable function, and trigger the filtering process in the targeted charts passed into an array "ex [params_barChart2, params_barChart3]"
var observe_barChart1 = new Observe_Charts_state();
observe_barChart1.observe_chart_state(params_barChart1, [params_barChart2 ,params_barChart3, params_barChart4, params_barChart6, params_pieChart1]);

//chart 2 is put into the observable function, and trigger the filtering process in the targeted charts passed into an array "ex [params_barChart1, params_barChart3]"
var observe_barChart2 = new Observe_Charts_state();
observe_barChart2.observe_chart_state(params_barChart2, [params_barChart1 ,params_barChart3, params_barChart4, params_barChart6, params_pieChart1]);

//chart 3 is put into the observable function, and trigger the filtering process in the targeted charts passed into an array "ex [params_barChart1, params_barChart2]"
var observe_barChart3 = new Observe_Charts_state();
observe_barChart3.observe_chart_state(params_barChart3, [params_barChart1 ,params_barChart2, params_barChart4, params_barChart6, params_pieChart1]);


//chart 3 is put into the observable function, and trigger the filtering process in the targeted charts passed into an array "ex [params_barChart1, params_barChart2]"
var observe_barChart4 = new Observe_Charts_state();
observe_barChart4.observe_chart_state(params_barChart4, [params_barChart1 ,params_barChart2, params_barChart3, params_barChart6, params_pieChart1]);


var observe_pieChart1 = new Observe_Charts_state();
observe_pieChart1.observe_chart_state(params_pieChart1, [params_barChart1 ,params_barChart2, params_barChart3, params_barChart4, params_barChart6]);


var observe_barChart6 = new Observe_Charts_state();
observe_barChart6.observe_chart_state(params_barChart6, [params_barChart1 ,params_barChart2, params_barChart3, params_barChart4, params_pieChart1]);







