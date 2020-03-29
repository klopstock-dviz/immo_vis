let zoom;
let zoom_tailleCercles =
[
	 {"zoom": 18, "tailleCercle": 5},
	 {"zoom": 17, "tailleCercle": 10},
	 {"zoom": 16, "tailleCercle": 15},
	 {"zoom": 15, "tailleCercle": 25},
	 {"zoom": 14, "tailleCercle": 30},
	 {"zoom": 13, "tailleCercle": 50},
	 {"zoom": 12, "tailleCercle": 70},

]




//parcourir table param zoom_tailleCercles
function adapt_tailleCercles() {
	for (e in zoom_tailleCercles) {
		param = zoom_tailleCercles[e];

		//si le zoom actuel = zoom param, adapter la taille du cercle
		if (zoom === param.zoom) {
			layerGroup1.eachLayer(function (layer) {
			    if (layer instanceof L.Circle) {
			      layer.setRadius(param.tailleCercle);
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
