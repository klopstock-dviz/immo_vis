/*créer un espace central accessible à tous les graphs, qui contiendra le dataset central à la source de tous les graphs, que ces derniers 
devront filtrer à chaque clic pour se rafraichir les uns les autres*/

/*cet espace devra avoir une fonction qui collecte en permanence l'ensemble des filtres posés sur les différents graphs, afin de les poser de
nouveau quand un graphique aditionnel est filtré*/

//preparer des tableaux séparés contenant les valeurs uniques de chaque champ fitrable du data source
//préparer des tests (if...) pour savoir qui des tableaux ci-dessus ou des filter_array, transmis par le stateManagement, doivent servir dans le filtre
//filtrer le data source sur la base du/des filtres utiles
//renvoyer le résultat filtré au stateManagement pour maj du graphique

//preparer des tableaux séparés contenant les valeurs uniques de chaque champ fitrable du data source
var distinct_nb_pieces_array = [];var distinct_typedebien_array = [];var distinct_typedetransaction_array = [];var distinct_etage_array = [];
var distinct_dpeL_array = [];
var distinct_annonce_exclusive_array = [];var distinct_nb_etages_array = [];var distinct_parking_array = [];var distinct_cave_array = [];var distinct_exposition_array = [];
var distinct_ges_class_array = [];var distinct_annee_construction_array = [];var distinct_nb_toilettes_array = [];var distinct_nb_terraces_array = [];
var distinct_videophone_array = [];var distinct_porte_digicode_array = [];var distinct_ascenseur_array = [];var distinct_chauffage_energie_array = [];
var distinct_chauffage_systeme_array = [];var distinct_chauffage_mode_array = []; var distinct_categorie_annonceur_array = [];
var distinct_logement_neuf_array = [];var distinct_typedebien_lite_array = [];var distinct_date_array = [];var distinct_INSEE_COM_array = [];
var distinct_CODE_IRIS_array = []; var distinct_TYP_IRIS_array = []; var distinct_DEP_array = []; var distinct_REG_array = []; var distinct_type_annonceur_array = [];

function distinct_values_dataset() {
		if (data_annonces_details_filtre.length > 0) {
			distinct_REG_array = deduplicate_dict(data_annonces_details_filtre, "REG"); distinct_DEP_array = deduplicate_dict(data_annonces_details_filtre, "DEP");
			distinct_date_array = deduplicate_dict(data_annonces_details_filtre, "date"); distinct_ascenseur_array = deduplicate_dict(data_annonces_details_filtre, "ascenseur");
			distinct_videophone_array = deduplicate_dict(data_annonces_details_filtre, "videophone"); distinct_exposition_array = deduplicate_dict(data_annonces_details_filtre, "exposition");
			distinct_cave_array = deduplicate_dict(data_annonces_details_filtre, "cave"); distinct_parking_array = deduplicate_dict(data_annonces_details_filtre, "parking");
			distinct_etage_array = deduplicate_dict(data_annonces_details_filtre, "etage"); distinct_typedetransaction_array = deduplicate_dict(data_annonces_details_filtre, "typedetransaction");
			distinct_typedebien_array = deduplicate_dict(data_annonces_details_filtre, "typedebien"); distinct_TYP_IRIS_array = deduplicate_dict(data_annonces_details_filtre, "TYP_IRIS");
			distinct_CODE_IRIS_array = deduplicate_dict(data_annonces_details_filtre, "CODE_IRIS"); distinct_INSEE_COM_array = deduplicate_dict(data_annonces_details_filtre, "INSEE_COM");
			distinct_type_annonceur_array = deduplicate_dict(data_annonces_details_filtre, "type_annonceur"); distinct_typedebien_lite_array = deduplicate_dict(data_annonces_details_filtre, "typedebien_lite");
			distinct_logement_neuf_array = deduplicate_dict(data_annonces_details_filtre, "logement_neuf"); distinct_categorie_annonceur_array = deduplicate_dict(data_annonces_details_filtre, "distinct_categorie_annonceur");
			distinct_dpeL_array = deduplicate_dict(data_annonces_details_filtre, "dpeL");
			clearInterval(interval_selectDistinct_filter_fields)
		}
}

var interval_selectDistinct_filter_fields = setInterval(
	distinct_values_dataset(), 1500
)

