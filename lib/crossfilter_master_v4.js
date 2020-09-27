/*créer un espace central accessible à tous les graphs, qui contiendra le dataset central à la source de tous les graphs, que ces derniers 
devront filtrer à chaque clic pour se rafraichir les uns les autres*/

/*cet espace devra avoir une fonction qui collecte en permanence l'ensemble des filtres posés sur les différents graphs, afin de les poser de
nouveau quand un graphique aditionnel est filtré*/

//preparer des tableaux séparés contenant les valeurs uniques de chaque champ fitrable du data source
//préparer des tests (if...) pour savoir qui des tableaux ci-dessus ou des filter_array, transmis par le stateManagement, doivent servir dans le filtre
//filtrer le data source sur la base du/des filtres utiles
//renvoyer le résultat filtré au stateManagement pour maj du graphique


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
		    /*console.log("tps exec filtre: " + (new Date() - d1)/1000) */
		    return filteredData;
		};


		function round_numbers(dataset_filtred, agg_fieldName) {
	        //round numbers
		    for (d in dataset_filtred) {
		    	dataset_filtred[d][agg_fieldName] = Math.round(dataset_filtred[d][agg_fieldName] * 100) / 100

		    };
		    return dataset_filtred
		}





		if (ind_filtering_type === "set_filter") {
			//prepare filter settings
			//does the targeted chart has a selection  ?
			var ind_target_chart_has_selection= false;
			var number_of_axis_in_filter_array = Object.keys(filter_array).length;
			if (params_chart_target.list_labels_segment_single_selected.length !== 0) {ind_target_chart_has_selection = true}


			
				    	
		    	var filter = {};


		    	//if the primary chart has at least one categorical axis, use this filter method
			    if (number_of_axis_in_filter_array > 0) {

					Object.assign(filter, filter_array)

					//trigger the filtring process
					query = buildFilter(filter);
					var dataset_filtred = filterData(params_chart_target.data_main, query);

					//save the chart source that filters the current target used to filter the chart
					params_chart_target.filtered_by = {"id": params_chart.id, "params_chart": params_chart, "axis": filter}

			    }


			    //group by the dataset_filtred according to the nb of axis of the targeted chart
			    if (params_chart_target.nb_axis === 1 && params_chart_target.bin_params.bin === false) {
					//group by the value of field that represents the main axis in the targeted chart, stored in params_chart_target)
					//define which axis is available for use
			     //    var agg_name_lodash = params_chart_target.numerical_field_params.agg_type + "By";
			     //    var agg_fieldName = params_chart_target.numerical_field_params.agg_type + "_" + params_chart_target.numerical_field_params.fieldName
			     //    params_chart_target.numerical_field_params.agg_fieldName = agg_fieldName

			     //    let groupedItem = _.groupBy(dataset_filtred, record => record[params_chart_target.category_field]);
			       
			     //    if (params_chart_target.numerical_field_params.agg_type === "count") {
				    //     dataset_filtred = _.map(groupedItem, (group, key) => {
				    //       return {
				    //         [params_chart_target.category_field]: group[0][params_chart_target.category_field],
				    //         [agg_fieldName]: (group.length)
				    //       };
				    //     });
			     //    }
			     //    else {
				    //     dataset_filtred = _.map(groupedItem, (group, key) => {
				    //       return {
				    //         [params_chart_target.category_field]: group[0][params_chart_target.category_field],
				    //         [agg_fieldName]: _[agg_name_lodash](group, params_chart_target.numerical_field_params.fieldName)
				    //       };
				    //     });
				    // }

			     //    var dataset_filtred = round_numbers(dataset_filtred, agg_fieldName);


			        /*console.log("tps exec lodash: " + (new Date() - d1)/1000)*/
			        
			        //trier tableau
			        var dataset_grouped = params_chart_target.instanciator.prepare_data_p1(params_chart_target, dataset_filtred)

			        return dataset_grouped
			    }
		 
			    else if (params_chart_target.nb_axis === 2 && params_chart_target.bin_params.bin === false) {
					//group by the values of fields that represents the main & secondary axis in the targeted chart, stored in params_chart_target)
			        var agg_name_lodash = params_chart_target.numerical_field_params.agg_type + "By";
			        var agg_fieldName = params_chart_target.numerical_field_params.agg_type + "_" + params_chart_target.numerical_field_params.fieldName
			        params_chart_target.numerical_field_params.agg_fieldName = agg_fieldName
			        let groupedItem = _.groupBy(dataset_filtred, record => record[params_chart_target.category_field] + '_' +
			          record[params_chart_target.sub_category_field]);

			        if (params_chart_target.numerical_field_params.agg_type === "count") {
				        dataset_filtred = _.map(groupedItem, (group, key) => {
				          return {
				            [params_chart_target.category_field]: group[0][params_chart_target.category_field],
				            [params_chart_target.sub_category_field]: group[0][params_chart_target.sub_category_field],
				            [agg_fieldName]: (group.length)
				          };
				        });
			        }
			        else {
				        dataset_filtred = _.map(groupedItem, (group, key) => {
				          return {
				            [params_chart_target.category_field]: group[0][params_chart_target.category_field],
				            [params_chart_target.sub_category_field]: group[0][params_chart_target.sub_category_field],
				            [agg_fieldName]: _[agg_name_lodash](group, params_chart_target.numerical_field_params.fieldName)
				          };
				        });
				    }


			          /*dataset_filtred = _.map(groupedItem, (group, key) => {
			          return {
			            [params_chart_target.category_field]: group[0][params_chart_target.category_field],
			            [params_chart_target.sub_category_field]: group[0][params_chart_target.sub_category_field],
			            [agg_fieldName]: _[agg_name_lodash](group, params_chart_target.numerical_field_params.fieldName)
			          };
			        });*/

			        var dataset_filtred = round_numbers(dataset_filtred, agg_fieldName);

			        /*console.log("tps exec lodash: " + (new Date() - d1)/1000)*/
			        /*console.log('output: ', dataset_filtred);*/

			        //trier tableau
			        dataset_filtred.sort(trier(params_chart_target.category_field, 'asc'));
			        dataset_filtred.sort(trier(params_chart_target.sub_category_field, 'asc'))			
			    
			        return dataset_filtred

			    }
			    else if (params_chart_target.nb_axis === 1 && params_chart_target.bin_params.bin === true) {
			        //to develop
			    }


			    else if (params_chart_target.nb_axis === 2 && params_chart_target.bin_params.bin === true) {
			        var dataset_filtred = main_bin(dataset_filtred, params_chart_target)
			        return dataset_filtred
			    }

		}












		else if (ind_filtering_type === "remove_filter") {
	    	
	    	var filter = {};

	    	/*in the filtering process below, we filter the raw data source according to the nb of axis of the target chart 
	    	Before the final filter function, we must gather the active categories (selected slices) of all the other target charts, 
	    	(exception for the current target chart), and we include them in the filter below*/

	    	//if the target chart has one categorical axis, use this filter method
		    if (params_chart_target.nb_axis >= 1) {
				var category_field_array = []; var sub_category_field_array = []; var category_field = ""; var sub_category_field = "";
				
				Object.assign(filter, filter_array)				

				//if the filter dict is filled, trigger the filtring process
				if (Object.keys(filter).length > 0) {
					var query = buildFilter(filter);
					var dataset_filtred = filterData(params_chart_target.data_main, query);
				}
				//else take the whole data source
				else {
					var dataset_filtred = params_chart_target.data_main
				}
				
				//save the chart source that filters the current target used to filter the chart
				params_chart_target.filtered_by = {"id": params_chart.id, "params_chart": params_chart, "axis": filter}
		    }









		    

		    /*below we have the grouping process for agregating the dataset at the target chartJS level
			IMPORTANT: the only common point between the filtering process above, and the grouping process below, is the dataset filtred above
			and used below - the axis are note the same*/
	    	//if the primary chart has one categorical axis, use this groupby method
		    if (params_chart_target.nb_axis === 1 && params_chart_target.bin_params.bin === false) {
		        /*var agg_name_lodash = params_chart_target.numerical_field_params.agg_type + "By";
		        var agg_fieldName = params_chart_target.numerical_field_params.agg_type + "_" + params_chart_target.numerical_field_params.fieldName
		        params_chart_target.numerical_field_params.agg_fieldName = agg_fieldName

		        let groupedItem = _.groupBy(dataset_filtred, record => record[params_chart_target.category_field]);

		        if (params_chart_target.numerical_field_params.agg_type === "count") {
			        dataset_filtred = _.map(groupedItem, (group, key) => {
			          return {
			            [params_chart_target.category_field]: group[0][params_chart_target.category_field],
			            [agg_fieldName]: (group.length)
			          };
			        });
		        }
		        else {
			        dataset_filtred = _.map(groupedItem, (group, key) => {
			          return {
			            [params_chart_target.category_field]: group[0][params_chart_target.category_field],
			            [agg_fieldName]: _[agg_name_lodash](group, params_chart_target.numerical_field_params.fieldName)
			          };
			        });
			    }*/

		        /*dataset_filtred = _.map(groupedItem, (group, key) => {
		          return {
		            [params_chart_target.category_field]: group[0][params_chart_target.category_field],
            		[agg_fieldName]: _[agg_name_lodash](group, params_chart_target.numerical_field_params.fieldName)
		            
		          };
		        });*/

			    //var dataset_filtred = round_numbers(dataset_filtred, agg_fieldName);


		        /*console.log("tps exec lodash: " + (new Date() - d1)/1000)*/
		        
		        //trier tableau
		        //dataset_filtred.sort(trier(params_chart_target.category_field, 'asc'))

		        var dataset_grouped = params_chart_target.instanciator.prepare_data_p1(params_chart_target, dataset_filtred)

		        return dataset_grouped		        

		    }
	    	//if the primary chart has two categorical axis, use this groupby method
		    else if (params_chart_target.nb_axis === 2 && params_chart_target.bin_params.bin === false) {
				//group by the values of fields that represents the main & secondary axis in the targeted chart, stored in params_chart_target)
			        var agg_name_lodash = params_chart_target.numerical_field_params.agg_type + "By";
			        var agg_fieldName = params_chart_target.numerical_field_params.agg_type + "_" + params_chart_target.numerical_field_params.fieldName
			        params_chart_target.numerical_field_params.agg_fieldName = agg_fieldName

		        let groupedItem = _.groupBy(dataset_filtred, record => record[params_chart_target.category_field] + '_' +
		          record[params_chart_target.sub_category_field]);

		        if (params_chart_target.numerical_field_params.agg_type === "count") {
			        dataset_filtred = _.map(groupedItem, (group, key) => {
			          return {
			            [params_chart_target.category_field]: group[0][params_chart_target.category_field],
			            [params_chart_target.sub_category_field]: group[0][params_chart_target.sub_category_field],
			            [agg_fieldName]: (group.length)
			          };
			        });
		        }
		        else {
			        dataset_filtred = _.map(groupedItem, (group, key) => {
			          return {
			            [params_chart_target.category_field]: group[0][params_chart_target.category_field],
			            [params_chart_target.sub_category_field]: group[0][params_chart_target.sub_category_field],
			            [agg_fieldName]: _[agg_name_lodash](group, params_chart_target.numerical_field_params.fieldName)
			          };
			        });
			    }


		          /*dataset_filtred = _.map(groupedItem, (group, key) => {
		          return {
		            [params_chart_target.category_field]: group[0][params_chart_target.category_field],
		            [params_chart_target.sub_category_field]: group[0][params_chart_target.sub_category_field],
            		[agg_fieldName]: _[agg_name_lodash](group, params_chart_target.numerical_field_params.fieldName)		        
		          };
		        });*/

			    
			    var dataset_filtred = round_numbers(dataset_filtred, agg_fieldName);

		        /*console.log("tps exec lodash: " + (new Date() - d1)/1000)*/
		        /*console.log('output: ', dataset_filtred);*/

		        //trier tableau
		        dataset_filtred.sort(trier(params_chart_target.category_field, 'asc'));
		        dataset_filtred.sort(trier(params_chart_target.sub_category_field, 'asc'))			
		    
		        return dataset_filtred

		    }
		    else if (params_chart_target.nb_axis === 1 && params_chart_target.bin_params.bin === true) {
		        //to develop
		    }


		    else if (params_chart_target.nb_axis === 2 && params_chart_target.bin_params.bin === true) {
		        var dataset_filtred = main_bin(dataset_filtred, params_chart_target)
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

