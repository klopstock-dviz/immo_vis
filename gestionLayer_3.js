	var gestionLayer = function() {

			
			//récup nvlle liste quartiers
			filtre_ref_ville_quartier_gps_by_Vega(clic_quartier);

            if (clic_quartier.length > 0) {
            	/*alert("ajout layer");*/
								
				            	
            	//layerGroup1.removeLayer();
            	layerGroup1.clearLayers();
            	layerGroup1 = []
            	layerGroup1 = L.layerGroup(list_markers);
            	layerGroup1.addTo(mymap1);

            	mymap1.flyToBounds(list_lat_lng)

/*            	setTimeout( () => {
					zoomActuel = mymap1.getZoom() 
					mymap1.setZoom(zoomActuel-1)},
					5000 
				)*/
            }
            else if (sValue === 'f') {
            	alert("suppr layer");
            	try {
					  layerGroup1.clearLayers();;
				}
				catch(error) {
					  console.error(error);
					  // expected output: ReferenceError: nonExistentFunction is not defined
					  // Note - error messages will vary depending on browser
				}
            }
        };