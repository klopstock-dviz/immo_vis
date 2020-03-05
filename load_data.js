	//data annonces
	let df_global = [], list_lat_lng = [], couple = [], quartiers_a_projeter = [], df_ville_quartiers_gps = [], clic_quartier = [], list_markers = []
	async function fetchData2() {
		let data1 = await d3.csv("https://raw.githubusercontent.com/klopstock-dviz/immo_vis/master/dataset_vega.csv");
		
		//df_global_1 = await data0
		
		for (row in data1) {
			df_global.push(data1[row]);
		};
		var monthNameFormat = '', date = ''; monthNameFormat = d3.timeFormat("%b-%Y");


		df_global.forEach(function(d) {
	      d.prix_bien = +d.prix_bien;
	      d.surface = +d.surface;
	      d["mapCoordonneesLatitude"] = +d["mapCoordonneesLatitude"];
	      d["mapCoordonneesLongitude"] = +d["mapCoordonneesLongitude"];  
		  		
			d["date"] = monthNameFormat(new Date(d.date_first_observation)); // result = "Mar-2003"
			d["prix_m²"] = Math.round(d.prix_bien / d.surface) //arrondi précis: +((d.prix_bien / d.surface).toFixed(2))

	    });
	}

	fetchData2();


function filtre_ref_ville_quartier_gps() {
	console.log("la variable df_global taille de : " + (df_global.length) + " est chargée");

			//filtrer le référentiel ville_quartiers_gps sur les ventes
		df_global = df_global.filter(function(item) {
		    return item.typedetransaction ==='Vente' && item["prix_m²"] > 1000 && item["prix_m²"] < 25000;
		});


		//former un subset ville-quartier-gps

		for (row in df_global) {
			lng = df_global[row].mapCoordonneesLongitude
			if (lng !== 0 || lng !== 0.0) {
				df_ville_quartiers_gps.push(
					{"ville": (df_global[row].ville), "nomQuartier": (df_global[row].nomQuartier), "prix_bien": (df_global[row].prix_bien),"surface": (df_global[row].surface), "nb_pieces": (df_global[row].nb_pieces),"dpeL": (df_global[row].dpeL),
				"lat": (df_global[row].mapCoordonneesLatitude), "lng": (df_global[row].mapCoordonneesLongitude)

					}

				);
				
			};
			console.log('formation subset ville-quartier-gps OK')
		}
};

setTimeout(filtre_ref_ville_quartier_gps, 2000)


function filtre_ref_ville_quartier_gps_by_Vega(clic_quartier) {
		quartiers_a_projeter = [], list_markers = [], list_lat_lng = [];
		//filtrer le référentiel ville_quartiers_gps selon le clic_quartier vega
		quartiers_a_projeter = df_ville_quartiers_gps.filter(function(item) {
		    return clic_quartier.indexOf(item.nomQuartier) !== -1 && item.nb_pieces ==='1' && item.prix_bien !== 0;
		});

		//extraire les frontières de coordonnées de la projection
		for (i in quartiers_a_projeter) {
			list_lat_lng.push([quartiers_a_projeter[i].lat, quartiers_a_projeter[i].lng]);

			};

		//extraire les données des biens à projeter
		for (item in quartiers_a_projeter) {
			row = quartiers_a_projeter[item];
			x_y = [row["lat"], row["lng"]];
			nomQuartier = "Quartier: " + (row["nomQuartier"]);
			prix_bien = "Prix: " + (row["prix_bien"]).toString(10);
			nb_pieces = "Nb pièces: " + (row["nb_pieces"]).toString(10);
			surface = "surface: " + (row["surface"]).toString(10);

			//construire le message du tooltip
			msg = nomQuartier + "<br />" + prix_bien + "<br />" + nb_pieces + "<br />" + surface;

			//créer le marker et le stocker ds une liste
			mark = new L.Marker(x_y).bindTooltip(msg);
			list_markers.push(mark);

		};

}

//quartiers test, à remplacer par event Vega
//mettre un quartier par défaut:
if (clic_quartier.length === 0) {
	clic_quartier = ["Caudéran-Barrière Judaïque"];
};
/*clic_quartier = ["Caudéran-Barrière Judaïque","Hôtel de Ville-Quinconce-Saint Seurin-Fondaudège"]*/

setTimeout(filtre_ref_ville_quartier_gps_by_Vega, 2000, clic_quartier);
