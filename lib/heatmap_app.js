var heatmapLayer, heatmap1;
function init_heatmap() {

        var testData = {
          max: 40,
          data: [
            {"lat":  43.59617, "lng":  3.877849, "count": 12}, 
            {"lat":   43.596164703, "lng":  3.87903595, "count": 13},
            {"lat":   43.598164703, "lng":  3.85903595, "count": 33}
          ]
        };

        var baseLayer = L.tileLayer(
          'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
            maxZoom: 18
          }
        );

        var cfg = {
          // radius should be small ONLY if scaleRadius is true (or small radius is intended)
          "radius": 20,
          "maxOpacity": .5, 
          // scales the radius based on map zoom
          "scaleRadius": false, 
          // if set to false the heatmap uses the global maximum for colorization
          // if activated: uses the data maximum within the current map boundaries 
          //   (there will always be a red spot with useLocalExtremas true)
          "useLocalExtrema": true,
          // which field name in your data represents the latitude - default "lat"
          latField: 'lat',
          // which field name in your data represents the longitude - default "lng"
          lngField: 'lng',
          // which field name in your data represents the data value - default "value"
          valueField: 'count'
        };


        heatmapLayer = new HeatmapOverlay(cfg);

          heatmap1 = new L.Map('heatmap', {
          center: new L.LatLng(43.594669342, 3.884418964),
          zoom: 8,
          layers: [baseLayer, heatmapLayer]
        });

        heatmapLayer.setData(testData);

        // make accessible for debugging
        layer = heatmapLayer;

        var div_heatmap = document.getElementById("heatmap");
        div_heatmap.style.display = 'none'
      };

function changeHeatmap() {
  var data_annonces = []
  //extraire les frontières de coordonnées de la projection et prix_m² de la liste principale
  //cas périmètre ville
  if (clic_ville.length > 0 && clic_quartier.length === 0) {
      for (i in villes_a_projeter) {
        data_annonces.push({"lat": villes_a_projeter[i].lat, "lng": villes_a_projeter[i].lng, "count": villes_a_projeter[i]["prix_m²"]});

        }
  }
  else if (clic_ville.length > 0 && clic_quartier.length > 0) {
    for (i in quartiers_a_projeter) {
      data_annonces.push({"lat": quartiers_a_projeter[i].lat, "lng": quartiers_a_projeter[i].lng, "count": quartiers_a_projeter[i]["prix_m²"]});

      };
}

  var testData = {
    max: 100,
    data: data_annonces
  }

/*    heatmap1 = new L.Map('heatmap', {
    center: new L.LatLng(data_annonces[0].lat, data_annonces[0].lng),
    zoom: 10,
    layers: [baseLayer, heatmapLayer]
  });
*/
  heatmapLayer.setData(testData);

  /*heatmap1.flyToBounds(list_lat_lng);*/

}