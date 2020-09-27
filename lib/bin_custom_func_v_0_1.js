function discretize(o, group, agg, params_chart) {
	var bin = o.x0.toFixed() + "-" + o.x1.toFixed()
	var agg_fieldName = params_chart.bin_params.agg_type + "_" + params_chart.bin_params.bin_field;
	if (agg === "count") {
		var bins_class = {[params_chart.bin_params.bin_field]: [bin][0], [params_chart.sub_category_field]: group, [agg]: o.length}
	}
	else {
		var bins_class = {[params_chart.bin_params.bin_field]: [bin][0], [params_chart.sub_category_field]: group, [agg]: d3[agg](o)}
	}
	return bins_class
}

//dataset = [...data_annonces_details_ventes]
function main_bin(dataset, params_chart) {
	//check if a min domain is provided, if no pick up the min value of the bin_field
	if (params_chart.bin_params.domain[0] === "auto") {
		params_chart.bin_params.domain[0] = d3.min(dataset, o=> o[params_chart.bin_params.bin_field])
	}
	else if (typeof(params_chart.bin_params.domain[0]) === "string") {
		if (params_chart.bin_params.domain[0].indexOf("p") > -1) {
			var quartil = params_chart.bin_params.domain[0]
			quartil = parseFloat(quartil.replace("p",""))
			params_chart.bin_params.domain[0] = Quartile(dataset.map(o=> o[params_chart.bin_params.bin_field]), quartil)
		}
	};

	//check if a max domain is provided, if no pick up the max value of the bin_field
	if (params_chart.bin_params.domain[1] === "auto") {
		params_chart.bin_params.domain[1] = d3.max(dataset, o=> o[params_chart.bin_params.bin_field])
	}
	else if (typeof(params_chart.bin_params.domain[1]) === "string") {
		if (params_chart.bin_params.domain[1].indexOf("p") > -1) {
			var quartil = params_chart.bin_params.domain[1]
			quartil = parseFloat(quartil.replace("p",""))
			params_chart.bin_params.domain[1] = Quartile(dataset.map(o=> o[params_chart.bin_params.bin_field]), quartil)
		}
	};

	//var domain = [0,200]; var thresholds = 10
	var binGenerator = d3.histogram()
	  .domain(params_chart.bin_params.domain)    // Set the domain to cover the entire intervall [0;]
	  .thresholds(params_chart.bin_params.thresholds);  // number of thresholds; this will create 19+1 bins




	//var bins = binGenerator(array_to_bin,domain, thresholds);

	//array that contains the field for which the bin values shall be grouped
	var array_sub_category_field = deduplicate_dict(dataset, params_chart.sub_category_field).sort()

	var output = [];
	for (var i = 0; i < array_sub_category_field.length; i++) {
		var group = array_sub_category_field[i]
		var array_to_bin = dataset.filter(n=> n[params_chart.sub_category_field] === group).map(o=> o[params_chart.bin_params.bin_field])


		array_to_bin = binGenerator(array_to_bin)
		
		var data_binned = array_to_bin.map(o => discretize(o,group,params_chart.bin_params.agg_type, params_chart))

		//_.merge(output, data_binned)
		output.push(data_binned)
		//output = d3.merge([data_binned, output])
	}

	var final = []
	for (var i = 0; i < output.length; i++) {
		var t = output[i]
		for (var a = 0; a < t.length; a++) {
			final.push(t[a])
		}
	 	
	 } 


	//sort data
	//1.add technical key for sorting
	final.map(o=> o["sortKey"]= parseInt(o[params_chart.bin_params.bin_field].substring(0, o[params_chart.bin_params.bin_field].indexOf("-"))))
	//2.exclude 0 fields
	//final = final.filter(p=> p[params_chart.bin_params.agg_type] > 0)
	//3.sort
	final = final.sort(trier("sortKey", 'asc'))

	return final
	//-----------------------------------end prod

}