class grouped_barChart {

	constructor(params_barChart) {		
		this.id = params_barChart.id
		this.ctx = params_barChart.ctx
	    this.category_field = params_barChart.category_field
	    this.sub_category_field = params_barChart.sub_category_field
	    this.numerical_field = params_barChart.numerical_field
	    this.title_x_axis = params_barChart.title_x_axis
	    this.title_y_axis = params_barChart.title_y_axis
		this.type = params_barChart.type
	    this.responsive = true
	    this.legend_position = params_barChart.legend_position[0]
	    this.legend_title = params_barChart.legend_title
	    this.legend_clicked = params_barChart.legend_clicked
	    this.title = params_barChart.title[0]
	    this.list_segments_selected = []
	    this.nb_categories = 0
	    this.nb_sous_categories = 0


	}

	prepare_data(data_input, params_barChart) {
		//processus de création d'un nouveau dataset: 
		//params_barChart.data[1].datasets.push({"label":0, backgroundColor: 'red', data: [39889, 19889, 14889]})
		//répeter l'opération autant de fois qu'il y a de sous-catégories (nb_sous_categories)
					
			if (params_barChart.list_of_axis.length === 0) {
				params_barChart.list_of_axis.push(this.category_field); params_barChart.list_of_axis.push(this.sub_category_field)
			}
			params_barChart.nb_axis = 2

			//1.obtenir les catégories (les communes par ex)
			var categories = deduplicate_dict(data_input, this.category_field); categories.sort()
			//2.obtenir les sous-catégories (la taille des logements par ex: 1p, 2p ...)
			var sous_categories = deduplicate_dict(data_input, this.sub_category_field); sous_categories.sort()
			var nb_categories = categories.length; var nb_sous_categories = sous_categories.length;
	        params_barChart.nb_categories = categories.length;
	        params_barChart.nb_sous_categories = sous_categories.length

			//3.création des catégories dans la spec ChartJS (champ labels dans chartJS)
			params_barChart.data[0].labels.push(categories)
			params_barChart.activ_categories_values = []; params_barChart.activ_categories_values.push(categories);
			params_barChart.activ_sub_categories_values = []; params_barChart.activ_sub_categories_values.push(sous_categories)
			var nb_categories = params_barChart.data[0].labels[0].length


            //4.créer un array borderColor et borderWidth égal à nb_sous_categories
            var borderColorArray = []; 
            var borderWidthArray = [];            
            for (var i = 0; i < nb_categories; i++) {
            	borderColorArray.push('rgba(230, 11, 11, 0)');
            	borderWidthArray.push(1);

        	};

			function shuffleArray(array) {
			    for (let i = array.length - 1; i > 0; i--) {
			        const j = Math.floor(Math.random() * (i + 1));
			        [array[i], array[j]] = [array[j], array[i]];
			    }; return array
			}
			

        	var backgroundColorArray = [];
        	if (params_barChart.backgroundColorArray_source.length === 0) {
        		var status_colors = "empty"
        		chartJS_backgroundColor = shuffleArray(chartJS_backgroundColor)
        	}


	        //if we initialize the backgroundColorArray for the first time, make a random select from the repository of colors
			function getRandomInt(max) {
			  return Math.floor(Math.random() * Math.floor(max));
			}

			var random_start = getRandomInt(chartJS_backgroundColor.length - nb_sous_categories-1)

			for (var i = 0; i < nb_sous_categories; i++) {
	            if (status_colors === "empty") {
		            backgroundColorArray.push(chartJS_backgroundColor[i])
		            params_barChart.backgroundColorArray_source.push(backgroundColorArray[i])
		        }
		        /*else {
		        	backgroundColorArray.push(params_barChart.backgroundColorArray_source[i])
		        }*/
		    }



			//guide création des sous-catégories dans la spec ChartJS
			//params_barChart.data[1].datasets.push({"label":data_group[i]['nb_pieces'], backgroundColor: 'red', data: [39889, 19889, 14889]})
	        
			//créer les datasets composés des sous_categories, du champ numérique à représenter, des couleurs des barres et leur bordure
	        for (var i = 0; i < nb_sous_categories; i++) {
	        	//1.recupérer la valeur de chaque sous-catégorie (1p, 2p ...)
	        	var sous_categorie = sous_categories[i]

	        	//2.récupérer l'array contenant les data associées à la sous-catégorie
	        	//2.1.filtrer le tableau d'entrée de la sous-catégorie    
	        	var dataset = data_input.filter((item)=> item[this.sub_category_field] === sous_categorie)
	            
	            //2.2.récupérer l'array contenant les data
	            var data_array = dataset.map(o=> o[this.numerical_field])


	            //3.construie l'array contenant les couleurs des barres
	        	//if preserve colors is turned on, populate first with grey bckg color
	        	backgroundColorArray = [];
	        	if (params_barChart.prepare_data_type === "preserve backgroundColor") {
		            for (var a = 0; a < nb_categories; a++) {
		        		backgroundColorArray.push('rgba(240, 240, 240, 0.5)')
					}
	        	}
	        	//else pick the colors from the central repository
	            else {
		            for (var a = 0; a < nb_categories; a++) {
		            	backgroundColorArray.push(params_barChart.backgroundColorArray_source[i])
		        	};
	        	}

	            //4.création des sous-catégories (champ label), data associée (champ data dans ChartJS) et couleurs et bordures dans la spec ChartJS 
	            params_barChart.data[1].datasets.push({label: sous_categorie, backgroundColor: backgroundColorArray, borderWidth: borderWidthArray, 
	            	borderColor: borderColorArray, data: data_array})

	        };


			//if the chart is already clicked, preserve the deactivated slices and maintain their color effect (grey or lower opacity)            
			if (params_barChart.prepare_data_type === "preserve backgroundColor") {

				var active_slices_category_fields = [];
				params_barChart.active_slices.forEach((d)=>{active_slices_category_fields.push(d.category_field)})
				//active_slices_category_fields = deduplicate_array(active_slices_category_fields)
				//var active_slices_sub_category_fields = deduplicate_dict(params_barChart_deepCopy.active_slices, "sub_category_field");
				var active_slices_sub_category_fields = [];
				params_barChart.active_slices.forEach((d)=>{active_slices_sub_category_fields.push(d.sub_category_field)})
				//var active_slices_bckgColors = deduplicate_dict(params_barChart_deepCopy.active_slices, "backgroundColor");
				var active_slices_bckgColors = [];
				params_barChart.active_slices.forEach((d)=>{active_slices_bckgColors.push(d.backgroundColor)})
				// var categories = params_barChart.data[0].labels; categories.sort()
				// var sous_categories = deduplicate_dict(this_chart.config.data.datasets, 'label'); sous_categories.sort()
				// var nb_sous_categories = this_chart.data.datasets.length
				var list_index_categories = []//used to register the position of the bckg color that has been highlighted
				for (var ii = 0; ii < nb_categories; ii++) {
					list_index_categories.push(ii)
				}


				//collect the position of the category field in the labels array
				var pos_category = _.map(params_barChart.active_slices, (o)=> categories.indexOf(o.category_field) )

				//add the position info in the active_slices array
				for (var c = 0; c < pos_category.length; c++) {
					params_barChart.active_slices[c]["pos"] = pos_category[c]
				}



				//2.loop over the entire datasets (metadata), check if the label of each dataset is in the sub category field  array
				for (var i = 0; i < nb_sous_categories; i++) {
					//list_index_categories = [];
					//1.recupérer la valeur de chaque sous-catégorie (1p, 2p ...)
					var sous_categorie = sous_categories[i];
					var pos_sub_category = active_slices_sub_category_fields.indexOf(sous_categorie);
					

					//filter the active slices array on the current sub category
					var filter1 = _.filter(params_barChart.active_slices, { 'sub_category_field': sous_categorie});

					if (filter1.length > 0) {
						var map2 = _.mapValues(filter1, function(o) { return o.pos + "_" + o.backgroundColor; })

						var pos_cat = 0
						for (var c = 0; c < nb_categories; c++) {
							
							if (c < filter1.length) {

								//get the pos of the separator
								var pos_sep = map2[c].indexOf("_")  //où pos_sep est la position du '_'
								//extract the pos of the category
								pos_cat = map2[c].substring(0, pos_sep)
								pos_cat = parseInt(pos_cat)
								//format proprely the bckg color value
								var bckg_color = map2[c].substr(map2[c].indexOf("_")+1, map2[c].length)
								//register the color at the right position in the bckg color array of the chart's metadata						
								params_barChart.data[1].datasets[i].backgroundColor[pos_cat] = bckg_color

							}


						}
					}

					else {
						for (var c = 0; c <= nb_categories; c++) {
							params_barChart.data[1].datasets[i].backgroundColor[c] = ('rgba(240, 240, 240, 0.5)')
							
						}						
					}


				}

			}





			params_barChart.list_idx_segments_existants = [];
			var list_idx_segments_existants = params_barChart.list_idx_segments_existants
	        //1.collecter les clés de tous les segments existants
			for (var i = 0; i < (nb_categories); i++) {			

					for (var a = 0; a < (nb_sous_categories); a++) {
						list_idx_segments_existants.push(a + "-" + i)
					}
			}                       

			//.sauvegarder une image des données source avant transformation
			if (params_barChart.data_source_raw.length === 0) {
				params_barChart.data_source_raw = data_input
				params_barChart.data_source[0].labels.push(categories)
		        params_barChart.data_source[1].datasets = params_barChart.data[1].datasets

		    }


	}


