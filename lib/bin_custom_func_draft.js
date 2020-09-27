//-----------------------------------dev
function discretize(o) {
	var bin = o.x0.toString() + "-" + o.x1.toString()
	var bins_class = {"field": group,"bins_class": [bin][0], "agregate": d3.sum(o)}
	return bins_class
}

/*function build_binGenerator(array_to_bin, domain, thresholds) {

	 var binned = d3.histogram(array_to_bin)
	  .domain(domain)    // Set the domain to cover the entire intervall [0;]
	  .thresholds(thresholds);  // number of thresholds; this will create 19+1 bins
	return binned
}*/

var domain = [0,200]; var thresholds = 10
	var binGenerator = d3.histogram()
	  .domain(domain)    // Set the domain to cover the entire intervall [0;]
	  .thresholds(thresholds);  // number of thresholds; this will create 19+1 bins

//var binGenerator = build_binGenerator(array_to_bin,domain, thresholds);


//var bins = binGenerator(array_to_bin,domain, thresholds);

//array that contains the field for which the bin values shall be grouped
var field_group_by_bin = "nb_pieces"
var array_nb_pieces = deduplicate_dict(data_annonces_details_filtre, field_group_by_bin).sort()

var output = [];
for (var i = 0; i < array_nb_pieces.length; i++) {
	var group = array_nb_pieces[i]
	var array_to_bin = data_annonces_details_filtre.filter(n=> n.nb_pieces === group).map(o=> o.surface)

	array_to_bin = binGenerator(array_to_bin)

	var data_binned = array_to_bin.map(discretize)

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


final = final.map(o=> o["sortKey"]= parseInt(o.bins_class.substring(0, o.bins_class.indexOf("-")))).filter(p=> p.agregate > 0)
final = final.sort(trier("sortKey", 'asc'))

//-----------------------------------end dev









//-----------------------------------prod
//simulate params_chart:
params_chart = {}
params_chart["category_field"] = "surface"
params_chart["sub_category_field"] = "nb_pieces"
params_chart["bin_params"] = {bin_field: "surface", domain: [0,"q0.95"], thresholds: 10}

function discretize(o, group, agg) {
	var bin = o.x0.toString() + "-" + o.x1.toString()
	if (agg === "count") {
		var bins_class = {[params_chart.bin_params.bin_field]: [bin][0], [params_chart.sub_category_field]: group, [agg]: o.length}
	}
	else {
		var bins_class = {[params_chart.bin_params.bin_field]: [bin][0], [params_chart.sub_category_field]: group, [agg]: d3[agg](o)}
	}
	return bins_class
}

dataset = [...data_annonces_details_ventes]
//check if a max domain is provided, if no pick up the q95 value of the bin_field
if (params_chart.bin_params.domain[1] === "auto") {
	params_chart.bin_params.domain[1] = d3.max(dataset, o=> o[params_chart.bin_params.bin_field])
}
else if (params_chart.bin_params.domain[1].indexOf("q" > -1)) {
	var quartil = params_chart.bin_params.domain[1]
	quartil = parseFloat(quartil.replace("q",""))
	params_chart.bin_params.domain[1] = Quartile(dataset.map(o=> o[params_chart.bin_params.bin_field]), quartil)
};

//var domain = [0,200]; var thresholds = 10
	var binGenerator = d3.histogram()
	  .domain(params_chart.bin_params.domain)    // Set the domain to cover the entire intervall [0;]
	  .thresholds(params_chart.bin_params.thresholds);  // number of thresholds; this will create 19+1 bins




//var bins = binGenerator(array_to_bin,domain, thresholds);

//array that contains the field for which the bin values shall be grouped
var array_nb_pieces = deduplicate_dict(dataset, params_chart.sub_category_field).sort()

var output = [];
for (var i = 0; i < array_nb_pieces.length; i++) {
	var group = array_nb_pieces[i]
	var array_to_bin = dataset.filter(n=> n[params_chart.sub_category_field] === group).map(o=> o[params_chart.bin_params.bin_field])


	array_to_bin = binGenerator(array_to_bin)
	var agg_type = "count"
	var data_binned = array_to_bin.map(o => discretize(o,group,"count"))

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


final.map(o=> o["sortKey"]= parseInt(o[params_chart.bin_params.bin_field].substring(0, o[params_chart.bin_params.bin_field].indexOf("-"))))
final = final.filter(p=> p[agg_type] > 0)
final = final.sort(trier("sortKey", 'asc'))

//-----------------------------------end prod