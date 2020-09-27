//load raw dataset
var data_annonces_details_locations = [];
var data_annonces_details_ventes = [];
async function chargerDataDetailleesCommunes() {
/*    data_annonces_details_ventes=[];
    data_annonces_details_locations=[];*/
    var d1 = new Date();
    var list_regions = [75, 93]
    var limit = list_regions.length

    for (reg=0; reg < limit; reg++) {
      code_reg = list_regions[reg]

	        try{ 
	          let data_ventes = await d3.dsv(";", "https://raw.githubusercontent.com/klopstock-dviz/immo_vis/master/data/df_annonces_gps_iris_ventes_" + code_reg + ".csv");
	          let data_locations = await d3.dsv(";", "https://raw.githubusercontent.com/klopstock-dviz/immo_vis/master/data/df_annonces_gps_iris_locations_" + code_reg + ".csv");
	          /*reg_Loaded_data_details.push(code_reg);*/
	          console.log(code_reg)
	          
	          for (row in data_ventes) {
	            data_annonces_details_ventes.push(data_ventes[row]);
	          };

	          for (row in data_locations) {
	            data_annonces_details_locations.push(data_locations[row]);
	          };
	        }
	        catch(error) {console.log(error)}
    }
    //convertir str en num
    data_annonces_details_ventes.forEach((d)=> 
    { d['nb_log_n7'] = +d['nb_log_n7']; d['surface'] = +d['surface']; d['prix_m2_vente'] = +d['prix_m2_vente']; d['nb_pieces'] = +d['nb_pieces'];
      d['surface_terrain'] = +d['surface_terrain']; d['prix_bien'] = +d['prix_bien']; d['prix_maison'] = +d['prix_maison'];
      d['prix_terrain'] = +d['prix_terrain']; d['mensualiteFinance'] = +d['mensualiteFinance']; d['balcon'] = +d['balcon'];
      d['eau'] = +d['eau']; d['bain'] = +d['bain']; d['dpeC'] = +d['dpeC'];
      d['mapCoordonneesLatitude'] = +d['mapCoordonneesLatitude']; d['mapCoordonneesLongitude'] = +d['mapCoordonneesLongitude']; d['nb_etages'] = +d['nb_etages'];
      d['places_parking'] = +d['places_parking']; d['annee_construction'] = +d['annee_construction']; d['nb_toilettes'] = +d['nb_toilettes'];
      d['nb_terraces'] = +d['nb_terraces']; d['nb_logements_copro'] = +d['nb_logements_copro']; d['charges_copro'] = +d['charges_copro'];
      d['loyer_m2_mean_n6'] = +d['loyer_m2_mean_n6']; d['nb_log_n6'] = +d['nb_log_n6']; d['taux_rendement_n6'] = +d['taux_rendement_n6'];
      d['loyer_m2_mean_n7'] = +d['loyer_m2_mean_n7']; d['taux_rendement_n7'] = +d['taux_rendement_n7']; d['flag_ligne'] = 1;
     })

    data_annonces_details_ventes_filtre_communes = [...data_annonces_details_ventes]

}

chargerDataDetailleesCommunes()






//structure des parametres à passer

data_input1 = [ 
{"INSEE_COM": "43", "nb_pieces": 1, "nb_log": 29889}, {"INSEE_COM": "43", "nb_pieces": 2, "nb_log": 19889}, {"INSEE_COM": "43", "nb_pieces": 3, "nb_log": 39889},
{"INSEE_COM": "33", "nb_pieces": 1, "nb_log": 8889}, {"INSEE_COM": "33", "nb_pieces": 2, "nb_log": 4889}, {"INSEE_COM": "33", "nb_pieces": 3, "nb_log": 19889},
{"INSEE_COM": "13", "nb_pieces": 1, "nb_log": 19889}, {"INSEE_COM": "13", "nb_pieces": 2, "nb_log": 9889}, {"INSEE_COM": "13", "nb_pieces": 3, "nb_log": 14889}
]


//class for registering the shared parameters for the charts (colors ...)
sharedParams.transformations = {filter: [{field: "INSEE_COM", operation: "include", values: ["33063","64445","17300","33281","87085","17306"]},
										{field: "nb_pieces", operation: "<", value: 9}, {field: "prix_m2_vente", operation: "<", value: 15000}]}


sharedParams.prepare_data_source(data_annonces_details_ventes)




