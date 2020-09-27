var data_annonces_details_filtre = [];
function prepare_data_p1(params_chart, data_to_transform) {

    var d1 = new Date();

    //zone de filtrage
    //filter the primary data source according to the scope of the vizualisation (limited geographic area, range of time, any specific observation)
    if (data_annonces_details_filtre.length === 0) {
        
        data_annonces_details_filtre = data_annonces_details_ventes_filtre_communes.filter((item)=> scope_array.indexOf(item[params_chart.scope_field]) !== -1 && item.nb_pieces < 9)
    }



    var result_filter = []; var data_filtred = [...data_annonces_details_ventes]
    transformations.filter.map(f=> {
        
        if (f.operation === "include") {
            data_filtred = data_filtred.filter((item)=> f.values.indexOf(item[f.field]) !== -1)
        }
        else if (f.operation === "exclude") {
            data_filtred = data_filtred.filter((item)=> f.values.indexOf(item[f.field]) === -1)
        }        
        else if (f.operation === "<") {
            var fieldName = f.field; var fieldValue = f.value
            data_filtred = data_filtred.filter((item)=> item[fieldName] < fieldValue)
        }
        else if (f.operation === ">") {
            var fieldName = f.field; var fieldValue = f.value
            data_filtred = data_filtred.filter((item)=> item[fieldName] > fieldValue)
        }
        else if (f.operation === "<=") {
            var fieldName = f.field; var fieldValue = f.value
            data_filtred = data_filtred.filter((item)=> item[fieldName] <= fieldValue)
        }
        else if (f.operation === ">=") {
            var fieldName = f.field; var fieldValue = f.value
            data_filtred = data_filtred.filter((item)=> item[fieldName] >= fieldValue)
        }
        else if (f.operation === "between") {
            var fieldName = f.field; var fieldValueMin = f.valueMin; var fieldValueMax = f.valueMax;
            data_filtred = data_filtred.filter((item)=> item[fieldName] >= fieldValueMin && item[fieldName] <= fieldValueMax)
        }        

        result_filter.push(data_filtred)

    })



    //count the number of axis in the filter array
    var number_of_axis = [params_chart.category_field, params_chart.sub_category_field].filter(o=> o!== "").length
    


    //zone de regroupements
    //if one categorical axis, use this groupy method
    if (number_of_axis === 1 && params_chart.bin_params.bin === false) {
        var dataset_ChartJS = [];
        var agg_name_lodash = params_chart.numerical_field_params.agg_type + "By";
        var agg_fieldName = params_chart.numerical_field_params.agg_type + "_" + params_chart.numerical_field_params.fieldName
        params_chart.numerical_field_params.agg_fieldName = agg_fieldName
        let groupedItem = _.groupBy(data_annonces_details_filtre, record => record[params_chart.category_field]);
        dataset_ChartJS = _.map(groupedItem, (group, key) => {
          return {
            [params_chart.category_field]: group[0][params_chart.category_field],
            [agg_fieldName]: _[agg_name_lodash](group, params_chart.numerical_field_params.fieldName)
            /*moy_surface: _.meanBy(group, 'surface'),
            med_surface: _.medianBy(group, 'surface'),
            moy_prix_m2: _.meanBy(group, 'prix_m2_vente'),
            med_prix_m2: _.medianBy(group, 'prix_m2_vente'),
            moy_taux_renta: _.meanBy(group, 'taux_rendement_n7'),
            med_taux_renta: _.medianBy(group, 'taux_rendement_n7'),
            sum: _.sumBy(group, 'nb_log_n7'),
            nb_log: _.sumBy(group, 'flag_ligne'),
            nb_log2: _.countBy(group, 'flag_ligne')*/
          };
        });
        console.log("tps exec lodash: " + (new Date() - d1)/1000)
        /*console.log('output: ', dataset_ChartJS);*/

        //trier tableau
        dataset_ChartJS.sort(trier(params_chart.category_field, 'asc'))
        //round values
        dataset_ChartJS = round_values(dataset_ChartJS, agg_fieldName)        
    }
    else if (number_of_axis === 2 && params_chart.bin_params.bin === false) {
        var dataset_ChartJS = [];
        var agg_name_lodash = params_chart.numerical_field_params.agg_type + "By";
        var agg_fieldName = params_chart.numerical_field_params.agg_type + "_" + params_chart.numerical_field_params.fieldName;
        params_chart.numerical_field_params.agg_fieldName = agg_fieldName;
        let groupedItem = _.groupBy(data_annonces_details_filtre, record => record[params_chart.category_field] + '_' +
          record[params_chart.sub_category_field]);
          dataset_ChartJS = _.map(groupedItem, (group, key) => {
          return {
            [params_chart.category_field]: group[0][params_chart.category_field],
            [params_chart.sub_category_field]: group[0][params_chart.sub_category_field],
            [agg_fieldName]: _[agg_name_lodash](group, params_chart.numerical_field_params.fieldName)
            /*moy_surface: _.meanBy(group, 'surface'),
            med_surface: _.medianBy(group, 'surface'),
            moy_prix_m2: _.meanBy(group, 'prix_m2_vente'),
            med_prix_m2: _.medianBy(group, 'prix_m2_vente'),
            moy_taux_renta: _.meanBy(group, 'taux_rendement_n7'),
            med_taux_renta: _.medianBy(group, 'taux_rendement_n7'),
            sum: _.sumBy(group, 'nb_log_n7'),
            nb_log: _.sumBy(group, 'flag_ligne'),
            nb_log2: _.countBy(group, 'flag_ligne')*/
          };
        });
        console.log("tps exec lodash: " + (new Date() - d1)/1000)
        /*console.log('output: ', dataset_ChartJS);*/

        //trier tableau
        dataset_ChartJS.sort(trier(params_chart.category_field, 'asc'));
        dataset_ChartJS.sort(trier(params_chart.sub_category_field, 'asc'))

        //round values
        dataset_ChartJS = round_values(dataset_ChartJS, agg_fieldName)
    }



    else if (number_of_axis === 1 && params_chart.bin_params.bin === true) {
        //to develop
    }


    else if (number_of_axis === 2 && params_chart.bin_params.bin === true) {
        var dataset_ChartJS = main_bin(data_annonces_details_filtre, params_chart)
    }
    
    function round_values(dataset_ChartJS, agg_fieldName) {

        for (d in dataset_ChartJS) {
            dataset_ChartJS[d][agg_fieldName] = Math.round(dataset_ChartJS[d][agg_fieldName] * 100) / 100

        };
        return dataset_ChartJS
    }

    return dataset_ChartJS

}