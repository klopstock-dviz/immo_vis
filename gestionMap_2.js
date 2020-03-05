	let mymap1 = "", layerGroup1 = [];
	
	setTimeout(() => {
		mymap1 = L.map('mapid-1').fitBounds([[51.072228, 2.528016], [42.442288, 3.159714]]);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(mymap1);


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


		//augmenter zoom d'un point
/*		zoomActuel = mymap1.getZoom() 
		mymap1.setZoom(zoomActuel-1) */
	},2000 )