//instancier line chart
/*params_lineChart1 = new param_customSpec_CurveChartsJS()

params_lineChart1.id = "line1"
params_lineChart1.ctx = ctx_2
params_lineChart1.category_field = "date"
params_lineChart1.sub_category_field = "INSEE_COM"
params_lineChart1.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'mean'}
params_lineChart1.stackedChart = false
params_lineChart1.shape = {type: 'line', fill: false} // for area set options: {'area', fill: 'origin'}. you can set the following fill options: '+2' to fill to upper dataset, 
params_lineChart1.label_tooltip = "Prix m² mean"
params_lineChart1.title.text = "title of the chart"
params_lineChart1.title_x_axis = 'Temps'
params_lineChart1.title_y_axis = "Prix m² mean"
params_lineChart1.legend_title = "Nb pieces"
params_lineChart1.colorsConfig = {scheme: "interpolateRainbow", colorsOrder: ""}


var instantiateur_lineChart1 = new curveChart(params_lineChart1);

//préparer la var data à injecter dans le chart
instantiateur_lineChart1.createChart(params_lineChart1)
*/







//instancier nouveau graph mixte à échelle unique
params_BarLineChart = new params_mixed_BarLineChart()

params_BarLineChart.id = "mixedBar1"
params_BarLineChart.ctx = ctx_2
params_BarLineChart.category_field = "INSEE_COM"
params_BarLineChart.line_field_params = {CategoryFieldName: "DEP"} //used for line field
//params_BarLineChart.line_field_params = {CategoryFieldName: "DEP", numerical_field: "prix_m2_vente", agg_type: "mean"} //used for line field
params_BarLineChart.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'mean'}
params_BarLineChart.label_tooltip = "Prix m² mean"
params_BarLineChart.title[0].text = "title of the chart"
params_BarLineChart.title_x_axis = 'Communes'
params_BarLineChart.title_y_axis = "Prix m² mean"
params_BarLineChart.legend_title = "Nb pieces"
params_BarLineChart.transformations.barChart = {dataset: undefined, filter: [{field: "nb_pieces", operation: "<", value: 9}, 
												{field: "prix_m2_vente", operation: "<", value: 15000}]}
params_BarLineChart.transformations.lineChart = {dataset: data_annonces_details_ventes, filter: [{field: "nb_pieces", operation: "<", value: 9}, 
												{field: "prix_m2_vente", operation: "<", value: 15000}]}


var instantiateur_BarLineChart = new mixed_BarLineChart_singleScale(params_BarLineChart);

//préparer la var data à injecter dans le chart
instantiateur_BarLineChart.createChart(params_BarLineChart)









//instancier nouveau graph mixte à échelle mixte
params_BarLineChart_doubleScale = new params_mixed_BarLineChart()

params_BarLineChart_doubleScale.id = "mixedBar2"
params_BarLineChart_doubleScale.ctx = ctx_2
params_BarLineChart_doubleScale.category_field = "INSEE_COM"
//params_BarLineChart_doubleScale.line_field_params = {CategoryFieldName: "DEP"} //used for line field
params_BarLineChart_doubleScale.line_field_params = {CategoryFieldName: "INSEE_COM", numerical_field: "surface", agg_type: "mean"} //used for line field
params_BarLineChart_doubleScale.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'mean'}
params_BarLineChart_doubleScale.label_tooltip = "Prix m² mean"
params_BarLineChart_doubleScale.title[0].text = "title of the chart"
params_BarLineChart_doubleScale.title_x_axis = 'Communes'
params_BarLineChart_doubleScale.title_y_axis = "Prix m² mean"
params_BarLineChart_doubleScale.title_y2_axis = "Surface mean"
params_BarLineChart_doubleScale.legend_title = "Nb pieces"


var instantiateur_BarLineChart = new mixed_BarLineChart_doubleScale(params_BarLineChart_doubleScale);

//préparer la var data à injecter dans le chart
instantiateur_BarLineChart.createChart(params_BarLineChart_doubleScale)







//instancier nouveau graph 1
params_barChart1 = new param_customSpec_BarChartsJS()

params_barChart1.ctx = ctx_1
params_barChart1.id = "bar1"
params_barChart1.category_field = "INSEE_COM"
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
instantiateur_barChart1.createChart(params_barChart1) //here you can pass a dataset as 2nd parameter, this will override the main dataset of the sharedParams






//bar 2 params
//instancier nouveau graph 1
params_barChart2 = new param_customSpec_BarChartsJS()

params_barChart2.id = "groupedBar1"
params_barChart2.ctx = ctx_2
params_barChart2.category_field = "INSEE_COM"
params_barChart2.sub_category_field = "nb_pieces"
params_barChart2.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'mean'}
params_barChart2.label_tooltip = "Prix m² mean"
params_barChart2.title[0].text = "title of the chart"
params_barChart2.title_x_axis = 'Communes'
params_barChart2.title_y_axis = "Prix m² mean"
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
params_barChart3.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'mean'}
params_barChart3.label_tooltip = "Prix m² mean"
params_barChart3.title[0].text = "title of the chart"
params_barChart3.title_x_axis = 'DPE'
params_barChart3.title_y_axis = "Prix m² mean"


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
params_pieChart1.category_field = "INSEE_COM"
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