	init_chart(params_barChart) {		
		var barChart = new Chart(this.ctx, {
				        type: this.type,
				        data: [],
				        options: {
				            responsive: this.responsive,		
				            title: this.title,
			                scales: {
			                    yAxes: [{
			                        ticks: {
			                            beginAtZero: true
			                        }
			                    ,scaleLabel: {
							        display: true,
							        labelString: this.title_y_axis
							      }
							     }],

			                    xAxes: [{
			                     scaleLabel: {
							        display: true,
							        labelString: this.title_x_axis
							      }
							     }]

			                },
			                
			                animation: {
			                        duration: 1000,
			                        easing: 'easeOutQuad'
			                },
			             /*    tooltips: {
			                    mode: 'label'
			                },*/
			                legend: {
								display: true,
								position: "right",
								align: "start",
								padding: 30,
								rtl: true,
			                    position: 'right',
						        labels: {
									/*filter: function(legendItem, data, fl) {
						                return legendItem.text !== fl
						           	}  */        
						        },			                    
			                    onHover: function(e) {
			                        if (e) {
			                      		e.target.style.cursor = 'pointer';
			                     	}
			                      },
			                    onClick: function (evt, item) {
							        //preserve default behaviour on click
							        Chart.defaults.global.legend.onClick.call(this, evt, item)
			                        //register click event
			                        if (evt) {
			                      		params_barChart.legend_clicked = true
			                     	}			                     	
			                      }
		                }

				        }
				      });

		// Chart.plugins.register({
		//     beforeDraw: function(c) {
		//     	if (c === barChart) {
		// 	        var legends = c.legend.legendItems;
		// 	        var i=0
		// 	        legends.forEach(function(e) {
		// 	      		var backgroundColor = params_barChart.backgroundColorArray_source[i]
		// 		        e.fillStyle = backgroundColor;
		// 		        i++
		//       		});
		//       	};
		//       	console.log(legends)

		//    }
		// });	


		//alimenter avec les labels ET LES DATASETS
		var data_type = "data"; var injection_type = "init"
		this.inject_metadata(barChart, params_barChart, data_type, injection_type)

		return barChart 				
	}

