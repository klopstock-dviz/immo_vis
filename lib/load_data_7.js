//data annonces
let df_global = [], list_lat_lng = [], list_lat_lng_filtred = [], couple = [], villes_a_projeter = [], quartiers_a_projeter = [], clic_quartier = [], clic_nb_pieces = [], df_global_filtre = [];
let df_ville_quartiers_gps = [], df_global_filtre_ville = [] ,clic_ville = [], brush_date = [], brush_prix_m2 = [], list_prix_m2 = [], brush_quartiers_nbPieces=[], clic_dpe = [];
let brush_quartiers_prixM2 = [], brush_quartiers_surface = [], clic_nb_pieces_quartier = [], clic_dpe_quartier = [],colorScheme = "";
let list_markers;

async function fetchData_annonces() {
	let data1 = await d3.json("https://raw.githubusercontent.com/klopstock-dviz/immo_vis/master/immo_group.json");
	
	//df_global_1 = await data0
	
	for (row in data1) {
		df_global.push(data1[row]);
	};

	filtre_dataAnnonces_init()
}


function filtre_dataAnnonces_init() {

	df_global_filtre = df_global.filter(function(item) {
	    return item["typedetransaction"] === "Location";
	});

};


fetchData_annonces();


//func appelée à partir du html selon selection type d'annonce
function filtre_dataAnnonces_optionList() {

    optionList_type_annonce = document.getElementById('type_annonce');
    type_annonce = optionList_type_annonce.value

	df_global_filtre = df_global.filter(function(item) {
	    return item["typedetransaction"] === type_annonce;
	});

};

//data ref géographique

async function fetchData2() {
	let data1 = await d3.json("https://raw.githubusercontent.com/klopstock-dviz/immo_vis/master/ref_geographique_etendu.json");
	
	//df_global_1 = await data0
	
	for (row in data1) {
		df_ville_quartiers_gps.push(data1[row]);
	};

	df_ville_quartiers_gps.forEach(function(d) {
	      d.prix_bien = +d.prix_bien;
	      d.surface = +d.surface;
	      d["lat"] = +d["lat"];
	      d["lng"] = +d["lng"];  
		  		
			
			d["mois"] = +d.mois;
			d["annee"] = +d.annee;
			d["prix_m²"] = +d["prix_m²"];

	    });	

	//filtrer le df pour ne récupérer que les annonces avec géoloc
	df_ville_quartiers_gps = df_ville_quartiers_gps.filter(function(item) {
	    return item.lat !== 0 && item.lng !== 0;
	});

}

fetchData2();

//func désactivé:
function filtre_ref_ville_quartier_gps() {

		
		df_global_1 = df_global.filter(function(item) {
		    return item["typedetransaction"] === 8 && item["prix_m²"] < 25000;
		});


		//former un subset ville-quartier-gps

		for (row in df_global_1) {
			lng = df_global[row].mapCoordonneesLongitude
			if (lng !== 0 || lng !== 0.0) {
				df_ville_quartiers_gps.push(
					{"ville": (df_global[row].ville), "nomQuartier": (df_global[row].nomQuartier), "nomQuartier": (df_global[row].nomQuartier), "typedetransaction": (df_global[row].typedetransaction),
					"prix_bien": (df_global[row].prix_bien), "prix_m²": (df_global[row]["prix_m²"]),	"surface": (df_global[row].surface), "nb_pieces": (df_global[row].nb_pieces), 					
					"date": (df_global[row].date), "mois": (df_global[row].mois), "annee": (df_global[row].annee),
					"dpeL": (df_global[row].dpeL),"lat": (df_global[row].mapCoordonneesLatitude), "lng": (df_global[row].mapCoordonneesLongitude)

					}

				);
				
			};
			console.log('formation subset ville-quartier-gps OK')
		}
};

/*setTimeout(filtre_ref_ville_quartier_gps, 2000)*/

