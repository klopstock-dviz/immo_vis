let mymap1 = "", layerGroup1 = [];


//1.initialiser la map
function setMap() {

	mymap1 = L.map('mapid-1').fitBounds([[51.072228, 2.528016], [42.442288, 3.159714]]);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(mymap1);

	//------------init layerGroup
	//cercle fictif
	cercle = new L.circle([51.520, -0.11], 2, {
		color: "blue",
		weight: 1,
		fillColor: "blue",
		fillOpacity: 1
	});
	/*list_markers.push(cercle);*/

	layerGroup1 = L.layerGroup(cercle);
	layerGroup1.addTo(mymap1);
};







//2.configurer la map
function configMap() {


	function setBounds() {
		mymap1.flyToBounds(list_lat_lng);
		
	};


	function addMarkers() {
		layerGroup1 = L.layerGroup(list_markers);
		layerGroup1.addTo(mymap1);
	};

	if (list_markers.length > 0) {
		addMarkers();
		setBounds();
		init_vlSpec_legend_map_1();
		init_vlSpec_tick_prix_m2();

	}


	setTimeout(() => {
		mymap1.on("zoomend", function (e) { 
		//get current zoom
		zoom = mymap1.getZoom();
	    adapt_tailleCercles(); 
		}
	 )
	}, 1000);
}



//1:
setMap();
//2:
setTimeout(configMap, 1000);





//3.extraire les données à projeter et former les cercles à épingler sur la map
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



//4.centrer la map sur les coordonées
mymap1.flyToBounds(list_lat_lng); heatmap1.flyToBounds(list_lat_lng);



//5.projeter les annonces map
gestionLayer('ville');








	var gestionLayer = function(trigger_source) {

			
			/*//récup nvlle liste quartiers
			filtre_ref_ville_quartier_gps_by_Vega();//clic_quartier, clic_nb_pieces, brush_date
*/          let trigger_array = [], trigger_echelle = "", trigger_composant = "";
            if (trigger_source !== "") {
       		trigger_array = trigger_source.split("-");
                  trigger_echelle = trigger_array[0];
                  trigger_composant = trigger_array[1]
            }
            else {
                  trigger_echelle = "inconnu";
                  trigger_composant = "inconnu";
            };

            //si la projection a été déclenchée pour une/des villes, ne pas refaire de fitBounds
 		if (trigger_echelle === 'quartier') {
 			//si un clic ville ou quartier a bien été enregistré, projeter les annonces
                  if (clic_quartier.length > 0 || clic_ville.length > 0) {
                  	/*alert("ajout layer");*/
      								
      				            	
                  	//layerGroup1.removeLayer();
                  	layerGroup1.clearLayers();
                  	layerGroup1 = []
                  	layerGroup1 = L.layerGroup(list_markers);
                  	layerGroup1.addTo(mymap1);

                  	mymap1.flyToBounds(list_lat_lng);
                        if (trigger_composant !== "tick_prix_m2") {
                  	     init_vlSpec_legend_map_1();
                        }
       		}
 		}

 		//si la projection a été déclenchée pour un/des quartiers, refaire un fitBounds
 		else if (trigger_echelle === 'ville') {
 			//si un clic ville ou quartier a bien été enregistré, projeter les annonces
                  if (clic_quartier.length > 0 || clic_ville.length > 0) {
                  	/*alert("ajout layer");*/
      								
      				            	
                  	//layerGroup1.removeLayer();
                  	layerGroup1.clearLayers();
                  	layerGroup1 = []
                  	layerGroup1 = L.layerGroup(list_markers);
                  	layerGroup1.addTo(mymap1);

                        adapt_tailleCercles();
                  	
                        if (trigger_composant !== "tick_prix_m2") {
                             init_vlSpec_legend_map_1();
                        }
       			}
            

            }
}        