	selections_listeners(params_barChart) {
/*		var t = 2
		singleSelect.params_barChart.list_labels_segment_single_selected.length = t; // console: 'hello_world set to test'
*/
	}
	

	inject_metadata(barChart, params_barChart, data_type, injection_type) {
		//alimenter avec les labels
		if (barChart.config.data.labels.length === 0) {
			barChart.config.data.labels = [...params_barChart[data_type][0].labels[0]]
		}


		//alimenter avec les datasets
		if (injection_type === "init") {
			var l = params_barChart[data_type][1].datasets.length;
			var datasets = [];
			for (var i = 0; i < l; i++) {
				datasets.push(params_barChart[data_type][1].datasets[i])
				barChart.config.data.datasets[i] = _.cloneDeep(datasets[i])
			}
			barChart.config.data.datasets = _.cloneDeep(datasets)
		}
		else if (injection_type === "update") {
			var l = params_barChart[data_type][1].datasets.length;
			var datasets = [];
			for (var i = 0; i < l; i++) {
				datasets.push(params_barChart[data_type][1].datasets[i])
				barChart.config.data.datasets[i].data = _.cloneDeep(datasets[i].data)
				barChart.config.data.datasets[i].label = _.cloneDeep(datasets[i].label)
				barChart.config.data.datasets[i].backgroundColor = _.cloneDeep(datasets[i].backgroundColor)
				barChart.config.data.datasets[i].borderColor = _.cloneDeep(datasets[i].borderColor)
				barChart.config.data.datasets[i].borderWidth = _.cloneDeep(datasets[i].borderWidth)
			}

		}


		//enable alignment of legend colors on slices colors for the charts with mutliple legends
		Chart.plugins.register({
		    beforeDraw: function (chart) {				
		            let legends = chart.legend.legendItems;
		            try {
			            legends.forEach(function (e, i) {
			              var chartLabel = barChart.config.data.datasets[i].label
			              var legendLabel = barChart.legend.legendItems[i].text
			              if (chartLabel === legendLabel) {
			              	var bckg_color = barChart.config.data.datasets[i].backgroundColor.filter((item)=> item !== "rgba(240, 240, 240, 0.5)");
			              	if (bckg_color.length > 0) {
				                e.fillStyle = bckg_color[0];
							}
							else {
								e.fillStyle = "rgba(240, 240, 240, 0.5)";	
							}	                
			              }                
			            });
			        }
			        catch (error) {console.log(error)}
		    }
		})

		barChart.update(750)


		//procedure manuelle pour remmetre les couleurs source
		/*bar1.config.data.datasets[2].backgroundColor = _.cloneDeep(params_bar1_deepCopy.data[1].datasets[2].backgroundColor)*/

		//register the chart instance in the param array
		params_barChart.chart_instance = barChart

		return barChart
	}



