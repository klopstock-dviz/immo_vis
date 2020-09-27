//form first group that correspond to the highest level of hierarchy
var groupedItem_n1 = _.groupBy(data_annonces_details_ventes, record => record["DEP"]);
var dataset_ChartJS_n1 = _.map(groupedItem_n1, (group, key) => {
		          return {
		            ["DEP"]: group[0]["DEP"],		            
		            ["prix_m2_median"]: _["medianBy"](group, "prix_m2_vente")
		            
		          };
		        });

0: {DEP: "13", prix_m2_median: 3580.0550000000003}
1: {DEP: "16", prix_m2_median: 1285.27}
2: {DEP: "17", prix_m2_median: 2431.58}
3: {DEP: "19", prix_m2_median: 1245.76}
4: {DEP: "23", prix_m2_median: 683.17}
5: {DEP: "24", prix_m2_median: 1532.09}
6: {DEP: "33", prix_m2_median: 3671.72}

//form second group that correspond to the next level of hierarchy
var groupedItem_n2 = _.groupBy(data_annonces_details_ventes, record => record["DEP"] + '_' + record["INSEE_COM"]);
var dataset_ChartJS_n2 = _.map(groupedItem_n2, (group, key) => {
		          return {
		            ["DEP"]: group[0]["DEP"],
		            ["INSEE_COM"]: group[0]["INSEE_COM"],
		            ["prix_m2_median"]: _["medianBy"](group, "prix_m2_vente")
		            
		          };
		        });


 {DEP: "33", INSEE_COM: "33119", prix_m2_median: 3764.915}
1: {DEP: "33", INSEE_COM: "33063", prix_m2_median: 4875}
2: {DEP: "23", INSEE_COM: "23157", prix_m2_median: 904.67}
3: {DEP: "23", INSEE_COM: "23189", prix_m2_median: 709.68}
4: {DEP: "19", INSEE_COM: "19010", prix_m2_median: 1005.46}
5: {DEP: "87", INSEE_COM: "87070", prix_m2_median: 1576.57}
6: {DEP: "86", INSEE_COM: "86288", prix_m2_median: 920.13}
7: {DEP: "47", INSEE_COM: "47043", prix_m2_median: 1000}
8: {DEP: "33", INSEE_COM: "33069", prix_m2_median: 5068.49}
9: {DEP: "64", INSEE_COM: "64024", prix_m2_median: 5116.28}
10: {DEP: "19", INSEE_COM: "19031", prix_m2_median: 1533.475}
11: {DEP: "64", INSEE_COM: "64102", prix_m2_median: 4032.26}
12: {DEP: "87", INSEE_COM: "87114", prix_m2_median: 1811.63}
13: {DEP: "17", INSEE_COM: "17224", prix_m2_median: 1034.0549999999998}
14: {DEP: "87", INSEE_COM: "87024", prix_m2_median: 838.98}
15: {DEP: "19", INSEE_COM: "19260", prix_m2_median: 1610.425}


//extract into an array the different DEP values from the second group, then fiter the first group with that array
//1.form the array
var list_n1 = deduplicate_dict(dataset_ChartJS_n2, "DEP").filter(d=> d !== "" && d !== undefined)

//2.filter the first group with that array
var data_input_line = dataset_ChartJS_n1.filter(d=> list_n1.indexOf(d.DEP))





//v2: the n2 grouping takes only the category field
//form first group that correspond to the highest level of hierarchy
//example DEP:
	var groupedItem_n1 = _.groupBy(sharedParams.data_main, record => record["DEP"]);
	var dataset_ChartJS_n1 = _.map(groupedItem_n1, (group, key) => {
			          return {
			            ["DEP"]: group[0]["DEP"],		            
			            ["prix_m2_median"]: _["medianBy"](group, "prix_m2_vente")
			            
			          };
			        });

	0: {DEP: "17", prix_m2_median: 4251.925}
	1: {DEP: "33", prix_m2_median: 4725}
	2: {DEP: "64", prix_m2_median: 1990.45}
	3: {DEP: "87", prix_m2_median: 1530.63}


//example nb_pieces:
	var groupedItem_n1_e2 = _.groupBy(sharedParams.data_main, record => record["nb_pieces"]);
	var dataset_ChartJS_n1_e2 = _.map(groupedItem_n1_e2, (group, key) => {
			          return {
			            ["nb_pieces"]: group[0]["nb_pieces"], 
			            ["prix_m2_median"]: _["medianBy"](group, "prix_m2_vente")
			            
			          };
			        });

	0: {nb_pieces: 1, prix_m2_median: 5000}
	1: {nb_pieces: 2, prix_m2_median: 4424.305}
	2: {nb_pieces: 3, prix_m2_median: 4202.9}
	3: {nb_pieces: 4, prix_m2_median: 4200}
	4: {nb_pieces: 5, prix_m2_median: 4215.05}
	5: {nb_pieces: 6, prix_m2_median: 4086.36}
	6: {nb_pieces: 7, prix_m2_median: 3816.1850000000004}
	7: {nb_pieces: 8, prix_m2_median: 3807.02}



//form second group that correspond to the next level of hierarchy
var groupedItem_n2 = _.groupBy(sharedParams.data_main, record => record["INSEE_COM"]);
var dataset_ChartJS_n2 = _.map(groupedItem_n2, (group, key) => {
		          return {
		            ["INSEE_COM"]: group[0]["INSEE_COM"],
		            ["prix_m2_median"]: _["medianBy"](group, "prix_m2_vente")
		            
		          };
		        });


0: {INSEE_COM: "17300", prix_m2_median: 4555.56}
1: {INSEE_COM: "17306", prix_m2_median: 3444.44}
2: {INSEE_COM: "33063", prix_m2_median: 4882.35}
3: {INSEE_COM: "33281", prix_m2_median: 4113.43}
4: {INSEE_COM: "64445", prix_m2_median: 1990.45}
5: {INSEE_COM: "87085", prix_m2_median: 1530.63}


