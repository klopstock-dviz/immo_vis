var center = [polys[0].polygone.bbox[1], polys[0].polygone.bbox[0]]
var mapOptions = {
    center: center,
    zoom: 12
 }
var map = new L.map('brush1', mapOptions); // Creating a map object
var layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
map.addLayer(layer);      // Adding layer to the map

var polys_array = Object.values(polys)
var polys_colors = generateColors(polys_array.length, "interpolateRdYlGn", "randomize", "")

/*function onEachFeature(feature, layer) {
    // does this feature have a property named CODE_IRIS ?
    if (feature.properties && feature.properties.CODE_IRIS) {
        layer.bindPopup(feature.properties.CODE_IRIS);
    }
}*/


var i=0
polys_array.map(p=> {

	var myStyle = {
	    "color": polys_colors[i].replace("0.65", "0.95"),
	    "weight": 3,
	    "opacity": 0.95,
	    "fillOpacity": 0.8
	};


	L.geoJSON(p.polygone, 
			{style: myStyle},
			//{onEachFeature: onEachFeature}
			).addTo(map).bindTooltip(p.polygone.properties.CODE_IRIS);	
	i++
})


//map.fitBounds([[48.9018781939, 2.7744746624]])     