	maj_couleurs(barChart, params_barChart) {
		//on entre dans cette func pour enlever le focus posé sur les segments

		var nb_categories = params_barChart.nb_categories;
		var backgroundColorArray = [];

		//parcours catégories
		for (var i = 0; i < nb_categories; i++) {		
			
			//parcours sous-catégories
			var nb_sous_categories = params_barChart.nb_sous_categories;
			for (var a = 0; a < nb_sous_categories; a++) {
	/*			backgroundColorArray.push(params_barChart.data[1].datasets[a].backgroundColor[i])*/
				var backgroundColor = params_barChart.data_source[1].datasets[a].backgroundColor[i];
	/*			var borderColor = params_barChart.data[1].datasets[a].borderColor[i];*/
				barChart.config.data.datasets[a].backgroundColor[i] = backgroundColor;
				/*barChart.config.data.datasets[a].borderColor[i] = "rgba(230, 11, 11, 0)";*/
			}

			/*barChart.config.data.datasets[i].backgroundColor = backgroundColorArray;*/
			barChart.update();



		}
	}	

	reset_border_color(this_chart, params_barChart_deepCopy) {
		/*console.log("entree_zone_blanche"); console.log(this_chart); console.log(params_barChart_deepCopy);*/

		//remettre config sans bordures
		var nb_categories = params_barChart_deepCopy.nb_categories;

		//parcours catégories
		for (var i = 0; i < nb_categories; i++) {		
			
			//parcours sous-catégories
			var nb_sous_categories = params_barChart_deepCopy.nb_sous_categories;
			for (var a = 0; a < nb_sous_categories; a++) {
				this_chart.config.data.datasets[a].borderColor[i] = "rgba(230, 11, 11, 0)";
			};
			
		}

		this_chart.update();

	}




	add_options_hover(this_chart, params_barChart_deepCopy) {
			
			this_chart.config.options.hover = {
	                onHover: function(e) {
	                     var point = this_chart.getElementAtEvent(e);
	                     if (point.length) {
	                        //transformer curseur en pointeur
	                     	e.target.style.cursor = 'pointer'; 

	                     	//effacer les bordures précédantes
	                     	this_chart.update();

	                        //si survol d'un segment, mettre bordure rouge sur élément survolé
	                        var activePoints = this_chart.getElementAtEvent(e);                        
	                        if (activePoints[0]) {
	                            //relever l'index de l'élément survolé                    
	                            var idx = activePoints[0]['_index'];
								var datasetIdx = activePoints[0]['_datasetIndex'];

								//collecter la couleur du segment
								var activePoint_backgroundColor = activePoints[0]._model.backgroundColor;
								
								//augmenter l'opacité de la bordure
								activePoints[0]._model.borderColor = "rgba(230, 11, 11, 1)";
								params_barChart_deepCopy.border_activated = true
								
								//augmenter l'opacité du segment
								activePoint_backgroundColor = activePoint_backgroundColor.replace("0.65", "1")
								activePoints[0]._model.backgroundColor = activePoint_backgroundColor;

								var datasetLabel = activePoints[0]._model.datasetLabel;
								var label = activePoints[0]._model.label;

								//test désactivation couleurs segments non selectionnés
								

	                        }

	                     }
	                     else {
	                     	e.target.style.cursor = 'default';

	                     	if (params_barChart_deepCopy.border_activated === true) {
								params_barChart_deepCopy.instanciator.reset_border_color(this_chart, params_barChart_deepCopy)
								params_barChart_deepCopy.border_activated = false
							}

	                     }
	                }
		}
	}