//--------------
//chart 1 is put into the observable function, and trigger the filtering process in the targeted charts passed into an array "ex [params_barChart2, params_barChart3]"
//class for registering the shared parameters for the charts (colors ...)
sharedParams.transformations = {filter: [{field: "INSEE_COM", operation: "include", values: ["33063","64445","17300","33281","87085","17306"]},
										{field: "nb_pieces", operation: "<", value: 9}, {field: "prix_m2_vente", operation: "<", value: 15000}]}


sharedParams.prepare_data_source(data_annonces_details_ventes)

//instancier nouveau graph mixte à échelle mixte
params_BarLineChart_doubleScale = new params_mixed_BarLineChart()

params_BarLineChart_doubleScale.id = "mixedBar2"
params_BarLineChart_doubleScale.ctx = ctx_2
params_BarLineChart_doubleScale.category_field = "INSEE_COM"
//params_BarLineChart_doubleScale.line_field_params = {CategoryFieldName: "DEP"} //used for line field
params_BarLineChart_doubleScale.line_field_params = {CategoryFieldName: "INSEE_COM", numerical_field: "surface", agg_type: "mean"} //used for line field
params_BarLineChart_doubleScale.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'mean'}
params_BarLineChart_doubleScale.label_tooltip = "Prix m² mean"
params_BarLineChart_doubleScale.title[0].text = "title of the chart"
params_BarLineChart_doubleScale.title_x_axis = 'Communes'
params_BarLineChart_doubleScale.title_y_axis = "Prix m² mean"
params_BarLineChart_doubleScale.title_y2_axis = "Surface meane"
params_BarLineChart_doubleScale.legend_title = "Nb pieces"


var instantiateur_BarLineChart = new mixed_BarLineChart_doubleScale(params_BarLineChart_doubleScale);

//préparer la var data à injecter dans le chart
instantiateur_BarLineChart.createChart(params_BarLineChart_doubleScale)




//instancier nouveau graph 1
params_barChart1 = new param_customSpec_BarChartsJS()

params_barChart1.ctx = ctx_1
params_barChart1.id = "bar1"
params_barChart1.category_field = "INSEE_COM"
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
instantiateur_barChart1.createChart(params_barChart1) //here you can pass a dataset as 2nd parameter, this will override the main dataset of the sharedParams




//instancier nouveau graph 3
params_barChart3 = new param_customSpec_BarChartsJS()

params_barChart3.ctx = ctx_3
params_barChart3.colorsConfig = {scheme: "interpolateRdYlGn", colorsOrder: "reverse"}
params_barChart3.id = "bar2"
params_barChart3.category_field = "dpeL"
params_barChart3.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'mean'}
params_barChart3.label_tooltip = "Prix m² mean"
params_barChart3.title[0].text = "title of the chart"
params_barChart3.title_x_axis = 'DPE'
params_barChart3.title_y_axis = "Prix m² mean"


var instantiateur_barChart3 = new simple_BarChart(params_barChart3);

instantiateur_barChart3.createChart(params_barChart3)







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





var observe_barChart1 = new Observe_Charts_state();
observe_barChart1.observe_chart_state(params_BarLineChart_doubleScale, [params_barChart1, params_barChart3, params_barChart6]);

//chart 2 is put into the observable function, and trigger the filtering process in the targeted charts passed into an array "ex [params_barChart1, params_barChart3]"
var observe_barChart2 = new Observe_Charts_state();
observe_barChart2.observe_chart_state(params_barChart1, [params_BarLineChart_doubleScale, params_barChart3, params_barChart6]);

//chart 3 is put into the observable function, and trigger the filtering process in the targeted charts passed into an array "ex [params_barChart1, params_barChart2]"
var observe_barChart3 = new Observe_Charts_state();
observe_barChart3.observe_chart_state(params_barChart3, [params_BarLineChart_doubleScale, params_barChart1, params_barChart6]);

var observe_barChart6 = new Observe_Charts_state();
observe_barChart6.observe_chart_state(params_barChart6, [params_BarLineChart_doubleScale, params_barChart1, params_barChart3]);







https://blog.datawrapper.de/colorguide/
https://hiempsal-malamute.github.io/agh_immo/index.html

















sharedParams.transformations = {filter: [{field: "INSEE_COM", operation: "include", values: ["33063","64445","17300","33281","87085","17306"]},
										{field: "nb_pieces", operation: "<", value: 9}, {field: "prix_m2_vente", operation: "<", value: 15000}]}


sharedParams.prepare_data_source(data_annonces_details_ventes)

//instancier nouveau graph 1
params_barChart1 = new param_customSpec_BarChartsJS()

params_barChart1.ctx = ctx_1
params_barChart1.id = "bar1"
params_barChart1.category_field = "INSEE_COM"
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
instantiateur_barChart1.createChart(params_barChart1) //here you can pass a dataset as 2nd parameter, this will override the main dataset of the sharedParams


params_lineChart1 = new param_customSpec_CurveChartsJS()

