
let param_colors =
{
	"rouge":{
	 "param0":{"teinte": "#990000", "interval": [0.9, 10]},
	 "param1":{"teinte": "#cc0000", "interval": [0.75, 0.9]},
	 "param2":{"teinte": "#ff0000", "interval": [0.6, 0.75]},
	 "param3":{"teinte": "#ff3333", "interval": [0.45, 0.6]},
	 "param4":{"teinte": "#ff6666", "interval": [0.3, 0.45]},
	 "param5":{"teinte": "#ff9999", "interval": [0.15, 0.3]},
	 "param6":{"teinte": "#ffcccc", "interval": [-10, 0.15]}
	 
	},

		
	"bleu":{
	 "param0":{"teinte": "#004c99", "interval": [0.9, 10]},
	 "param1":{"teinte": "#0066cc", "interval": [0.75, 0.9]},
	 "param2":{"teinte": "#007fff", "interval": [0.6, 0.75]},
	 "param3":{"teinte": "#3399ff", "interval": [0.45, 0.6]},
	 "param4":{"teinte": "#66b2ff", "interval": [0.3, 0.45]},
	 "param5":{"teinte": "#99ccff", "interval": [0.15, 0.3]},
	 "param6":{"teinte": "#cce5ff", "interval": [-10, 0.15]}	}

}

function inRange(x, interval) {
    return ((x-interval[0])*(x-interval[1]) <= 0);
}

function match_teinte(echelle, couleur) {
	for (param in param_colors[couleur]) {
		let param_test = param_colors[couleur][param];
		let interval_test = param_test.interval;

		let check = inRange(echelle, interval_test)
		if (check === true) {
			return (param_test.teinte);
		}
	}
}