/*créer un espace central accessible à tous les graphs, qui contiendra le dataset central à la source de tous les graphs, que ces derniers 
devront filtrer à chaque clic pour se rafraichir les uns les autres*/

/*cet espace devra avoir une fonction qui collecte en permanence l'ensemble des filtres posés sur les différents graphs, afin de les poser de
nouveau quand un graphique aditionnel est filtré*/

//preparer des tableaux séparés contenant les valeurs uniques de chaque champ fitrable du data source
//préparer des tests (if...) pour savoir qui des tableaux ci-dessus ou des filter_array, transmis par le stateManagement, doivent servir dans le filtre
//filtrer le data source sur la base du/des filtres utiles
//renvoyer le résultat filtré au stateManagement pour maj du graphique

function crossfilter_master(params_chart, params_chart_target, filter_array) {

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





		//prepare filter settings
		//does the targeted chart have a selection  ?
		var ind_target_chart_selected= false;
		if (params_chart_target.list_labels_segment_single_selected.length !== 0) {ind_target_chart_selected = true}

		//if true, find & exclude the selected filter from the filter_array
		if (ind_target_chart_selected === true) {
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
			filter[params_chart.category_field] = category_field_array

			//trigger the filtring process
			query = buildFilter(filter);
			var dataset_filtred = filterData(data_annonces_details_filtre, query);

	    }
		//if the primary chart has two categorical axis, use this filter method
	    else if (number_of_axis === 2) {
			category_field_array = []; sub_category_field_array = [];
			for (var i = 0; i < filter_array.length; i++) {
				category_field_array.push(filter_array[i].category_field)
				sub_category_field_array.push(filter_array[i].sub_category_field)
			}
		

			//fill the filter dict with the fields to be used in the filtering process (the values of axis clicked in the primary chart, stored in params_chart)
			filter[params_chart.category_field] = category_field_array
			filter[params_chart.sub_category_field] = sub_category_field_array

			//trigger the filtring process
			query = buildFilter(filter);
			var dataset_filtred = filterData(data_annonces_details_filtre, query);

	    }



	    //group by the dataset_filtred according to the nb of axis of the targeted chart
	    if (params_chart_target.nb_axis === 1) {
			//group by the value of field that represents the main axis in the targeted chart, stored in params_chart_target)	        
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


}








// Updated query
/*var d1 = new Date();
query = buildFilter(filter);
result = filterData(data_annonces_details_ventes, query);
console.log("tps exec filtre: " + (new Date() - d1)/1000)*/
/*console.log(JSON.stringify(result, null, 4));*/