function filtre_dataAnnonces_par_ville() {
		df_global_filtre_ville = [];
		
		//tester si clic nb pieces fait pour eviter liste à 0
		if (clic_nb_pieces.length === 0) {
			clic_nb_pieces = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
		};
		//tester si clic dpe fait pour eviter liste à 0
		if (clic_dpe.length === 0) {
			clic_dpe = ["A", "B", "C", "D", "E", "F", "G", "0"]
		};
		//tester si interval dates appliqué pour eviter liste à 0
		if (brush_date.length === 0) {
			brush_date = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
		};


		//-> old version de filtrer le df dataAnnonces selon le clic_ville vega
/*		df_global_filtre_ville = df_global_filtre.filter(function(item) {
		    return clic_ville.indexOf(item.ville) !== -1 && clic_nb_pieces.indexOf(item.nb_pieces) !== -1 && brush_date.indexOf(item.mois) !== -1 && clic_dpe.indexOf(item.dpeL) !== -1
		});*/

		//filtrer le df dataAnnonces selon le clic_ville vega
		df_global_filtre_ville = df_ville_quartiers_gps.filter((item)=> clic_ville.indexOf(item.ville) !== -1 && clic_nb_pieces.indexOf(item.nb_pieces) !== -1 && brush_date.indexOf(item.mois) !== -1 && clic_dpe.indexOf(item.dpeL) !== -1 
																		&& item.typedetransaction === type_annonce)

		//regrouper le résultat selon quartier, sum nb annonces et moyenne prix m²
/*		df_global_filtre_ville = _(df_global_filtre_ville)
		  .groupBy('nomQuartier')
		  .map((agregat, nomQuartier) => ({
		    nomQuartier: nomQuartier,
		    nb_annonces: _.sumBy(agregat, 'nb_annonces'),
		    prix_m2_median: +(_.meanBy(agregat, 'prix_m2_median')).toFixed(2)
		  }))
		  .value()*/

};