params_lineChart1.id = "line1"
params_lineChart1.ctx = ctx_2
params_lineChart1.category_field = "date"
params_lineChart1.sub_category_field = "INSEE_COM"
params_lineChart1.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'mean'}
params_lineChart1.stackedChart = false
params_lineChart1.shape = {type: 'line', fill: false} // for area set options: {'area', fill: 'origin'}. you can set the following fill options: '+2' to fill to upper dataset, 
params_lineChart1.label_tooltip = "Prix m² mean"
params_lineChart1.title.text = "title of the chart"
params_lineChart1.title_x_axis = 'Temps'
params_lineChart1.title_y_axis = "Prix m² mean"
params_lineChart1.legend_title = "Nb pieces"
params_lineChart1.colorsConfig = {scheme: "interpolateRainbow", colorsOrder: ""}


var instantiateur_lineChart1 = new curveChart(params_lineChart1);

//préparer la var data à injecter dans le chart
instantiateur_lineChart1.createChart(params_lineChart1)





//instancier nouveau graph 3
params_barChart3 = new param_customSpec_BarChartsJS()

params_barChart3.ctx = ctx_3
params_barChart3.colorsConfig = {scheme: "interpolateRdYlGn", colorsOrder: "reverse"}
params_barChart3.id = "bar2"
params_barChart3.category_field = "dpeL"
params_barChart3.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'mean'}
params_barChart3.label_tooltip = "Prix m² mean"
params_barChart3.title[0].text = "title of the chart"
params_barChart3.title_x_axis = 'DPE'
params_barChart3.title_y_axis = "Prix m² mean"


var instantiateur_barChart3 = new simple_BarChart(params_barChart3);

instantiateur_barChart3.createChart(params_barChart3)







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
params_barChart6.selection_params = {selection_mode: "filter", selection_field: "sub_category_field", highlight_mode: "one"}




var instantiateur_barChart6 = new stacked_barChart(params_barChart6);


instantiateur_barChart6.createChart(params_barChart6)





var observe_barChart1 = new Observe_Charts_state();
observe_barChart1.observe_chart_state(params_lineChart1, [params_barChart1, params_barChart3, params_barChart6]);

//chart 2 is put into the observable function, and trigger the filtering process in the targeted charts passed into an array "ex [params_barChart1, params_barChart3]"
var observe_barChart2 = new Observe_Charts_state();
observe_barChart2.observe_chart_state(params_barChart1, [params_lineChart1, params_barChart3, params_barChart6]);

//chart 3 is put into the observable function, and trigger the filtering process in the targeted charts passed into an array "ex [params_barChart1, params_barChart2]"
var observe_barChart3 = new Observe_Charts_state();
observe_barChart3.observe_chart_state(params_barChart3, [params_lineChart1, params_barChart1, params_barChart6]);

var observe_barChart6 = new Observe_Charts_state();
observe_barChart6.observe_chart_state(params_barChart6, [params_lineChart1, params_barChart1, params_barChart3]);














//--------------------------------------------
//--------------------------------------------
sharedParams.transformations = {filter: [{field: "INSEE_COM", operation: "include", values: ["33063","64445","17300","33281","87085","17306"]},
										{field: "nb_pieces", operation: "<", value: 9}, {field: "prix_m2_vente", operation: "<", value: 15000},{field: "taux_rendement_n7", operation: "<", value: 0.2}, {field: "surface", operation: "<", value: 300}]}

sharedParams.prepare_data_source(data_annonces_details_ventes)





//instancier nouveau graph 1
params_barChart1 = new param_customSpec_BarChartsJS()

params_barChart1.ctx = ctx_1
params_barChart1.id = "bar1"
params_barChart1.category_field = "INSEE_COM"
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
instantiateur_barChart1.createChart(params_barChart1) //here you can pass a dataset as 2nd parameter, this will override the main dataset of the sharedParams






params_scatterChart1 = new params_scatterChart()

params_scatterChart1.id = "scatter1"
params_scatterChart1.ctx = ctx_2
ctx_2.style = 'position: absolute'
params_scatterChart1.x_field = "surface"
params_scatterChart1.y_field = "prix_m2_vente"
params_scatterChart1.category_field = 'INSEE_COM'
params_scatterChart1.shape = {type: 'scatter'} // for area set options: {'area', fill: 'origin'}. you can set the following fill options: '+2' to fill to upper dataset, 
params_scatterChart1.label_tooltip = [{field_title: "INSEE_COM", as: "Commune"}, {field_detail: "surface", as: "Surface"}, {field_detail: "prix_m2_vente", as: "Prix m²"},
										{field_detail: "dpeL", as: "DPE"}]
params_scatterChart1.title = "title of the chart"
params_scatterChart1.title_x_axis = 'Surface'
params_scatterChart1.title_y_axis = "Prix m²"
params_scatterChart1.legend_title = ""
params_scatterChart1.colorsConfig = {scheme: "", colorsOrder: ""}
params_scatterChart1.selection_params.brush.mode = 'endEvent'

