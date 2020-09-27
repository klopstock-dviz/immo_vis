function groupBy(dataset, fields) {
	var fields = fields.join('_')
	let groupedItem = _.groupBy(data_chart, record => record[params_chart.category_field] + '_' +
	      record[params_chart.sub_category_field]);
	if (params_chart.numerical_field_params.agg_type === "count") {
	    dataset_ChartJS = _.map(groupedItem, (group, key) => {
	      return {
	        [params_chart.category_field]: group[0][params_chart.category_field],
	        [params_chart.sub_category_field]: group[0][params_chart.sub_category_field],
	        [agg_fieldName]: (group.length)
	      };
	    });
	}
	else {
	    dataset_ChartJS = _.map(groupedItem, (group, key) => {
	      return {
	        [params_chart.category_field]: group[0][params_chart.category_field],
	        [params_chart.sub_category_field]: group[0][params_chart.sub_category_field],
	        [agg_fieldName]: _[agg_name_lodash](group, params_chart.numerical_field_params.fieldName)
	        
	      };
	    });
	}

}