	addListeners(ctx, this_chart, params_barChart_deepCopy) {

            //gestion de la bordure en zone blanche
            ctx.addEventListener("mouseover", function(evt){
                var activePoints = this_chart.getElementAtEvent(evt);

                if (activePoints[0]) {

                	try {
						var categorie = activePoints[0]._model.label;
						var sous_categorie = activePoints[0]._model.datasetLabel;

	                }
	                catch {
	                	console.log("segment non detecté, clic à l'exterieur du graph")
	                }    
                }
                else {
                	//remettre config sans bordures

                	/*console.log("entrée en zone blanche 2")*/
					var nb_categories = params_barChart_deepCopy.nb_categories;

					//parcours catégories
					for (var i = 0; i < nb_categories; i++) {		
						
						//parcours sous-catégories
						var sous_categories = deduplicate_dict(data_input, this.sub_category_field)						
				        var nb_sous_categories = params_barChart_deepCopy.nb_sous_categories;

						for (var a = 0; a < nb_sous_categories; a++) {
							this_chart.config.data.datasets[a].borderColor[i] = "rgba(230, 11, 11, 0)";
						};
						this_chart.update();

					}					
                }        

            });






            //collecter le segment cliqué
            ctx.addEventListener("click", function(evt){
                var activePoints = this_chart.getElementAtEvent(evt);

                if (activePoints[0]) {

                	try {
	                    var idx = activePoints[0]['_index'];
						var datasetIdx = activePoints[0]['_datasetIndex'];
						var key_composite = datasetIdx + "-" + idx

						var categorie = activePoints[0]._model.label;
						var sous_categorie = activePoints[0]._model.datasetLabel;




						//il faut annuler les segments multiples précédemment sélectionnés avant de passer à une sélection unique
						//controler que shift n'a pas été appuyé
						if (evt.shiftKey === false) {
							params_barChart_deepCopy.list_idx_segments_multiples_selected = []; params_barChart_deepCopy.list_labels_segments_multiples_selected = []
							params_barChart_deepCopy.list_keys_values_segments_multiples_selected = [];
						};
						////il faut annuler le segment unique sélectionné lors sur dernier clic
						params_barChart_deepCopy.list_labels_segment_single_selected = [];
						params_barChart_deepCopy.list_keys_values_segment_single_selected = [];
						
						var category_field = params_barChart_deepCopy.category_field;
						var sub_category_field = params_barChart_deepCopy.sub_category_field;
						params_barChart_deepCopy.list_labels_segment_single_selected.push({category_field: categorie, sub_category_field: sous_categorie});
						params_barChart_deepCopy.list_keys_values_segment_single_selected.push({[category_field] : [categorie], [sub_category_field]: [sous_categorie]});
						
						//observableSlim
						/*p.changeBar1 = key_composite;*/
						
						//controler que shift n'a pas été appuyé pour éviter des push multiples
						if (evt.shiftKey === false) {
							params_barChart_deepCopy.list_labels_segments_multiples_selected.push({category_field: categorie, sub_category_field: sous_categorie});
							params_barChart_deepCopy.list_keys_values_segments_multiples_selected.push({[category_field] : [categorie], [sub_category_field]: [sous_categorie]});
						}


	                    console.log("labels collectés:"); console.log(params_barChart_deepCopy.list_labels_segment_single_selected); /*console.log("valeur: " + value)*/

	                }
	                catch {
	                	console.log("segment non detecté, clic à l'exterieur du graph")
	                	//observableSlim
	                	/*p.changeBar1 = false;*/
	                	//vider la liste puisqu'on ne sélectionne plus aucun segment
						//vider liste des segments selectionnés
						params_barChart_deepCopy.list_idx_segment_single_selected = [];
						params_barChart_deepCopy.list_labels_segment_single_selected = [];
						params_barChart_deepCopy.list_keys_values_segment_single_selected = [];
						params_barChart_deepCopy.list_keys_values_segment_single_selected = [];
						params_barChart_deepCopy.list_keys_values_segments_multiples_selected = [];
						params_barChart_deepCopy.active_slices = []


	                }    
                }        

            });


            //gestion d'un clic unique sur un segment (pour désactiver les couleurs des segments non selectionnés)
            ctx.onclick = function(evt) {
            	
                var activePoints = this_chart.getElementAtEvent(evt);
                //si le clic est fait sur un des segments
                if (activePoints[0]) {
                	//1.remettre les couleurs d'origine sur tous les segments
	                params_barChart_deepCopy.instanciator.maj_couleurs(this_chart, params_barChart_deepCopy);

                    var idx = activePoints[0]['_index'];
					var datasetIdx = activePoints[0]['_datasetIndex'];
					var key_composite = datasetIdx + "-" + idx

					var categorie = activePoints[0]._model.label;
					var sous_categorie = activePoints[0]._model.datasetLabel;

                    //collect color of the slice
					var activePoint_backgroundColor = activePoints[0]._model.backgroundColor;
					//augmenter l'opacité du segment
					activePoint_backgroundColor = activePoint_backgroundColor.replace("0.65", "1")						


					////il faut annuler le segment unique sélectionné lors sur dernier clic					
					params_barChart_deepCopy.list_idx_segment_single_selected = [];
                    params_barChart_deepCopy.list_idx_segment_single_selected.push(key_composite);

					//controler que shift n'a pas été appuyé pour éviter des push multiples
					if (evt.shiftKey === false) {
    	                params_barChart_deepCopy.list_idx_segments_multiples_selected.push(key_composite);//++
						//evo
						params_barChart_deepCopy.active_slices = [];
						params_barChart_deepCopy.active_slices.push({category_field: categorie, sub_category_field: sous_categorie, backgroundColor: activePoint_backgroundColor})

    	            }


					
					/*console.log("idx: " + idx); console.log("datasetIdx: " + datasetIdx); console.log("id dataset: + key_composite")*/
                    var chartData = activePoints[0]['_chart'].config.data;                

                    //parcourir toutes les barres pour les mettre en gris sauf celle cliquée
                    var nb_categories = params_barChart_deepCopy.nb_categories;
    
                        for (var i = 0; i < (nb_categories); i++) {
                            //si la categorie parcourue n'est pas la catégorie active
                            var nb_sous_categories = params_barChart_deepCopy.nb_sous_categories;

                            	for (var a = 0; a < (nb_sous_categories); a++) {
                            		var lock_composite = a + "-" + i
                            		//si on entre dans un segment différent du segment actif, griser la couleur du segment
                            		if (key_composite !== lock_composite) {
	                            	//la couleur de fond se désactive ainsi pour le 1er segment: bar1.config.data.datasets[0].backgroundColor[0] = 'grey'
	                            		this_chart.config.data.datasets[a].backgroundColor[i] = "rgba(240, 240, 240, 0.5)";
	                                
	                            	}
									else {
										//collecter la couleur du segment
										var activePoint_backgroundColor = activePoints[0]._model.backgroundColor;
										
										//augmenter l'opacité du segment
										activePoint_backgroundColor = activePoint_backgroundColor.replace("0.65", "1")
										activePoints[0]._model.backgroundColor = activePoint_backgroundColor;
										this_chart.config.data.datasets[a].backgroundColor[i] = activePoint_backgroundColor;


										//register in the params_chart the active category & it's background color
/*										params_barChart_deepCopy.active_slices["category_field"] = activePoints[0]._model.label;
										params_barChart_deepCopy.active_slices["sub_category_field"] = activePoints[0]._model.datasetLabel;
										params_barChart_deepCopy.active_slices["backgroundColor"] = activePoint_backgroundColor;
*/				


									}

                            	}                            	



                        };

                        //save the colors of the filtred state
						var backgroundColor_array = [];
						for (var i = 0; i < this_chart.config.data.datasets.length; i++) {
							backgroundColor_array.push(this_chart.config.data.datasets[i].backgroundColor[0])
						};
						params_barChart_deepCopy.backgroundColor_array_ClickedState = backgroundColor_array;                        
                        
                        this_chart.update()

                }

                //remettre les couleurs d'origine lors d'un clic à l'extérieur des barres
                else {

                    params_barChart_deepCopy.instanciator.maj_couleurs(this_chart, params_barChart_deepCopy)
					//vider liste des segments selectionnés
					params_barChart_deepCopy.list_idx_segment_single_selected = [];
					params_barChart_deepCopy.list_labels_segment_single_selected = [];
					params_barChart_deepCopy.list_idx_segments_multiples_selected = [];
					params_barChart_deepCopy.list_labels_segments_multiples_selected = [];
					params_barChart_deepCopy.list_keys_values_segment_single_selected = [];
					params_barChart_deepCopy.list_keys_values_segments_multiples_selected = [];
					params_barChart_deepCopy.active_slices = []
					

                }
            }





            //rés-activer les couleurs de tous les segments
            ctx.ondblclick = function(evt) {
                params_barChart_deepCopy.instanciator.maj_couleurs(this_chart, params_barChart_deepCopy)

				//vider liste des segments selectionnés
				params_barChart_deepCopy.list_idx_segment_single_selected = [];
				params_barChart_deepCopy.list_labels_segment_single_selected = [];
				params_barChart_deepCopy.list_idx_segments_multiples_selected = [];
				params_barChart_deepCopy.list_labels_segments_multiples_selected = [];
				params_barChart_deepCopy.list_keys_values_segment_single_selected = [];
				params_barChart_deepCopy.list_keys_values_segments_multiples_selected = [];
				params_barChart_deepCopy.active_slices = []
				//observableSlim
				/*p.changeBar1 = false;*/

            };
            





	      //gestion d'un clic + shift sur plusiers segments (pour désactiver les couleurs des segments non selectionnés)
	      ctx.addEventListener("click",
	        function(e) {
	            if (e.shiftKey) {
	                    console.log("Shift, yay!");
	                	//1.remettre les couleurs d'origine sur tous les segments
		                params_barChart_deepCopy.instanciator.maj_couleurs(this_chart, params_barChart_deepCopy);

	                    var activePoints = this_chart.getElementAtEvent(e);
	                    var idx = activePoints[0]['_index'];
						var datasetIdx = activePoints[0]['_datasetIndex'];
						var key_composite = datasetIdx+"-"+idx
						
						var categorie = activePoints[0]._model.label;
						var sous_categorie = activePoints[0]._model.datasetLabel;

						var category_field = params_barChart_deepCopy.category_field;
						var sub_category_field = params_barChart_deepCopy.sub_category_field;
						//collect the backgroundcolor of the slice
						var activePoint_backgroundColor = activePoints[0]._model.backgroundColor;
						//augmenter l'opacité du segment
						activePoint_backgroundColor = activePoint_backgroundColor.replace("0.65", "1")

						var list_idx_segments_existants = params_barChart_deepCopy.list_idx_segments_existants

						//vider les listes alimentées par un clic unique
						params_barChart_deepCopy.list_idx_segment_single_selected = []; params_barChart_deepCopy.list_labels_segment_single_selected = [];

						//refresh the lists fed by clic+shift
						//1.if the slice selected is not in the current lists, push it
						var pos_slice = params_barChart_deepCopy.list_idx_segments_multiples_selected.indexOf(key_composite);
						if (pos_slice === -1) {
		                    params_barChart_deepCopy.list_idx_segments_multiples_selected.push(key_composite);	                    
							params_barChart_deepCopy.list_labels_segments_multiples_selected.push({category_field: categorie, sub_category_field: sous_categorie});
							params_barChart_deepCopy.list_keys_values_segments_multiples_selected.push({[category_field] : [categorie], [sub_category_field]: [sous_categorie]});
							//register in the params_chart the active category & it's background color
							params_barChart_deepCopy.active_slices.push({category_field: categorie, sub_category_field: sous_categorie, backgroundColor: activePoint_backgroundColor})							
						}
						//2.delete selected slice from the diffent arrays
						else {
							params_barChart_deepCopy.list_idx_segments_multiples_selected.splice(pos_slice, 1)

							var index_sub_cat = params_barChart_deepCopy.list_labels_segments_multiples_selected.findIndex(x => x.sub_category_field === sous_categorie);
							params_barChart_deepCopy.list_labels_segments_multiples_selected.splice(index_sub_cat, 1)

							var index_sub_cat = params_barChart_deepCopy.list_keys_values_segments_multiples_selected.findIndex(x => x[sub_category_field][0] === sous_categorie);
							params_barChart_deepCopy.list_keys_values_segments_multiples_selected.splice(index_sub_cat, 1)

							var index_sub_cat = params_barChart_deepCopy.active_slices.findIndex(x => x.sub_category_field === sous_categorie);
							params_barChart_deepCopy.active_slices.splice(index_sub_cat, 1)
						}



	                    //observableSlim
	                    /*p.changeBar1 = false;*/
	                    var chartData = activePoints[0]['_chart'].config.data;
	             

	                    //parcourir toutes les barres pour les mettre en gris sauf celles cliquées
	                    var nb_segments_existants = params_barChart_deepCopy.list_idx_segments_existants.length;
	                    var nb_categories = params_barChart_deepCopy.nb_categories;
						

	                    //v2
						//1.extract into separate arrays the labels array (metadata), the category field, sub category field  & bckg color (active slices)
						
						var active_slices_category_fields = [];
						params_barChart_deepCopy.active_slices.forEach((d)=>{active_slices_category_fields.push(d.category_field)})
						//var active_slices_sub_category_fields = deduplicate_dict(params_barChart_deepCopy.active_slices, "sub_category_field");
						var active_slices_sub_category_fields = [];
						params_barChart_deepCopy.active_slices.forEach((d)=>{active_slices_sub_category_fields.push(d.sub_category_field)})
						//var active_slices_bckgColors = deduplicate_dict(params_barChart_deepCopy.active_slices, "backgroundColor");
						var active_slices_bckgColors = [];
						params_barChart_deepCopy.active_slices.forEach((d)=>{active_slices_bckgColors.push(d.backgroundColor)})
						var categories = this_chart.config.data.labels; categories.sort()

						var sous_categories = this_chart.config.data.datasets.filter(dataset => typeof(dataset.label) !== 'object');
						sous_categories = deduplicate_dict(sous_categories, 'label'); sous_categories.sort()						
						//var sous_categories = deduplicate_dict(this_chart.config.data.datasets, 'label'); sous_categories.sort()						
						//var nb_sous_categories = this_chart.data.datasets.length
						//var sous_categories = this_chart.legend.legendItems.filter(legend => typeof(legend.text) !== 'object' && legend.hidden === false);
						//var sous_categories = _.map(sous_categories, (o)=> (o.text) );
						var nb_sous_categories = sous_categories.length
						var list_index_categories = []//used to register the position of the bckg color that has been highlighted

						//2.loop over the entire datasets (metadata), check if the label of each dataset is in the sub category field  array
						for (var i = 0; i < nb_sous_categories; i++) {
							//1.recupérer la valeur de chaque sous-catégorie (1p, 2p ...)
							list_index_categories = [];
							var sous_categorie = sous_categories[i];
							var pos_sub_category = active_slices_sub_category_fields.indexOf(sous_categorie);

							for (var a = 0; a < active_slices_sub_category_fields.length; a++) {
								var active_sub_category_field = active_slices_sub_category_fields[a]
														
								//3.if the check is true:
								if (active_sub_category_field === sous_categorie) {
									// 3.2.with this pos a, get the category field value from the array of category fields, built in step 1
									var active_slices_category_field_value = active_slices_category_fields[a];
							 		//3.3.get the bckg color value from the array of bckg colors, built in step 1
									var active_slice_bckgColor = active_slices_bckgColors[a];
									//3.4.collect the position of the category field value in the array of labels, built in step 1 (pos b)
									var pos_category_field = categories.indexOf(active_slices_category_field_value)
									//3.5.access the pos b of the bckg colors array (metadata) and replace it's value with the bckg color value
									
									//3.6.put in light grey all the other values except the above
									for (var c = 0; c <= nb_categories; c++) {
										if (c === pos_category_field) {
											this_chart.config.data.datasets[i].backgroundColor[c] = active_slice_bckgColor;
											list_index_categories.push(c);
										}
										else if (list_index_categories.indexOf(c) === -1) {
											this_chart.config.data.datasets[i].backgroundColor[c] = ('rgba(240, 240, 240, 0.5)')
										}
										
									}
								}
							

								//4.1.replace all the values of the bckg colors array (metadata) with light grey
								else if (pos_sub_category === -1) {
									for (var c = 0; c <= nb_categories; c++) {
										this_chart.config.data.datasets[i].backgroundColor[c] = ('rgba(240, 240, 240, 0.5)')
										
									}
								

								}
							}
						};
						this_chart.update();


				
	            }

	                /*}*/
	        },false)
	}
}



