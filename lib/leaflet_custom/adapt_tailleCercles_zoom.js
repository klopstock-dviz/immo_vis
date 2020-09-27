
//parcourir table param zoom_tailleCercles
function adapt_tailleCercles(layerGroup, zoom) { //, size_field

	let e, param
	let zoom_tailleCercles =
	[
		 {"zoom": 18, "tailleCercle": 5},
		 {"zoom": 17, "tailleCercle": 10},
		 {"zoom": 16, "tailleCercle": 15},
		 {"zoom": 15, "tailleCercle": 20},
		 {"zoom": 14, "tailleCercle": 25},
		 {"zoom": 13, "tailleCercle": 40},
		 {"zoom": 12, "tailleCercle": 65},
		 {"zoom": 11, "tailleCercle": 90},
		 {"zoom": 10, "tailleCercle": 200},
		 {"zoom": 9, "tailleCercle": 400},	
		 {"zoom": 8, "tailleCercle": 1200},
		 {"zoom": 7, "tailleCercle": 2800},
		 {"zoom": 6, "tailleCercle": 4000},
		 {"zoom": 5, "tailleCercle": 6000}

	]




	for (e in zoom_tailleCercles) {
		param = zoom_tailleCercles[e];

		//si le zoom actuel = zoom param, adapter la taille du cercle
		if (zoom === param.zoom) {
			layerGroup.eachLayer(function (layer) {
			    if (layer instanceof L.Circle) {
			      layer.setRadius(param.tailleCercle * layer.options.size_coef);
			    }
			})
		}
	}
};
/*
mymap1.on('zoomend', function() {
	//get current zoom
    let zoom = mymap1.getZoom();
    adapt_tailleCercles();
});

*/
