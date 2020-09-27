//1.generate colors from d3 color schemes, pick a random scheme from the list below according to the lenght of dataset:
//if dataset <=12, pick a random scheme from below
var colorSchemesCategorical = [{length: 10, id: "schemeCategory10"}, {length: 10, id: "schemeTableau10"}, {length: 12, id: "schemePaired"},
{length: 9, id: "schemeSet1"}, {length: 8, id: "schemeDark2"}]
var colorSchemesCategorical_array = colorSchemesCategorical.map(o=> o.id)


//if dataset >12, pick a random scheme from colorSchemesSequentialMulti:
var colorSchemesSequentialMulti = ["interpolateTurbo", "interpolateInferno", "interpolatePlasma", "interpolateCividis", "interpolateWarm", "interpolateCool",
"interpolateRainbow", "interpolateSinebow", "interpolateViridis", "interpolateMagma", "interpolateCividis", "interpolateCubehelixDefault"]
var colorSchemesGradient = ["interpolateBuGn", "interpolateBuPu", "interpolateGnBu", "interpolateOrRd", "interpolatePuBuGn", "interpolatePuBu", "interpolatePuRd",
'interpolateRdPu', "interpolateYlGnBu", "interpolateYlGn", "interpolateYlOrBr", "interpolateYlOrRd"]


var colorSchemesSequentialSingle = ["interpolateBlues", "interpolateGreens", "interpolateGreys", "interpolateOranges", "interpolatePurples", "interpolateReds"]
var colorSchemesDiverging = ["interpolateRdYlGn"]


//randomize arrays
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }; return array
}

