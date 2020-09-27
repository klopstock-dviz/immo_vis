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