var instantiateur_scatterChart1 = new scatterChart(params_scatterChart1);

//préparer la var data à injecter dans le chart
instantiateur_scatterChart1.createChart(params_scatterChart1)

var htmlNode = document.getElementById('brush1')
brush_scatterPlot(params_scatterChart1, htmlNode)










//instancier nouveau graph 3
params_barChart3 = new param_customSpec_BarChartsJS()

params_barChart3.ctx = ctx_3
params_barChart3.colorsConfig = {scheme: "interpolateRdYlGn", colorsOrder: "reverse"}
params_barChart3.id = "bar2"
params_barChart3.category_field = "dpeL"
params_barChart3.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'mean'}
params_barChart3.label_tooltip = "Prix m² mean"
params_barChart3.title[0].text = "title of the chart"
params_barChart3.title_x_axis = 'DPE'
params_barChart3.title_y_axis = "Prix m² mean"


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
params_pieChart1.category_field = "INSEE_COM"
params_pieChart1.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'count'}
params_pieChart1.label_tooltip = "Nb de logements"
params_pieChart1.title[0].text = "title of the chart"


//préparer la var data à injecter dans le chart
var instantiateur_pieChart1 = new PieChart(params_pieChart1);
instantiateur_pieChart1.createChart(params_pieChart1)






params_scatterChart2 = new params_scatterChart()

params_scatterChart2.id = "scatter2"
params_scatterChart2.ctx = ctx_7
ctx_7.style = 'position: absolute'
params_scatterChart2.x_field = "surface"
params_scatterChart2.y_field = "taux_rendement_n7"
params_scatterChart2.category_field = 'INSEE_COM'
//params_scatterChart2.transformations = {filter: [{field: "taux_rendement_n7", operation: "<", value: 0.2}]}
params_scatterChart2.shape = {type: 'scatter'} // for area set options: {'area', fill: 'origin'}. you can set the following fill options: '+2' to fill to upper dataset, 
params_scatterChart2.label_tooltip = [{field_title: "INSEE_COM", as: "Commune"}, {field_detail: "surface", as: "Surface"}, {field_detail: "taux_rendement_n7", as: "taux_rendement"},
										{field_detail: "dpeL", as: "DPE"}]
params_scatterChart2.title = "Tx de rendement selon la surface"
params_scatterChart2.title_x_axis = 'Surface'
params_scatterChart2.title_y_axis = "Taux rendement"
params_scatterChart2.legend_title = ""
params_scatterChart2.colorsConfig = {scheme: "", colorsOrder: ""}
params_scatterChart2.selection_params.brush.mode = 'endEvent'

var instantiateur_scatterChart2 = new scatterChart(params_scatterChart2);

//préparer la var data à injecter dans le chart
instantiateur_scatterChart2.createChart(params_scatterChart2)

var htmlNode2 = document.getElementById('brush2')
brush_scatterPlot(params_scatterChart2, htmlNode2)






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







params_groupedBar1 = new param_customSpec_BarChartsJS()

params_groupedBar1.id = "groupedBar1"
params_groupedBar1.ctx = ctx_9
params_groupedBar1.category_field = "INSEE_COM"
params_groupedBar1.sub_category_field = "nb_pieces"
params_groupedBar1.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'mean'}
params_groupedBar1.label_tooltip = "Prix m² mean"
params_groupedBar1.title[0].text = "title of the chart"
params_groupedBar1.title_x_axis = 'Communes'
params_groupedBar1.title_y_axis = "Prix m² mean"
params_groupedBar1.legend_title = "Nb pieces"
params_groupedBar1.colorsConfig = {scheme: "interpolateRainbow", colorsOrder: ""}


var instantiateur_groupedBar1 = new grouped_barChart(params_groupedBar1);

//préparer la var data à injecter dans le chart
instantiateur_groupedBar1.createChart(params_groupedBar1)







//chart 1 is put into the observable function, and trigger the filtering process in the targeted charts passed into an array "ex [params_barChart2, params_barChart3]"
var observe_barChart1 = new Observe_Charts_state();
observe_barChart1.observe_chart_state(params_barChart1, [params_scatterChart1 ,params_barChart3, params_barChart4, params_scatterChart2, params_pieChart1, params_barChart6, params_groupedBar1]);

//chart 2 is put into the observable function, and trigger the filtering process in the targeted charts passed into an array "ex [params_barChart1, params_barChart3]"
var observe_barChart2 = new Observe_Charts_state();
observe_barChart2.observe_chart_state(params_scatterChart1, [params_barChart1 ,params_barChart3, params_barChart4, params_scatterChart2, params_pieChart1, params_barChart6, params_groupedBar1]);

//chart 3 is put into the observable function, and trigger the filtering process in the targeted charts passed into an array "ex [params_barChart1, params_barChart2]"
var observe_barChart3 = new Observe_Charts_state();
observe_barChart3.observe_chart_state(params_barChart3, [params_barChart1 ,params_scatterChart1, params_barChart4, params_scatterChart2, params_pieChart1, params_barChart6, params_groupedBar1]);


