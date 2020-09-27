

function cloneDeepLodash(n) {
	var t1 = new Date();
	for (var i = 0; i < n; i++) {
		cloneDeep = _.cloneDeep(params_choroplethe_map1.data[1].datasets[0])
	}
	var t2 = new Date();
	console.log("executé en: " + (t2-t1)/1000)
}


function cloneDeepRambda(n) {
	var t1 = new Date();
	for (var i = 0; i < n; i++) {
		cloneDeep = R.clone(params_choroplethe_map1.data[1].datasets[0])
	}
	var t2 = new Date();
	console.log("executé en: " + (t2-t1)/1000)
}


function copyArray(n) {
	var t1 = new Date();
	for (var i = 0; i < n; i++) {
		copyArray = {...params_choroplethe_map1.data[1].datasets[0]}
	}
	var t2 = new Date();
	console.log("executé en: " + (t2-t1)/1000)
}
	