//filtre annonces géolocalisées sur un périmètre ville
function filtre_ref_ville_gps_by_Vega(triggerType) {
		villes_a_projeter = [], list_markers = [], list_lat_lng = [], list_prix_m2 = [];
		let min_prix_m2, max_prix_m2, coef_colorTeinte, tooltip_teinte, color; 

		//tester si clic dpe fait pour eviter liste à 0
		if (clic_dpe.length === 0) {
			clic_dpe = ["A", "B", "C", "D", "E", "F", "G", "0"]
		};
		//tester si clic nb pieces fait pour eviter liste à 0
		if (clic_nb_pieces.length === 0) {
			clic_nb_pieces = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
		};

		//tester si interval dates appliqué pour eviter liste à 0
		//console.log(brush_date)
		if (brush_date.length === 0) {
			brush_date = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
		};


		//tester si interval prix_m2 ET surface du scaterplot quartiers est appliqué pour eviter liste à 0
		if (brush_quartiers_surface.length === 0) {
			brush_quartiers_surface = [0, 100000];
			brush_quartiers_prixM2 = [0, 100000];
		};		
		//tester si interval prix_m2 du tick map est appliqué
		if (brush_prix_m2.length === 0) {
			brush_prix_m2 = [0, 100000];
		};

		//tester si clic dpe fait pour eviter liste à 0
		if (clic_dpe_quartier.length === 0) {
			clic_dpe_quartier = ["A", "B", "C", "D", "E", "F", "G", "0"]
		};
		//tester si clic nb pieces fait pour eviter liste à 0
		if (clic_nb_pieces_quartier.length === 0) {
			clic_nb_pieces_quartier = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
		};



		//filtrer le référentiel ville_quartiers_gps selon le sélections vega, à l'exclusion du tick_prix_m2
		villes_a_projeter = df_ville_quartiers_gps.filter(function(item) {
		    return clic_ville.indexOf(item.ville) !== -1 && clic_nb_pieces.indexOf(item.nb_pieces) !== -1  && item.typedetransaction === type_annonce
		    		 && brush_date.indexOf(item.mois) !== -1 && clic_dpe.indexOf(item.dpeL) !== -1
		    		 && (item["prix_m²"] >= brush_quartiers_prixM2[0] && item["prix_m²"] <= brush_quartiers_prixM2[1])

		    		 && (item["surface"] >= brush_quartiers_surface[0] && item["surface"] <= brush_quartiers_surface[1])
		    		 && clic_nb_pieces_quartier.indexOf(item.nb_pieces) !== -1  && clic_dpe_quartier.indexOf(item.dpeL) !== -1;

		});
		//filtrer le référentiel ville_quartiers_gps selon le sélections vega, en incluant le tick_prix_m2
		villes_a_projeter_l2 = df_ville_quartiers_gps.filter(function(item) {
		    return clic_ville.indexOf(item.ville) !== -1 && clic_nb_pieces.indexOf(item.nb_pieces) !== -1  && item.typedetransaction === type_annonce
		    		 && brush_date.indexOf(item.mois) !== -1 && clic_dpe.indexOf(item.dpeL) !== -1
		    		 && (item["prix_m²"] >= brush_quartiers_prixM2[0] && item["prix_m²"] <= brush_quartiers_prixM2[1])
		    		 && (item["prix_m²"] >= brush_prix_m2[0] && item["prix_m²"] <= brush_prix_m2[1])
		    		 && (item["surface"] >= brush_quartiers_surface[0] && item["surface"] <= brush_quartiers_surface[1])
		    		 && clic_nb_pieces_quartier.indexOf(item.nb_pieces) !== -1  && clic_dpe_quartier.indexOf(item.dpeL) !== -1;

		});


		//extraire les frontières de coordonnées de la projection et prix_m² de la liste principale
		let list_prix_m2_initiale = [];
		for (i in villes_a_projeter) {
			list_lat_lng.push([villes_a_projeter[i].lat, villes_a_projeter[i].lng]);

			//alimenter liste prix_m²
			list_prix_m2_initiale.push(villes_a_projeter[i]["prix_m²"])

			};



		//si la liste secondaire (issu du filtre des prix m2 de la map) exite, extraire les frontières de coordonnées de la projection
		let list_prix_m2_brush = [];
		if (villes_a_projeter_l2.length > 0 && villes_a_projeter_l2.length < villes_a_projeter.length) {
			for (i in villes_a_projeter_l2) {
				/*list_lat_lng.push([quartiers_a_projeter[i].lat, quartiers_a_projeter[i].lng]);*/

				//alimenter liste prix_m²
				list_prix_m2_brush.push(villes_a_projeter_l2[i]["prix_m²"])

				}
			//utiliser comme liste de biens à prjeter la liste secondaire
			villes_a_projeter = villes_a_projeter_l2
		};


		//calcul étendue, min et max des prix_m², pour alimenter la légende de la map
		list_prix_m2 = list_prix_m2_initiale;
		min_prix_m2 = Percentile_5(list_prix_m2); max_prix_m2 = Percentile_95(list_prix_m2); median_prix_m2 = Median(list_prix_m2);


		//si changement de ville, exclure les coordonnées au dela des 10 et 90eme centiles
		if (triggerType === "reloadVille") {
			exclusion_coordonnees_extremes()
		}



		//extraire les données des biens à projeter
		for (item in villes_a_projeter) {
			row = villes_a_projeter[item];
			x_y = [row["lat"], row["lng"]];
			nomQuartier = "Quartier: " + (row["nomQuartier"]);
			prix_bien = "Prix: " + (row["prix_bien"]).toString(10);
			prix_m2 = "Prix au m²: " + (row["prix_m²"]).toString(10);
			nb_pieces = "Nb de pièces: " + (row["nb_pieces"]).toString(10);
			surface = "Surface: " + (row["surface"]).toString(10);
			dpeL = "DPE: " + (row["dpeL"]);

			//calcul opacité
			coef_colorTeinte = (row["prix_m²"] - min_prix_m2) / (max_prix_m2 - min_prix_m2);
			tooltip_teinte = "Opacité: " + coef_colorTeinte.toString(10);

			//construire le message du tooltip
			msg = nomQuartier + "<br />" + prix_bien + "<br />" + prix_m2 + "<br />" + nb_pieces + "<br />" + surface + "<br />" + dpeL;


			let couleurCercles = "bleu"
			
			//déterminer la couleur de la légende
			try {
				if (div_map.style.display === 'block') {
					colorScheme = "blues";
				}
				else if (div_heatmap.style.display === "block") {
					colorScheme = "redyellowgreen";
				}
				else {
					colorScheme = "blues"
				}

			} 
			catch(err) {
				console.log("init légende map indéterminé. légende " + couleurCercles + "par défaut");
				console.log(err);
				colorScheme = "";
			}
			

/*			if (couleurCercles === "bleu") {colorScheme = "blues"}
			else if (couleurCercles === "rouge") {colorScheme = "reds"}
			else {colorScheme = "redyellowgreen"}
*/			
			//déduire couleur HEX à appliquer selon le coef
			color = match_teinte(coef_colorTeinte, couleurCercles);//rouge ou bleu	

			
			//créer le cercle et le stocker ds une liste
			cercle = new L.circle(x_y, 25, {
				/*color: "blue",*/
				weight: 0.5,
				fillColor: color,
				fillOpacity: 1
			}).bindTooltip(msg);
			list_markers.push(cercle);

		};

		

}