//chart 3 is put into the observable function, and trigger the filtering process in the targeted charts passed into an array "ex [params_barChart1, params_barChart2]"
var observe_barChart4 = new Observe_Charts_state();
observe_barChart4.observe_chart_state(params_barChart4, [params_barChart1 ,params_scatterChart1, params_barChart3, params_scatterChart2, params_pieChart1, params_barChart6, params_groupedBar1]);


var observe_pieChart1 = new Observe_Charts_state();
observe_pieChart1.observe_chart_state(params_pieChart1, [params_barChart1 ,params_scatterChart1, params_barChart3, params_barChart4, params_scatterChart2, params_barChart6, params_groupedBar1]);


var observe_scatterChart2 = new Observe_Charts_state();
observe_scatterChart2.observe_chart_state(params_scatterChart2, [params_barChart1 ,params_scatterChart1, params_barChart3, params_barChart4, params_pieChart1, params_barChart6, params_groupedBar1]);


var observe_barChart6 = new Observe_Charts_state();
observe_barChart6.observe_chart_state(params_barChart6, [params_barChart1 ,params_scatterChart1, params_barChart3, params_barChart4, params_pieChart1, params_scatterChart2, params_groupedBar1]);


var observe_groupedBar1 = new Observe_Charts_state();
observe_groupedBar1.observe_chart_state(params_groupedBar1, [params_barChart1 ,params_scatterChart1, params_barChart3, params_barChart4, params_pieChart1, params_scatterChart2, params_barChart6]);










//--------------------------------------------
//--------------------------------------------
sharedParams.transformations = {filter: [{field: "INSEE_COM", operation: "include", values: ["33063","64445","64102","33281","64024","64122"]},//'33', '75', '64'
										{field: "nb_pieces", operation: "<", value: 9}, {field: "prix_m2_vente", operation: "<", value: 15000},{field: "taux_rendement_n7", operation: "<", value: 0.2}, {field: "surface", operation: "<", value: 300}]}
sharedParams.language = "fr"
sharedParams.prepare_data_source({operational_data: data_annonces_details_ventes, geojson_data: polys})




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
instantiateur_barChart1.createChart(params_barChart1) //here you can pass a dataset as 2nd parameter, this will override the main dataset of the sharedParams











//choroplethe map
//instancier nouvelle map
params_choroplethe_map1 = new params_map()

params_choroplethe_map1.htmlNode = htmlNode1
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
params_choroplethe_map1.params_legends = {show: true, htmlNode: "map1_legends_node", position: "", shape: "", max_cells: 10, toPrecision: 2, filter_params: {mode: "fade", flyToBounds: true,showTooltips: false}}
/*params_legends options:
filter_mode: "fade" -> lower opacity of polygons filtred, "hide" -> hide the polygons filtred
show_tooltip: false -> don't display the tooltips of the filtred polygons

*/
var instantiateur_choroplethe_map1 = new Map_choroplethe(params_choroplethe_map1);

//evo
instantiateur_choroplethe_map1.createChart(params_choroplethe_map1) //here you can pass a dataset as 2nd parameter, this will override the main dataset of the sharedParams





//instancier nouveau graph 1
var params_pieChart1 = new param_customSpec_PieChartsJS()
params_pieChart1.type = "doughnut"
params_pieChart1.ctx = ctx_5
params_pieChart1.id = "pieChart1"
params_pieChart1.category_field = "nb_pieces"
params_pieChart1.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'count'}
params_pieChart1.label_tooltip = "Nb de logements"
params_pieChart1.title[0].text = "Nb de logements"


//préparer la var data à injecter dans le chart
var instantiateur_pieChart1 = new PieChart(params_pieChart1);
instantiateur_pieChart1.createChart(params_pieChart1)








params_scatterChart2 = new params_scatterChart()

params_scatterChart2.id = "scatter2"
params_scatterChart2.ctx = ctx_7
ctx_7.style = 'position: absolute'
params_scatterChart2.x_field = "surface"
params_scatterChart2.y_field = "taux_rendement_n7"
params_scatterChart2.category_field = 'INSEE_COM'
//params_scatterChart2.transformations = {filter: [{field: "taux_rendement_n7", operation: "<", value: 0.2}]}
params_scatterChart2.shape = {type: 'scatter'} // for area set options: {'area', fill: 'origin'}. you can set the following fill options: '+2' to fill to upper dataset, 
params_scatterChart2.label_tooltip = [{field_title: "INSEE_COM", as: "Commune"}, {field_detail: "surface", as: "Surface"}, {field_detail: "taux_rendement_n7", as: "taux_rendement"},
                    {field_detail: "dpeL", as: "DPE"}]