function generateColors(data_length, scheme, colorsOrder, colored_axis) {
	//set the scheme
	//get the schemes that covers the entire dataset length
	//range for interpolated colors
    const colorRangeInfo = {
      colorStart: 0,
      colorEnd: 1,
      useEndAsStart: false,
    };

	//if the user provided an explicit color scheme, check if exists and if it fits the dataset length	
	if (scheme !== "" && scheme !== undefined) {
		//1.check in the categorical schemes
		var pos_in_CategoricalScheme = colorSchemesCategorical.findIndex(o=> o.id === scheme)
		var pos_in_SchemesSequentialMulti = colorSchemesSequentialMulti.findIndex(o=> o === scheme)
		var pos_in_SchemesSequentialSingle = colorSchemesSequentialSingle.findIndex(o=> o === scheme)
		var pos_in_SchemesDiverging = colorSchemesDiverging.findIndex(o=> o === scheme)
		var pos_in_SchemesGradient = colorSchemesGradient.findIndex(o=> o === scheme)

		//if found in the categorical schemes, check if the data points are entirely covered by the scheme
		if (pos_in_CategoricalScheme > -1) {
			var correspondingColorSchemes = colorSchemesCategorical.filter(o=> o.length >= data_length).map(d=> d.id);

			
			if (correspondingColorSchemes.length > 0) {
				//generate the corresponding colors
				var d3Colors = d3[scheme]
				sharedParams.used_color_schemes[colored_axis] = scheme
				var d3Colors_rgb = d3Colors.map(o=> d3.rgb(o))
				d3Colors_rgb.map(a=> a.opacity = 0.65)
				var d3Colors_rgb_formated = d3Colors_rgb.map(o=> o.formatRgb())

				d3Colors_rgb_formated = manageColorsOrder(d3Colors_rgb_formated, colorsOrder)
				return d3Colors_rgb_formated
			}
			//else, pick up a random scheme from the colorSchemesSequentialMulti
			else {
				var randomScheme = _.sample(colorSchemesSequentialMulti);
				var used_color_schemes = Object.values(sharedParams.used_color_schemes)
				while (used_color_schemes.indexOf(randomScheme) > -1) {
					randomScheme = _.sample(colorSchemesSequentialMulti);
				}

				sharedParams.used_color_schemes[colored_axis] = randomScheme
				var colorScale = d3[randomScheme]
				var d3Colors =  interpolateColors(data_length, colorScale, colorRangeInfo);
				var d3Colors_rgb_formated = d3Colors.map(o=> o.replace(")", ", 0.65)")).map(d=> d.replace('rgb', 'rgba'));
				
				d3Colors_rgb_formated = manageColorsOrder(d3Colors_rgb_formated, colorsOrder)
				return d3Colors_rgb_formated
			}
		
		}
		//if user's scheme found in sequential colors
		else if (pos_in_SchemesSequentialMulti > -1 || pos_in_SchemesSequentialSingle > -1 || pos_in_SchemesDiverging > -1 || pos_in_SchemesGradient > -1) {
			var colorScale = d3[scheme];
			sharedParams.used_color_schemes[colored_axis] = scheme
			var d3Colors =  interpolateColors(data_length, colorScale, colorRangeInfo);
			var d3Colors_rgb_formated = d3Colors.map(o=> o.replace(")", ", 0.65)")).map(d=> d.replace('rgb', 'rgba'));
			d3Colors_rgb_formated = manageColorsOrder(d3Colors_rgb_formated, colorsOrder)
			return d3Colors_rgb_formated
		}
	}
	//if not found, pick a randoM scheme	
	else {
		var correspondingColorSchemes = colorSchemesCategorical.filter(o=> o.length >= data_length).map(d=> d.id);
		//1.try from categorical schemes
		if (correspondingColorSchemes.length > 0) {
			//pick un a color scheme and avoid duplicate schemes
			var randomScheme = _.sample(correspondingColorSchemes);
			var length_colorSchemesCategorical = correspondingColorSchemes.length; var a=0
			var used_color_schemes = Object.values(sharedParams.used_color_schemes)
			while (used_color_schemes.indexOf(randomScheme) > -1) {
				if (a <= length_colorSchemesCategorical) {
					randomScheme = _.sample(correspondingColorSchemes);
					a++
				}
				else {
					randomScheme = _.sample(colorSchemesSequentialMulti);
				}
			}



			sharedParams.used_color_schemes[colored_axis] = randomScheme
			if (colorSchemesCategorical_array.indexOf(randomScheme) > -1) {
				var d3Colors = d3[randomScheme]
				var d3Colors_rgb = d3Colors.map(o=> d3.rgb(o))
				d3Colors_rgb.map(a=> a.opacity = 0.65);
				var d3Colors_rgb_formated = d3Colors_rgb.map(o=> o.formatRgb())
			}
			else {
				var colorScale = d3[randomScheme]
				var d3Colors =  interpolateColors(data_length, colorScale, colorRangeInfo);
				var d3Colors_rgb_formated = d3Colors.map(o=> o.replace(")", ", 0.65)")).map(d=> d.replace('rgb', 'rgba'));				
			}
			d3Colors_rgb_formated = manageColorsOrder(d3Colors_rgb_formated, colorsOrder)
			return d3Colors_rgb_formated
		}
		//if the dataset is too long, pick a color from the sequential multi scheme
		else {
			var randomScheme = _.sample(colorSchemesSequentialMulti);
			sharedParams.used_color_schemes[colored_axis] = randomScheme
			var colorScale = d3[randomScheme]
			var d3Colors =  interpolateColors(data_length, colorScale, colorRangeInfo);
			var d3Colors_rgb_formated = d3Colors.map(o=> o.replace(")", ", 0.65)")).map(d=> d.replace('rgb', 'rgba'));
			

			if (colorsOrder === undefined || colorsOrder === "") { var colorsOrder = 'randomize' }
			d3Colors_rgb_formated = manageColorsOrder(d3Colors_rgb_formated, colorsOrder)
			return d3Colors_rgb_formated
		}
	}


	function manageColorsOrder(d3Colors_rgb_formated, colorsOrder) {		

		if (colorsOrder === undefined || colorsOrder === "") {
			return d3Colors_rgb_formated
		}
		else if (colorsOrder === "reverse") {
			d3Colors_rgb_formated = d3Colors_rgb_formated.reverse()
			return d3Colors_rgb_formated
		}
		else if (colorsOrder === "randomize") {
			d3Colors_rgb_formated = shuffleArray(d3Colors_rgb_formated)
			return d3Colors_rgb_formated
		}
	}

}