function crossfilter_master(params_chart, params_chart_target, filter_array, ind_filtering_type) {

    var d1 = new Date();

    //define dynamique filter function
		buildFilter = (filter) => {
		    let query = {};
		    for (let keys in filter) {
		        if ( (filter[keys].constructor === Object) || (filter[keys].constructor === Array && filter[keys].length > 0)) {
		            query[keys] = filter[keys];
		        }
		    }
		    return query;
		}

		// Our new filter function
		filterData = (data, query) => {
		    const keysWithMinMax = [
		        "etage",	"surface",	"surface_terrain",	"prix_bien",	"prix_maison",	"prix_terrain",
				"dpeC", "nb_etages", "places_parking", "annee_construction",	"nb_toilettes",	"nb_terraces", "nb_logements_copro",	"charges_copro",
				"loyer_m2_median_n6",	"nb_log_n6",	"taux_rendement_n6",	"loyer_m2_median_n7",	"nb_log_n7",	"taux_rendement_n7",	"prix_m2_vente"
				  ];
		    const filteredData = data.filter( (item) => {
		        for (let key in query) {
		            /* Note: this initial check can be modified in case
		             *       you still want to include results that may
		             *       not have that specific key.
		             * 
		             *       If that is the case, you can just change these
		             *       checks to:
		             *       
		             *       if (item[key] !=== undefined) {
		             *           if (keysWithMinMax.includes(key)) {
		             *              ...
		             *           }
		             *           else if (!query[key].includes(item[key])) {
		             *              ...
		             *           }
		             *       }
		             *       
		             *       This way your program won't crash when the key doesn't
		             *       exist.
		             */
		            if (item[key] === undefined) {
		                return false;
		            }
		            else if (keysWithMinMax.includes(key)) {
		                if (query[key]['min'] !== null && item[key] < query[key]['min']) {
		                    return false;
		                }
		                if (query[key]['max'] !== null && item[key] > query[key]['max']) {
		                    return false;
		                }
		            }
		            else if (!query[key].includes(item[key])) {
		                return false;
		            }
		        }
		        return true;
		    });
		    console.log("tps exec filtre: " + (new Date() - d1)/1000) 
		    return filteredData;
		};





		if (ind_filtering_type === "set_filter") {
			//prepare filter settings
			//does the targeted chart have a selection  ?
			var ind_target_chart_has_selection= false;
			if (params_chart_target.list_labels_segment_single_selected.length !== 0) {ind_target_chart_has_selection = true}

			//control to avoid refiltering the chart source with a value it provided first
			//if a filter exist on the targeted chart, AND the filtering process to handle is "set filter", find & exclude the field from the filter_array
			if (ind_target_chart_has_selection === true) {
				//check if the selected slice in the targeted chart has the same label than the categroy field of the filter_array
				if (params_chart.category_field === params_chart_target.category_field) {
					//delete the category field from the filter array
					for (var i = 0; i < filter_array.length; i++) {
						delete filter_array[i].category_field
					}
					
				}
			}
			
		

		    	var number_of_axis = Object.keys(filter_array[0]).length;
		    	var filter = {};


		    	//if the primary chart has one categorical axis, use this filter method
			    if (number_of_axis === 1) {
					category_field_array = []; sub_category_field_array = [];

					for (var i = 0; i < filter_array.length; i++) {
						if (filter_array[i].category_field !== undefined) {category_field_array.push(filter_array[i].category_field)};
						if (filter_array[i].sub_category_field !== undefined) {sub_category_field_array.push(filter_array[i].sub_category_field)}
						
					}

					//fill the filter dict with the fields to be used in the filtering process (the value of axis clicked in the primary chart, stored in params_chart)
					if (category_field_array.length > 0) {filter[params_chart.category_field] = category_field_array}
					if (sub_category_field_array.length > 0) {filter[params_chart.sub_category_field] = sub_category_field_array}

					//trigger the filtring process
					query = buildFilter(filter);
					var dataset_filtred = filterData(data_annonces_details_filtre, query);

					//save the fields used to filter the chart
					params_chart_target.filtered_by = filter				

			    }



				//if the primary chart has two categorical axis, use this filter method
			    else if (number_of_axis === 2) {
					category_field_array = []; sub_category_field_array = [];
					for (var i = 0; i < filter_array.length; i++) {
						if (filter_array[i].category_field !== undefined) {category_field_array.push(filter_array[i].category_field)};
						if (filter_array[i].sub_category_field !== undefined) {sub_category_field_array.push(filter_array[i].sub_category_field)}
					}
				

					//fill the filter dict with the fields to be used in the filtering process (the values of axis clicked in the primary chart, stored in params_chart)
					if (category_field_array.length > 0) {filter[params_chart.category_field] = category_field_array}
					if (sub_category_field_array.length > 0) {filter[params_chart.sub_category_field] = sub_category_field_array}

					//trigger the filtring process
					query = buildFilter(filter);
					var dataset_filtred = filterData(data_annonces_details_filtre, query);

					//save the fields used to filter the chart
					params_chart_target.filtered_by = filter				

			    }



			    //group by the dataset_filtred according to the nb of axis of the targeted chart
			    if (params_chart_target.nb_axis === 1) {
					//group by the value of field that represents the main axis in the targeted chart, stored in params_chart_target)
					//define which axis is available for use
		/*			if (filter[params_chart.category_field] !== undefined) {
						var grouping_field = params_chart_target.category_field
					}
					else if (filter[params_chart.sub_category_field] !== undefined) {
						var grouping_field = params_chart_target.sub_category_field
					}
					else {
						console.log("unable to define grouping field in crossfilter_master.js")
						return "unable to define grouping field in crossfilter_master.js"
					}*/


			        let groupedItem = _.groupBy(dataset_filtred, record => record[params_chart_target.category_field]);
			        dataset_filtred = _.map(groupedItem, (group, key) => {
			          return {
			            [params_chart_target.category_field]: group[0][params_chart_target.category_field],
			            moy_surface: _.meanBy(group, 'surface'),
			            med_surface: _.medianBy(group, 'surface'),
			            moy_prix_m2: _.meanBy(group, 'prix_m2_vente'),
			            med_prix_m2: _.medianBy(group, 'prix_m2_vente'),
			            moy_taux_renta: _.meanBy(group, 'taux_rendement_n7'),
			            med_taux_renta: _.medianBy(group, 'taux_rendement_n7'),
			            sum: _.sumBy(group, 'nb_log_n7'),
			            nb_log: _.sumBy(group, 'flag_ligne'),
			            nb_log2: _.countBy(group, 'flag_ligne')
			          };
			        });
			        console.log("tps exec lodash: " + (new Date() - d1)/1000)
			        
			        //trier tableau
			        dataset_filtred.sort(trier(params_chart_target.category_field, 'asc'))

			        return dataset_filtred	    	
			    }
		 
			    else if (params_chart_target.nb_axis === 2) {
					//group by the values of fields that represents the main & secondary axis in the targeted chart, stored in params_chart_target)
			        let groupedItem = _.groupBy(dataset_filtred, record => record[params_chart_target.category_field] + '_' +
			          record[params_chart_target.sub_category_field]);
			          dataset_filtred = _.map(groupedItem, (group, key) => {
			          return {
			            [params_chart_target.category_field]: group[0][params_chart_target.category_field],
			            [params_chart_target.sub_category_field]: group[0][params_chart_target.sub_category_field],
			            moy_surface: _.meanBy(group, 'surface'),
			            med_surface: _.medianBy(group, 'surface'),
			            moy_prix_m2: _.meanBy(group, 'prix_m2_vente'),
			            med_prix_m2: _.medianBy(group, 'prix_m2_vente'),
			            moy_taux_renta: _.meanBy(group, 'taux_rendement_n7'),
			            med_taux_renta: _.medianBy(group, 'taux_rendement_n7'),
			            sum: _.sumBy(group, 'nb_log_n7'),
			            nb_log: _.sumBy(group, 'flag_ligne'),
			            nb_log2: _.countBy(group, 'flag_ligne')
			          };
			        });

			        console.log("tps exec lodash: " + (new Date() - d1)/1000)
			        /*console.log('output: ', dataset_ChartJS);*/

			        //trier tableau
			        dataset_filtred.sort(trier(params_chart_target.category_field, 'asc'));
			        dataset_filtred.sort(trier(params_chart_target.sub_category_field, 'asc'))			
			    
			        return dataset_filtred

			    }

		}












		else if (ind_filtering_type === "remove_filter") {
	    	
	    	var filter = {};

	    	/*in the filtering process below, we filter the raw data source according to the nb of axis of the target chart 
	    	Before the final filter function, we must gather the active categories (selected slices) of all the other target charts, 
	    	(exception for the current target chart), and we include them in the filter below*/

	    	//if the target chart has one categorical axis, use this filter method
		    if (params_chart_target.nb_axis === 1) {
				var category_field_array = []; var sub_category_field_array = []; var category_field = ""; var sub_category_field = "";

				//if a slice is selected in another target chart, except the current one, collect these slices

				//deal case of 1 or 2 axis in the third target chart that has slice selected
				if (Object.keys(filter_array).length === 1) {
					/*for (var i = 0; i < filter_array.length; i++) {
						if (filter_array[i].category_field !== undefined) {category_field_array.push(filter_array[i].category_field)};
						if (filter_array[i].sub_category_field !== undefined) {sub_category_field_array.push(filter_array[i].sub_category_field)}
					}*/
					category_field = Object.keys(filter_array)[0];
					category_field_array = Object.values(filter_array);
					//add the slices collected into the filter dict
					if (category_field_array.length > 0) {filter[category_field] = category_field_array}
				}
				else if (Object.keys(filter_array).length === 2) {
					category_field = Object.keys(filter_array)[0]; sub_category_field = Object.keys(filter_array)[1];
					category_field_array = Object.values(filter_array)[0]; sub_category_field_array = Object.values(filter_array)[1];
					//add the slices collected into the filter dict
					if (category_field_array.length > 0) {filter[category_field] = category_field_array}
					if (sub_category_field_array.length > 0) {filter[sub_category_field] = sub_category_field_array}
					category_field_array = []; sub_category_field_array = [];
				}




				//collect the categories of the target chart and include them in the filter/ -> induit une ano de filtrage, peut être inutile
				category_field = params_chart_target.category_field; category_field_array = [...params_chart_target.activ_categories_values[0]];

				//add to the filter dict the values of active categories in the target chart, stored in params_chart
				if (category_field_array.length > 0) {filter[category_field] = category_field_array};





				//if the filter dict is filled, trigger the filtring process
				if (Object.keys(filter).length > 0) {
					var query = buildFilter(filter);
					var dataset_filtred = filterData(data_annonces_details_filtre, query);
				}
				else {
					var dataset_filtred = data_annonces_details_filtre
				}

				//save the fields used to filter the target chart
				params_chart_target.filtered_by = filter
		    }

			//if the target chart has two categorical axis, use this filter method
		    else if (params_chart_target.nb_axis === 2) {
				var category_field_array = []; var sub_category_field_array = []; var category_field =""; var sub_category_field=""

				//collect the categories of the target chart to include them in the filter				if (Object.keys(params_chart.filtered_by).length === 0) { 
/*				category_field = params_chart_target.category_field; category_field_array = [...params_chart_target.activ_categories_values[0]];
				sub_category_field = params_chart_target.sub_category_field; sub_category_field_array = [...params_chart_target.activ_sub_categories_values[0]];*/



				//if a slice is selected on another target than the current one, use it to filter the current target chart
				//deal case of 1 or 2 axis in the third target chart that has slice selected
				if (Object.keys(filter_array).length === 1) {
					category_field = Object.keys(filter_array)[0];
					category_field_array = Object.values(filter_array);
					//add the slices collected into the filter dict
					if (category_field_array.length > 0) {filter[category_field] = category_field_array}
				}
				else if (Object.keys(filter_array).length === 2) {
					category_field = Object.keys(filter_array)[0]; sub_category_field = Object.keys(filter_array)[1];
					category_field_array = Object.values(filter_array)[0]; sub_category_field_array = Object.values(filter_array)[1];
					//add the slices collected into the filter dict
					if (category_field_array.length > 0) {filter[category_field] = category_field_array}
					if (sub_category_field_array.length > 0) {filter[sub_category_field] = sub_category_field_array}
					category_field_array = []; sub_category_field_array = [];
				}




				//fill the filter dict with the fields to be used in the filtering process (the values of axis clicked in the primary chart, stored in params_chart)
/*				if (category_field_array.length > 0) {filter[category_field] = category_field_array}
				if (sub_category_field_array.length > 0) {filter[sub_category_field] = sub_category_field_array}*/

				//if the filter dict is filled, trigger the filtring process
				if (Object.keys(filter).length > 0) {
					var query = buildFilter(filter);
					var dataset_filtred = filterData(data_annonces_details_filtre, query);
				}
				else {
					var dataset_filtred = data_annonces_details_filtre
				}
				//save the fields used to filter the chart
				params_chart_target.filtered_by = filter				

		    }



		    /*below we have the grouping process for agregating the dataset at the target chartJS level
			IMPORTANT: the only common point between the filtering process above, and the grouping process below, is the dataset filtred above
			and used below - the axis are note the same*/
	    	//if the primary chart has one categorical axis, use this groupby method
		    if (params_chart_target.nb_axis === 1) {

		        let groupedItem = _.groupBy(dataset_filtred, record => record[params_chart_target.category_field]);
		        dataset_filtred = _.map(groupedItem, (group, key) => {
		          return {
		            [params_chart_target.category_field]: group[0][params_chart_target.category_field],
		            moy_surface: _.meanBy(group, 'surface'),
		            med_surface: _.medianBy(group, 'surface'),
		            moy_prix_m2: _.meanBy(group, 'prix_m2_vente'),
		            med_prix_m2: _.medianBy(group, 'prix_m2_vente'),
		            moy_taux_renta: _.meanBy(group, 'taux_rendement_n7'),
		            med_taux_renta: _.medianBy(group, 'taux_rendement_n7'),
		            sum: _.sumBy(group, 'nb_log_n7'),
		            nb_log: _.sumBy(group, 'flag_ligne'),
		            nb_log2: _.countBy(group, 'flag_ligne')
		          };
		        });
		        console.log("tps exec lodash: " + (new Date() - d1)/1000)
		        
		        //trier tableau
		        dataset_filtred.sort(trier(params_chart_target.category_field, 'asc'))

		        return dataset_filtred
		    }
	    	//if the primary chart has two categorical axis, use this groupby method
		    else if (params_chart_target.nb_axis === 2) {
				//group by the values of fields that represents the main & secondary axis in the targeted chart, stored in params_chart_target)
		        let groupedItem = _.groupBy(dataset_filtred, record => record[params_chart_target.category_field] + '_' +
		          record[params_chart_target.sub_category_field]);
		          dataset_filtred = _.map(groupedItem, (group, key) => {
		          return {
		            [params_chart_target.category_field]: group[0][params_chart_target.category_field],
		            [params_chart_target.sub_category_field]: group[0][params_chart_target.sub_category_field],
		            moy_surface: _.meanBy(group, 'surface'),
		            med_surface: _.medianBy(group, 'surface'),
		            moy_prix_m2: _.meanBy(group, 'prix_m2_vente'),
		            med_prix_m2: _.medianBy(group, 'prix_m2_vente'),
		            moy_taux_renta: _.meanBy(group, 'taux_rendement_n7'),
		            med_taux_renta: _.medianBy(group, 'taux_rendement_n7'),
		            sum: _.sumBy(group, 'nb_log_n7'),
		            nb_log: _.sumBy(group, 'flag_ligne'),
		            nb_log2: _.countBy(group, 'flag_ligne')
		          };
		        });

		        console.log("tps exec lodash: " + (new Date() - d1)/1000)
		        /*console.log('output: ', dataset_ChartJS);*/

		        //trier tableau
		        dataset_filtred.sort(trier(params_chart_target.category_field, 'asc'));
		        dataset_filtred.sort(trier(params_chart_target.sub_category_field, 'asc'))			
		    
		        return dataset_filtred

		    }		    

		}
	
}






	// Updated query
	/*var d1 = new Date();
	query = buildFilter(filter);
	result = filterData(data_annonces_details_ventes, query);
	console.log("tps exec filtre: " + (new Date() - d1)/1000)*/
	/*console.log(JSON.stringify(result, null, 4));*/


			// blueprint filter
	/*		filter = {
			    INSEE_COM: [
			        '64122', '64445', '06029'
			    ],
			    typedebien: [
			        'a'
			    ],
			    prix_m2_vente: {
			        min: 2000,
			        max: 6000
			    },
			    surface: {
			        min: 1,
			        max: null
			    },
			    nb_pieces: {
				    min: 1,
				    max: 5
			    },
			    typedetransaction: [
			        'v'
			    ]
			};*/