params_scatterChart2.title = "Tx de rendement selon la surface"
params_scatterChart2.title_x_axis = 'Surface'
params_scatterChart2.title_y_axis = "Taux rendement"
params_scatterChart2.legend_title = ""
params_scatterChart2.colorsConfig = {scheme: "", colorsOrder: ""}
params_scatterChart2.selection_params.brush.mode = 'endEvent'

var instantiateur_scatterChart2 = new scatterChart(params_scatterChart2);

//préparer la var data à injecter dans le chart
instantiateur_scatterChart2.createChart(params_scatterChart2)

var htmlNode2 = document.getElementById('brush2')
brush_scatterPlot(params_scatterChart2, htmlNode2)




sharedParams.setup_crossfilter()




//-----------------------------------------

//--------------------------------------------
//--------------------------------------------
sharedParams.transformations = {filter: [{field: "INSEE_COM", operation: "include", values: ["33063","64445","64102","33281","64024","64122"]},
                    {field: "nb_pieces", operation: "<", value: 9}, {field: "prix_m2_vente", operation: "<", value: 15000},{field: "taux_rendement_n7", operation: "<", value: 0.2}, {field: "surface", operation: "<", value: 300}]}
sharedParams.language = "fr"
sharedParams.prepare_data_source({operational_data: data_annonces_details_ventes, geojson_data: polys})





//instancier nouveau graph 1
params_barChart1 = new param_customSpec_BarChartsJS()

params_barChart1.ctx = ctx_1
params_barChart1.id = "bar1"
params_barChart1.category_field = "INSEE_COM"
//params_barChart1.hiearchy_levels = {0: "REG", 1: "DEP", 2: "INSEE_COM", 3: "CODE_IRIS"}
params_barChart1.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'median'}
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
instantiateur_barChart1.createChart(params_barChart1) //here you can pass a dataset as 2nd parameter, this will override the main dataset of the sharedParams


















//instancier nouvelle map
params_map1 = new params_map()
params_map1.category_field = "INSEE_COM" //used to sync with other charts sharing same cat field, especially in rm crossfilter process
params_map1.htmlNode = htmlNode1
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
instantiateur_map1.createChart(params_map1) //here you can pass a dataset as 2nd parameter, this will override the main dataset of the sharedParams





//instancier nouveau graph 1
var params_pieChart1 = new param_customSpec_PieChartsJS()
params_pieChart1.type = "doughnut"
params_pieChart1.ctx = ctx_5
params_pieChart1.id = "pieChart1"
params_pieChart1.category_field = "nb_pieces"
params_pieChart1.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'count'}
params_pieChart1.label_tooltip = "Nb de logements"
params_pieChart1.title[0].text = "Nb de logements"


//préparer la var data à injecter dans le chart
var instantiateur_pieChart1 = new PieChart(params_pieChart1);
instantiateur_pieChart1.createChart(params_pieChart1)







params_scatterChart2 = new params_scatterChart()

params_scatterChart2.id = "scatter2"
params_scatterChart2.ctx = ctx_7
ctx_7.style = 'position: absolute'
params_scatterChart2.x_field = "surface"
params_scatterChart2.y_field = "taux_rendement_n7"
params_scatterChart2.category_field = 'INSEE_COM'
//params_scatterChart2.transformations = {filter: [{field: "taux_rendement_n7", operation: "<", value: 0.2}]}
params_scatterChart2.shape = {type: 'scatter'} // for area set options: {'area', fill: 'origin'}. you can set the following fill options: '+2' to fill to upper dataset, 
params_scatterChart2.label_tooltip = [{field_title: "INSEE_COM", as: "Commune"}, {field_detail: "surface", as: "Surface"}, {field_detail: "taux_rendement_n7", as: "taux_rendement"},
                    {field_detail: "dpeL", as: "DPE"}]
params_scatterChart2.title = "Tx de rendement selon la surface"
params_scatterChart2.title_x_axis = 'Surface'
params_scatterChart2.title_y_axis = "Taux rendement"
params_scatterChart2.legend_title = ""
params_scatterChart2.colorsConfig = {scheme: "", colorsOrder: ""}
params_scatterChart2.selection_params.brush.mode = 'endEvent'

var instantiateur_scatterChart2 = new scatterChart(params_scatterChart2);

//préparer la var data à injecter dans le chart
instantiateur_scatterChart2.createChart(params_scatterChart2)

var htmlNode2 = document.getElementById('brush2')
brush_scatterPlot(params_scatterChart2, htmlNode2)






params_lineChart1 = new param_customSpec_CurveChartsJS()