function filtre_ref_ville_quartier_gps_by_Vega(triggerType) {
		quartiers_a_projeter = [], list_markers = [], list_lat_lng = [], list_prix_m2 = [];
		let min_prix_m2, max_prix_m2, coef_colorTeinte, tooltip_teinte, color; 

		//tester si clic dpe fait pour eviter liste à 0
		if (clic_dpe.length === 0) {
			clic_dpe = ["A", "B", "C", "D", "E", "F", "G", "0"]
		};		
		//tester si clic nb pieces fait pour eviter liste à 0
		if (clic_nb_pieces.length === 0) {
			clic_nb_pieces = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
		};

		//tester si interval dates appliqué pour eviter liste à 0
		//console.log(brush_date)
		if (brush_date.length === 0) {
			brush_date = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
		};
		//tester si interval prix_m2 du tick map est appliqué
		if (brush_prix_m2.length === 0) {
			brush_prix_m2 = [0, 100000];
		};

		//tester si interval prix_m2 ET surface du scaterplot quartiers est appliqué pour eviter liste à 0
		if (brush_quartiers_surface.length === 0) {
			brush_quartiers_surface = [0, 100000];
			brush_quartiers_prixM2 = [0, 100000];
		};
		//tester si clic dpe fait pour eviter liste à 0
		if (clic_dpe_quartier.length === 0) {
			clic_dpe_quartier = ["A", "B", "C", "D", "E", "F", "G", "0"]
		};
		//tester si clic nb pieces fait pour eviter liste à 0
		if (clic_nb_pieces_quartier.length === 0) {
			clic_nb_pieces_quartier = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
		};


		//filtrer le référentiel ville_quartiers_gps selon le clic_quartier vega
		//liste principale
		quartiers_a_projeter = df_ville_quartiers_gps.filter(function(item) {
		    return clic_ville.indexOf(item.ville) !== -1 && clic_quartier.indexOf(item.nomQuartier) !== -1 && clic_nb_pieces.indexOf(item.nb_pieces) !== -1  && item.typedetransaction === type_annonce
		    		 && brush_date.indexOf(item.mois) !== -1 && clic_dpe.indexOf(item.dpeL) !== -1
		    		 
		    		 && (item["prix_m²"] >= brush_quartiers_prixM2[0] && item["prix_m²"] <= brush_quartiers_prixM2[1])
		    		 && (item["surface"] >= brush_quartiers_surface[0] && item["surface"] <= brush_quartiers_surface[1]) && clic_nb_pieces_quartier.indexOf(item.nb_pieces) !== -1  &&
		    		 clic_dpe_quartier.indexOf(item.dpeL) !== -1;
		});

		//liste secondaire (générée par le filtre des prix au m2 au niveau map)
		quartiers_a_projeter_l2 = df_ville_quartiers_gps.filter(function(item) {
		    return clic_quartier.indexOf(item.nomQuartier) !== -1 && clic_nb_pieces.indexOf(item.nb_pieces) !== -1  && item.typedetransaction === type_annonce
		    		 && brush_date.indexOf(item.mois) !== -1 && clic_dpe.indexOf(item.dpeL) !== -1
		    		 && (item["prix_m²"] >= brush_prix_m2[0] && item["prix_m²"] <= brush_prix_m2[1])
		    		 && (item["prix_m²"] >= brush_quartiers_prixM2[0] && item["prix_m²"] <= brush_quartiers_prixM2[1])
		    		 && (item["surface"] >= brush_quartiers_surface[0] && item["surface"] <= brush_quartiers_surface[1])
		    		 && clic_nb_pieces_quartier.indexOf(item.nb_pieces) !== -1  && clic_dpe_quartier.indexOf(item.dpeL) !== -1;
		});


		//extraire les frontières de coordonnées de la projection et prix_m² de la liste principale
		let list_prix_m2_initiale = [];
		for (i in quartiers_a_projeter) {
			list_lat_lng.push([quartiers_a_projeter[i].lat, quartiers_a_projeter[i].lng]);

			//alimenter liste prix_m²
			list_prix_m2_initiale.push(quartiers_a_projeter[i]["prix_m²"])

			};

		//si la liste secondaire (issu du filtre des prix m2 de la map) exite, extraire les frontières de coordonnées de la projection
		let list_prix_m2_brush = [];
		if (quartiers_a_projeter_l2.length < quartiers_a_projeter.length) {
			for (i in quartiers_a_projeter_l2) {
				list_lat_lng.push([quartiers_a_projeter[i].lat, quartiers_a_projeter[i].lng]);

				//alimenter liste prix_m²
				list_prix_m2_brush.push(quartiers_a_projeter[i]["prix_m²"])

				}
			//utiliser comme liste de biens à prjeter la liste secondaire
			quartiers_a_projeter = quartiers_a_projeter_l2
		};


		//calcul étendue, min et max des prix_m², pour alimenter la légende de la map
		list_prix_m2 = list_prix_m2_initiale;
		min_prix_m2 = Percentile_5(list_prix_m2); max_prix_m2 = Percentile_95(list_prix_m2); median_prix_m2 = Median(list_prix_m2);

		//extraire les données des biens à projeter
		for (item in quartiers_a_projeter) {
			row = quartiers_a_projeter[item];
			x_y = [row["lat"], row["lng"]];
			nomQuartier = "Quartier: " + (row["nomQuartier"]);
			prix_bien = "Prix: " + (row["prix_bien"]).toString(10);
			prix_m2 = "Prix au m²: " + (row["prix_m²"]).toString(10);
			nb_pieces = "Nb de pièces: " + (row["nb_pieces"]).toString(10);
			surface = "Surface: " + (row["surface"]).toString(10);
			dpeL = "DPE: " + (row["dpeL"]);

			//calcul opacité excluant les signaux venant du graph tick_prix_m2
/*			if (triggerType === "tick_prix_m2") {*/
				coef_colorTeinte = (row["prix_m²"] - min_prix_m2) / (max_prix_m2 - min_prix_m2);
				tooltip_teinte = "Opacité: " + coef_colorTeinte.toString(10);
			/*};*/

			//construire le message du tooltip
			msg = nomQuartier + "<br />" + prix_bien + "<br />" + prix_m2 + "<br />" + nb_pieces + "<br />" + surface + "<br />" + dpeL;

			let couleur = "bleu"
			if (couleur === "bleu") {colorScheme = "blues"}
			else if (couleur === "rouge") {colorScheme = "reds"}

			//déduire couleur HEX à appliquer selon le coef
			color = match_teinte(coef_colorTeinte, couleur);//rouge ou bleu	

			
			//créer le cercle et le stocker ds une liste
			cercle = new L.circle(x_y, 25, {
				/*color: "blue",*/
				weight: 0.5,
				fillColor: color,
				fillOpacity: 1
			}).bindTooltip(msg);
			list_markers.push(cercle);

		};

		

}

//ville à projeter pour init map, sera remplacé par clic ville Vega
//mettre une ville par défaut:
if (clic_ville.length === 0) {
	clic_ville = ["bordeaux"];
};
/*clic_quartier = ["Caudéran-Barrière Judaïque","Hôtel de Ville-Quinconce-Saint Seurin-Fondaudège"]*/

setTimeout(filtre_ref_ville_gps_by_Vega, 2500); //, clic_quartier, clic_nb_pieces
