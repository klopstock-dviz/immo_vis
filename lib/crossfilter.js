function crossfilter(params_chart,dataset_to_filter, filter_array) {

    var d1 = new Date();

    //zone de filtrage
/*    data_annonces_details_filtre = [...data_annonces_details_ventes_filtre_communes]*/
    /*if (clic_communes.length === 0) {
        clic_communes = [...communes_selected]
    }*/

    //count the number of axis in the filter array
    var number_of_axis = Object.keys(filter_array[0]).length;
    //if one categorical axis, use this filter method
    if (number_of_axis === 1) {
    
        //1.push in an array the category data
        var category_data_array =[];
        for (var i = 0; i < filter_array.length; i++) {
            category_data_array.push(filter_array[i].category_field)
        };

        //2.filter the data source with the categorical data selected
        category_data_array = deduplicate_array(category_data_array)
        dataset_filtred = dataset_to_filter.filter((item)=> category_data_array.indexOf(item[params_chart.category_field]) !== -1 &&
         item.nb_pieces < 9)
    }

    //if two categorical axis, use this filter method
    else if (number_of_axis === 2) {
        //1.push in an array the category data
        var category_data_array =[]; var sub_category_data_array =[];
        for (var i = 0; i < filter_array.length; i++) {
            category_data_array.push(filter_array[i].category_field);
            sub_category_data_array.push(filter_array[i].sub_category_field)
        };

        //2.filter the data source with the categorical data selected
        //2.1.specific values are given for sub_category_field:
        category_data_array = deduplicate_array(category_data_array); sub_category_data_array = deduplicate_array(sub_category_data_array)
        if (sub_category_data_array[0] !== "*") {
            dataset_filtred = dataset_to_filter.filter((item)=> category_data_array.indexOf(item[params_chart.category_field]) !== -1 &&
             sub_category_data_array.indexOf(item[params_chart.sub_category_field]) !== -1 && item.nb_pieces < 9)
        }
        else if (sub_category_data_array[0] === "*") {
            dataset_filtred = dataset_to_filter.filter((item)=> category_data_array.indexOf(item[params_chart.category_field]) !== -1 && 
                item.nb_pieces < 9)            
        }
    }


    //zone de regroupements
    //if one categorical axis, use this groupy method
/*    if (number_of_axis === 1) {
        var dataset_ChartJS = []
        let groupedItem = _.groupBy(data_annonces_details_filtre, record => record[params_chart.category_field]);
        dataset_ChartJS = _.map(groupedItem, (group, key) => {
          return {
            [params_chart.category_field]: group[0][params_chart.category_field],
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
        dataset_ChartJS.sort(trier(params_chart.category_field, 'asc'))
    }
    else if (number_of_axis === 2) {
        var dataset_ChartJS = []
        let groupedItem = _.groupBy(data_annonces_details_filtre, record => record[params_chart.category_field] + '_' +
          record[params_chart.sub_category_field]);
          dataset_ChartJS = _.map(groupedItem, (group, key) => {
          return {
            [params_chart.category_field]: group[0][params_chart.category_field],
            [params_chart.sub_category_field]: group[0][params_chart.sub_category_field],
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
        dataset_ChartJS.sort(trier(params_chart.category_field, 'asc'));
        dataset_ChartJS.sort(trier(params_chart.sub_category_field, 'asc'))
    }*/


    return dataset_filtred

}