params_lineChart1.id = "line1"
ctx_6.style = 'position: absolute'
params_lineChart1.ctx = ctx_6
params_lineChart1.category_field = "date"
params_lineChart1.sub_category_field = "INSEE_COM"
params_lineChart1.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'mean'}
params_lineChart1.stackedChart = false
params_lineChart1.shape = {type: 'line', fill: false} // for area set options: {'area', fill: 'origin'}. you can set the following fill options: '+2' to fill to upper dataset, 
params_lineChart1.label_tooltip = "Prix m² mean"
params_lineChart1.title.text = "title of the chart"
params_lineChart1.title_x_axis = 'Temps'
params_lineChart1.title_y_axis = "Prix m² mean"
params_lineChart1.legend_title = "Nb pieces"
params_lineChart1.colorsConfig = {scheme: "interpolateRainbow", colorsOrder: ""}
params_lineChart1.selection_params.brush.mode = 'endEvent'

var instantiateur_lineChart1 = new curveChart(params_lineChart1);

//préparer la var data à injecter dans le chart
instantiateur_lineChart1.createChart(params_lineChart1)

var htmlNode3 = document.getElementById('brush3')
brush_curveChart(params_lineChart1, htmlNode3)







sharedParams.setup_crossfilter()






























//-----------------------------------------

//--------------------------------------------
//--------------------------------------------
sharedParams.transformations = {filter: [{field: "INSEE_COM", operation: "include", values: ["33063","64445","64102","33281","64024","64122"]},
                    {field: "nb_pieces", operation: "<", value: 9}, {field: "prix_m2_vente", operation: "<", value: 15000},{field: "taux_rendement_n7", operation: "<", value: 0.2}, {field: "surface", operation: "<", value: 300}]}
sharedParams.language = "fr"
sharedParams.prepare_data_source({operational_data: data_annonces_details_ventes, geojson_data: polys})





//instancier nouveau graph 1
params_barChart1 = new param_customSpec_BarChartsJS()

params_barChart1.ctx = ctx_1
params_barChart1.id = "bar1"
params_barChart1.category_field = "INSEE_COM"
//params_barChart1.hiearchy_levels = {0: "REG", 1: "DEP", 2: "INSEE_COM", 3: "CODE_IRIS"}
params_barChart1.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'median'}
params_barChart1.label_tooltip = "Prix m² mean"
params_barChart1.title[0].text = "title of the chart"
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



//instancier nouveau graph 4
params_barChart4 = new param_customSpec_BarChartsJS()

params_barChart4.ctx = ctx_2
params_barChart4.id = "bar4"
params_barChart4.category_field = "typedebien"
params_barChart4.numerical_field_params = {fieldName: 'flag_ligne', agg_type: 'count'}
params_barChart4.label_tooltip = "NB de logements"
params_barChart4.title[0].text = "title of the chart"
params_barChart4.title_x_axis = 'Type de bien'
params_barChart4.title_y_axis = "Nb de logements"
params_barChart4.decode = true

var instantiateur_barChart4 = new simple_BarChart(params_barChart4);


instantiateur_barChart4.createChart(params_barChart4)





//group label
params_labelGroup1 = new params_label()
params_labelGroup1.htmlNode = 'r2c1'
params_labelGroup1.id = 'labelGroup1'
params_labelGroup1.title = 'Démographie'
params_labelGroup1.nb_of_columns = 6
params_labelGroup1.labels_data_params = [
                                        {shared_params: {join_field_source: "INSEE_COM", join_field_target: "CODGEO", dataset_target: data_stats_insee_com}},
                                        {id: 'label1', prefix: 'Habitants', data_params: {value_field_target: "P17_POP", selection: "sum"}},
                                        
                                        {id: 'label2', prefix: '% évol démo', suffix: '%',
                                          data_params: {operation: {function: function(arguments) {return ( ((arguments.yearN - arguments.yearN_1)/arguments.yearN_1)*100 ).toFixed(2) }, 
                                          arguments: {yearN: "P17_POP", yearN_1: "P12_POP"}, selection: "mean" } } },
                                        {id: 'label3', prefix: 'Tx chômage', suffix: '%',
                                          data_params: {operation: {function: (arguments)=> {return ( (arguments.a1/arguments.a2)*100 ).toFixed(2) }, 
                                          arguments: {a1: "P17_CHOM1564", a2: "P17_ACT1564"}, selection: "median" } } } 
                                        ]



var instantiateur_labelGroup1 = new LabelGroup(params_labelGroup1)
instantiateur_labelGroup1.createLabel(params_labelGroup1)



//instancier nouveau graph 1
var params_pieChart1 = new param_customSpec_PieChartsJS()
params_pieChart1.type = "doughnut"
params_pieChart1.ctx = ctx_4
params_pieChart1.id = "pieChart1"
params_pieChart1.category_field = "INSEE_COM"
params_pieChart1.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'count'}
params_pieChart1.label_tooltip = "Nb de logements"
params_pieChart1.title[0].text = "Nb de logements"
params_pieChart1.decode = true

//préparer la var data à injecter dans le chart
var instantiateur_pieChart1 = new PieChart(params_pieChart1);
instantiateur_pieChart1.createChart(params_pieChart1)



sharedParams.setup_crossfilter()
