class Label {

	createLabel(params_label) {
		params_label.transformations.crossfilter = {"INSEE_COM": ["33063"], nb_pieces: [2]}//, "33281"
		params_label.value = this.prepare_data_p1(params_label)

		this.init_label(params_label)

		params_label.chart_type = "label"
		
		params_label.instanciator = this

		sharedParams.params_charts.push(params_label)

		this.displayText(params_label)
	}

	prepare_data(params_label, data_to_transform) {
	    var d1 = new Date();

	    //zone de filtrage
	    //filter the primary data source according to the scope of the vizualisation (limited geographic area, range of time, any specific observation)

	    //data source for the bar chart
	    /*if (params_label.transformations.dataset === undefined) {
	    	var data_chart = [...sharedParams.data_main]
	    	
	    }
	    else {
	    	var data_chart = [...params_label.transformations.dataset]	    	
	    }*/




		var filter_object = {};
		//if the crossfilter is provided, extract & transform values of the filter_array (provided by the crossfilter process)
		if (params_label.transformations.crossfilter !== undefined && Object.keys(params_label.transformations.crossfilter).length > 0 ) {
			//1.delete all useless fields, non provided in data_params.field_source
			Object.keys(params_label.transformations.crossfilter).forEach(key=> {
				if (key !== params_label.data_params.join_field_source) {
					delete params_label.transformations.crossfilter[key]
				}
			})
			//2.adapt the filter value
			filter_object[params_label.data_params.join_field_target] = [...params_label.transformations.crossfilter[params_label.data_params.join_field_source]]
			
			//3.filter the target dataset
			var data_label = params_label.data_params.dataset_target.filter(o=> Object.values(filter_object).flat().flat().flat().includes(o[params_label.data_params.join_field_target]) )

			//4.select the data row to display
			if (params_label.data_params.selection === "first" || params_label.data_params.selection === undefined) {
				return data_label[0][params_label.data_params.value_field_target]
			}
			else if (params_label.data_params.selection === "last") {
				return data_label.pop()[params_label.data_params.value_field_target]
			}
			else if (params_label.data_params.selection === "sum") {return d3.sum(data_label, f=> f[params_label.data_params.value_field_target])}
			else if (params_label.data_params.selection === "median") {return (d3.median(data_label, f=> f[params_label.data_params.value_field_target])).toFixed(2)}
			else if (params_label.data_params.selection === "mean") {return (d3.mean(data_label, f=> f[params_label.data_params.value_field_target])).toFixed(2)}
			else if (params_label.data_params.selection === "count") {return data_label.length}
			//filterList = formFilterArray(params_label)
		}

	}

	init_label(params_label, data) {
		  
		  var htmlNode = document.getElementById(params_label.htmlNode)

		  //create the label box & add it to the document node
		  var boxNode = document.createElement('div');
		  boxNode.className = "card card-2"
		  htmlNode.appendChild(boxNode)

		  //add styles to card
		  var card = document.querySelector('.card')
		  card.style.background = "#fff";
		  card.style.borderRadius = "4px";
		  card.style.display = "inline-block";
		  card.style.margin = "0rem";
		  card.style.padding = "0.5rem";
		  card.style.position = "relative";


		  var card2 = document.querySelector('.card-2')
		  card2.style.boxShadow = "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)";

		  //create the label structure 1
		  var labelStructure_node = document.createElement('h1')
		  labelStructure_node.className = 'ml14';

		  //add styles
		  labelStructure_node.style.fontWeight = params_label.fontWeight;
		  labelStructure_node.style.fontSize = params_label.fontSize_labels;
		  labelStructure_node.style.margin = "0.25rem";
		  





		  //create the label structure 2 && add it to structure 1
		  var labelTextWrapper_node = document.createElement('span')
		  labelTextWrapper_node.className = 'text-wrapper'

		  //styles
		  labelTextWrapper_node.style.position = "relative";
		  labelTextWrapper_node.style.display = "inline-block";
		  labelTextWrapper_node.style.paddingTop = "0.1em";
		  labelTextWrapper_node.style.paddingRight = "0.05em";
		  labelTextWrapper_node.style.paddingBottom = "0.15em";
		  
		  labelStructure_node.appendChild(labelTextWrapper_node)





		  //create the label sub structures  && add them to structure 2
		  var labeLetters_node = document.createElement('span')
		  labeLetters_node.className = 'letters'; labeLetters_node.id = params_label.id
		  //styles
		  labeLetters_node.style.display = "inline-block";
		  labeLetters_node.style.lineHeight = "1em";
		  labeLetters_node.style.width = "max-content"



		  

		  labelTextWrapper_node.appendChild(labeLetters_node)




		  //create the label sub structures  && add them to structure 2
		  var labeLine_node = document.createElement('span')
		  labeLine_node.className = 'line';  

		  //styles
		  labeLine_node.style.opacity = "0";
		  labeLine_node.style.position = "absolute";
		  labeLine_node.style.left = "0";
		  labeLine_node.style.height = "2px";
		  labeLine_node.style.width = "100%";
		  labeLine_node.style.backgroundColor = "#000000";
		  labeLine_node.style.transformOrigin = "100% 100%";
		  labeLine_node.style.bottom = "0";  

		  labelTextWrapper_node.appendChild(labeLine_node)

		  //add 
		  boxNode.appendChild(labelStructure_node)

		}	

		
		  /*-----------------.ml14------------------*/
	displayText(params_label) {
			// Wrap every letter in a span
			//var textWrapper = document.querySelector('.ml14 .letters');

			document.querySelector('#' + params_label.id).innerHTML = params_label.prefix + ": " + params_label.value

			var textWrapper = document.querySelector('#' + params_label.id);
			textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

			anime.timeline({loop: true})
			  .add({
			    targets: '.ml14 .line',
			    scaleX: [0,1],
			    opacity: [0.5,1],
			    easing: "easeInOutExpo",
			    duration: 1350
			  }).add({
			    targets: '.ml14 .letter',
			    opacity: [0,1],
			    translateX: [40,0],
			    translateZ: 0,
			    scaleX: [0.3, 1],
			    easing: "easeOutExpo",
			    duration: 1200,
			    offset: '-=600',
			    delay: (el, i) => 150 + 25 * i
			  }).add({
			    targets: '.ml14',
			    opacity: 0,
			    duration: 1500,
			    easing: "easeOutExpo",
			    delay: 10000000
			  });		
		}
	
}