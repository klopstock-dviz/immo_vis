
function exclusion_coordonnees_extremes() {
	let list_lat = []

	//extraire liste des  latitudes
	for (e in list_lat_lng) {
		list_lat.push(list_lat_lng[e][0])
	}


	let p10 = Percentile_30(list_lat)
	let p90 = Percentile_70(list_lat)

	//filtrer la liste sur les coordonées > au p10 et < au p90
	list_lat = list_lat.filter(function(item) {
	    return item >= p10 && item <= p90;
	});

	//récupérer les lng correspondant aux lat filtrées
	let current_lat;
	list_lat_lng_filtred = [];
	//1.parcours liste lat filtrée
	for (lat in list_lat) { 
		current_lat = list_lat[lat]

		//2.parcours liste lat_lng d'origine
		for (e in list_lat_lng) {

			//3.si lat actuelle filtrée = lat d'origine, récupérer la lng d'origine correspondante
			if (current_lat === list_lat_lng[e][0]) {
				list_lat_lng_filtred.push([current_lat, list_lat_lng[e][1]]);
				break;
			} 
		}
	}

	//remplacer liste d'origine par liste ajustée
	list_lat_lng = list_lat_lng_filtred

}