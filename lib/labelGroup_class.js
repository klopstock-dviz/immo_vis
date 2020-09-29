class LabelGroup {

	createChart(params_labels, sharedParams) {
		//params_labels.transformations.crossfilter = {"INSEE_COM": ["33063", "33281"], nb_pieces: [2]}//, "33281"
		params_labels.value = this.prepare_data_p1(params_labels)


		this.init_label(params_labels)

		this.displayText(params_labels)

		params_labels.chart_type = "labelGroup"

		params_labels.instanciator = this
		
		//add params chart to shared params if no present
		if (sharedParams.params_charts.includes(params_labels) === false) {
			sharedParams.params_charts.push(params_labels)
		}

		params_labels.created = true
	}

	updateChart(params_labels, sharedParams) {
		params_labels.value = this.prepare_data_p1(params_labels)

		//if the label group exists, delete it before update		
		var title = document.querySelector("#" + params_labels.id + "_title"); title.remove(); var card = document.querySelector("#" + 'card_' + params_labels.id); card.remove()
		
		this.init_label(params_labels)

		this.displayText(params_labels)		
	}

	prepare_data_p1(params_labels, data_to_transform) {
	    var d1 = new Date();

	    //zone de filtrage
	    //filter the primary data source according to the scope of the vizualisation (limited geographic area, range of time, any specific observation)

	    //data source for the bar chart
	    /*if (params_labels.transformations.dataset === undefined) {
	    	var data_chart = [...sharedParams.data_main]
	    	
	    }
	    else {
	    	var data_chart = [...params_labels.transformations.dataset]	    	
	    }*/



	    var join_field_source = params_labels.labels_data_params.filter(r=> r.shared_params)[0].shared_params.join_field_source
	    var join_field_target = params_labels.labels_data_params.filter(r=> r.shared_params)[0].shared_params.join_field_target
	    var dataset_target = params_labels.labels_data_params.filter(r=> r.shared_params)[0].shared_params.dataset_target
		var filter_object = {};
		//if the crossfilter is provided, extract & transform values of the filter_array (provided by the crossfilter process)
		if (params_labels.transformations.crossfilter !== undefined && Object.keys(params_labels.transformations.crossfilter).length > 0 ) {
			//1.delete all useless fields, non provided in labels_data_params.field_source
			Object.keys(params_labels.transformations.crossfilter).forEach(key=> {			
				if (key !== join_field_source) {
					delete params_labels.transformations.crossfilter[key]
				}				
			})

			//check if there is still filter values
			if (Object.keys(params_labels.transformations.crossfilter).length === 0) {
				return
			}
			//adapt the filter value
			filter_object[join_field_target] = [...params_labels.transformations.crossfilter[join_field_source]]
			
			//filter the target dataset
			var data_label = dataset_target.filter(o=> Object.values(filter_object).flat().flat().flat().
				includes(o[join_field_target]) )


			//build the data to display for each label
			//take record of label values before
			var id_value_previous = params_labels.labels_data_params.filter(r=> r.value).map(r=> r.value).join('|')
			params_labels.labels_data_params.map(label=> {
				//case when simple selection
				if (label.data_params && label.data_params.value_field_target && label.data_params.selection) {
					//4.select the data row to display
					if (label.data_params.selection === "first") {
						label["value"] = data_label[0][label.data_params.value_field_target]
					}
					else if (label.data_params.selection === "last") {
						label["value"] = data_label.pop()[label.data_params.value_field_target]
					}
					else if (label.data_params.selection === "sum") {label["value"] = (d3.sum(data_label, f=> f[label.data_params.value_field_target])).toFixed()}
					else if (label.data_params.selection === "mean") {label["value"] = (d3.mean(data_label, f=> f[label.data_params.value_field_target])).toFixed(2)}
					else if (label.data_params.selection === "median") {label["value"] = (d3.median(data_label, f=> f[label.data_params.value_field_target])).toFixed(2)}
					else if (label.data_params.selection === "count") {label["value"] = data_label.length}
				}

				//case when operation
				else if (label.data_params && label.data_params.operation) {
					var args = {...label.data_params.operation.arguments}, values_args = {};

					if (label.data_params.operation.selection === "first" || label.data_params.operation.selection === undefined) {
						Object.keys(args).map(key=> {values_args[key] = data_label[0][args[key]] })
						label["value"] = label.data_params.operation.function(values_args)
					}
					else if (label.data_params.operation.selection === "last") {
						Object.keys(args).map(key=> {values_args[key] = data_label.pop()[args[key]] })
						label["value"] = label.data_params.operation.function(values_args)
					}

					else {
						var list_of_values = []
						data_label.map(r=> {
							
							Object.keys(args).map(key=> {values_args[key] = r[args[key]] })
							list_of_values.push(label.data_params.operation.function(values_args))

						})
						if (label.data_params.operation.selection === "sum") {label["value"] = (d3.sum(list_of_values)).toFixed()}
						else if (label.data_params.operation.selection === "mean") {label["value"] = (d3.mean(list_of_values)).toFixed(2)}
						else if (label.data_params.operation.selection === "median") {label["value"] = (d3.median(list_of_values)).toFixed(2)}
						else if (label.data_params.operation.selection === "count") {label["value"] = list_of_values.length}
						
					}					
				}
			})
			
			var id_value_current = params_labels.labels_data_params.filter(r=> r.value).map(r=> r.value).join('|')

			if (id_value_previous !== id_value_current) {params_labels.updateLabels = true}
		}

	}

	init_label(params_labels, data) {
		  
		  var htmlNode = document.getElementById(params_labels.htmlNode)

		  //create the title of the label group
		  //<h2 style="margin-bottom: 5px">Démographie:</h2>
		  var title = document.createElement('h3')
		  title.id = params_labels.id + "_title"
		  title.style.marginBottom = "5px"
		  title.innerHTML = params_labels.title
		  title.style.fontSize = params_labels.groupTitle_fontSize;
		  htmlNode.appendChild(title)

		  //create the label box & add it to the document node
		  var boxNode = document.createElement('div');
		  boxNode.className = "card card-2"
		  boxNode.id = 'card_' + params_labels.id
		  htmlNode.appendChild(boxNode)

		  //add styles to card
		  var card = document.querySelector('.card')
		  card.style.background = "#fff";
		  card.style.borderRadius = "4px";
		  //card.style.display = "inline-block";
		  card.style.margin = "0rem";
		  card.style.padding = "0.5rem";
		  card.style.position = "relative";
		  card.style.display = "inline-grid";
		  card.style.gridColumnGap = "15px";
		  /*grid-row-gap: 20px;*/
		  var gridTemplateColumns = "auto ".repeat(params_labels.nb_of_columns)
		  card.style.gridTemplateColumns = gridTemplateColumns;
		  /*background-color: #2196F3;*/
		  card.style.padding = "5px";    		  


		  var card2 = document.querySelector('.card-2')
		  card2.style.boxShadow = "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)";



		  //create the labels
		  params_labels.labels_data_params.filter(l=> l.value).map(l=> {
			  //create the label structure 1
			  var labelStructure_node = document.createElement('h1')
			  labelStructure_node.className = 'ml14';

			  //add styles
			  labelStructure_node.style.fontWeight = params_labels.fontWeight;			  
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


			  //create the title
			  var title_node = document.createElement('p')
			  title_node.style.fontSize = params_labels.fontSize_titles
			  title_node.innerHTML = l.prefix + ":"
			  labelTextWrapper_node.appendChild(title_node)

			  //create the label sub structures  && add them to structure 2
			  var labeLetters_node = document.createElement('span')
			  labeLetters_node.className = 'letters'; labeLetters_node.id = l.id
			  //styles
			  //labeLetters_node.style.display = "inline-block";
			  labeLetters_node.style.lineHeight = "1em";
			  //labeLetters_node.style.width = "max-content"
			  labeLetters_node.style.display = 'flex'
			  labeLetters_node.style.justifyContent = 'left'
			  labeLetters_node.style.fontSize = params_labels.fontSize_labels



			  

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



			//create a column separator
			var separator_node = document.createElement('div')
			separator_node.className = 'sep'; separator_node.style.borderRight = "double"; separator_node.style.margin = "0.25rem"; separator_node.style.width = '1px'

			boxNode.appendChild(separator_node)

		})
	}

		  /*-----------------.ml14------------------*/
	displayText(params_labels) {
			// Wrap every letter in a span
			//var textWrapper = document.querySelector('.ml14 .letters');
			 //create the labels
			 params_labels.labels_data_params.filter(l=> l.value).map(l=> {			
				//document.querySelector('#' + l.id).innerHTML = l.prefix + ": " + l.value
				l.suffix ? document.querySelector('#' + l.id).innerHTML = l.value + "&nbsp;" + l.suffix : document.querySelector('#' + l.id).innerHTML = l.value

				var textWrapper = document.querySelector('#' + l.id);
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
			
		})
	}
	
}