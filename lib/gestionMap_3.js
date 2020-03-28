let mymap1 = "", layerGroup1 = [];



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
//---------------------------


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



function init_map() {

		mymap1.fitBounds([[51.072228, 2.528016], [42.442288, 3.159714]]);


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

		}

}


/*import * as adapt_tailleCercles_zoom from 'adapt_tailleCercles_zoom.js';*/