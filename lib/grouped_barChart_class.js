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
	    this.title = params_barChart.title[0]
	    this.list_segments_selected = []
	    this.nb_categories = 0
	    this.nb_sous_categories = 0


	}

	prepare_data(data_input, params_barChart) {
		/*processus de création d'un nouveau dataset: 
		params_barChart.data[1].datasets.push({"label":0, backgroundColor: 'red', data: [39889, 19889, 14889]})
		répeter l'opération autant de fois qu'il y a de sous-catégories (nb_sous_categories)
		*/			
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
            for (var i = 0; i < nb_sous_categories; i++) {
            	borderColorArray.push('rgba(230, 11, 11, 0)');
            	borderWidthArray.push(1);

        	};

			/*guide création des sous-catégories dans la spec ChartJS
			params_barChart.data[1].datasets.push({"label":data_group[i]['nb_pieces'], backgroundColor: 'red', data: [39889, 19889, 14889]})*/
	        
			//créer les datasets composés des sous_categories, du champ numérique à représenter, des couleurs des barres et leur bordure
	        for (var i = 0; i < nb_sous_categories; i++) {
	        	//1.recupérer la valeur de chaque sous-catégorie (1p, 2p ...)
	        	var sous_categorie = sous_categories[i]

	        	//2.récupérer l'array contenant les data associées à la sous-catégorie
	        	//2.1.filtrer le tableau d'entrée de la sous-catégorie    
	        	var dataset = data_input.filter((item)=> item[this.sub_category_field] === sous_categorie)
	            
	            //2.2.récupérer l'array contenant les data
	            var data_array = deduplicate_dict(dataset, this.numerical_field)


	            //3.construie l'array contenant les couleurs des barres
	            var backgroundColorArray = [];
				//if the chart is already clicked, preserve the deactivated slices and maintain their color effect (grey or lower opacity)            
			    if (params_barChart.prepare_data_type === "preserve backgroundColor") {


	            	//1.collecte the category_field value & background color of the active slice
	            	for (var b = 0; b < params_barChart.active_slices.length; b++) {

		            	var active_category_field = params_barChart.active_slices[b].category_field
		            	var active_sub_category_field = params_barChart.active_slices[b].sub_category_field
		            	var active_slice_backgroundColor = params_barChart.active_slices[b].backgroundColor		            	
		            	

		            	//2.collecte the position of the active_category_field in the filtred array of labels
		            	var array_labels = params_barChart.data[0].labels[0]
		            	var pos_active_category_field = array_labels.indexOf(active_category_field)

		            	//3.add grey backgroundColor to the slices, except the active slice setup above
		            	/*if the current dataset label corresponds to the active slice sub category label, push the active color in the right position of the background color
		            	array*/
	            		if (sous_categorie === active_sub_category_field) {
		            		//loop through backgroundColorArray lentgh and push grey color, except for the active slice
		            		for (var j = 0; j < nb_categories; j++) {
		            			//push grey color for all non active slices (where pos_active_category_field !== j)
		            			if (j !== pos_active_category_field) {
		            				backgroundColorArray.push('rgba(240, 240, 240, 0.5)');
		            			}
		            			else if (j === pos_active_category_field) {
		            				backgroundColorArray.push(active_slice_backgroundColor);
		            			}
		            		}			
	    				}

	    				else if (sous_categorie !== active_sub_category_field) { //i === pos_active_category_field && 
		            		//loop through backgroundColorArray lentgh and push grey color, except for the active slice
		            		for (var j = 0; j < nb_categories; j++) {
		            			backgroundColorArray.push('rgba(240, 240, 240, 0.5)');
		            			//push grey color for all non active slices (where pos_active_category_field !== j)
	/*	            			if (j !== pos_active_category_field) {
		            				backgroundColorArray.push();
		            			}
		            			else if (j === pos_active_category_field) {
		            				backgroundColorArray.push(active_slice_backgroundColor);
		            			}*/
		            		}
	    				}
	            	/*}*/
	            }
            


			    /*	backgroundColorArray.push(params_barChart.backgroundColor_array_ClickedState[i])*/
			    }
			    //else collect the colors form the central repository for colors
			    else {
		            for (var a = 0; a < nb_sous_categories; a++) {
		            	backgroundColorArray.push(chartJS_backgroundColor[i+1])
		        	};
		        }

	            //4.création des sous-catégories (champ label), data associée (champ data dans ChartJS) et couleurs et bordures dans la spec ChartJS 
	            params_barChart.data[1].datasets.push({label: sous_categorie, backgroundColor: backgroundColorArray, borderWidth: borderWidthArray, 
	            	borderColor: borderColorArray, data: data_array})

	        };

		var list_idx_segments_existants = params_barChart.list_idx_segments_existants                    		
        //1.collecter les clés de tous les segments existants
		for (var i = 0; i < (nb_categories); i++) {
			/*var nb_sous_categories = params_barChart.data[1].datasets[i].data.length*/

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
									generateLabels: function(chart) {
									      var data = chart.data;
									      let labels = Chart.defaults.global.legend.labels.generateLabels(chart);
									      let title = {
									        text: "nb de pièces",
									        strokeStyle: 'transparent',
									        fillStyle: 'transparent',
									        lineWidth: 0
									    	}
									      return [title, ...labels];
									    }			  
								},			                	
			                    onHover: function(e) {
			                        if (e) {
			                      		e.target.style.cursor = 'pointer';
			                     	}
			                      }                     
		                }

				        }
				      });

		//gestion indépendante des légendes
		Chart.plugins.register({
		   beforeDraw: function(c) {
		      var legends = c.legend.legendItems;
		      var i=0
		      legends.forEach(function(e) {
		      		var backgroundColor = chartJS_backgroundColor[i]
			        e.fillStyle = backgroundColor;
			        i++
		      });


		   }
		});		

		//alimenter avec les labels ET LES DATASETS
		var data_type = "data"
		this.inject_metadata(barChart, params_barChart, data_type)

		return barChart 				
	}

	selections_listeners(params_barChart) {
/*		var t = 2
		singleSelect.params_barChart.list_labels_segment_single_selected.length = t; // console: 'hello_world set to test'
*/
	}
	

	inject_metadata(barChart, params_barChart, data_type) {
		//alimenter avec les labels
		if (barChart.config.data.labels.length === 0) {
			barChart.config.data.labels = [...params_barChart[data_type][0].labels[0]]
		}
		//alimenter avec les datasets
		var l = params_barChart[data_type][1].datasets.length;
		var datasets = [];
		for (var i = 0; i < l; i++) {
			datasets.push(params_barChart[data_type][1].datasets[i])
		}
		barChart.config.data.datasets = _.cloneDeep(datasets)
		

		barChart.update()

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
	                            		this_chart.config.data.datasets[a].backgroundColor[i] = "rgba(240, 240, 240,0.5)";
	                                /*this_chart.data.datasets[0].backgroundColor[i] = "rgba(240, 240, 240,0.5)";*/
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


						var list_idx_segments_existants = params_barChart_deepCopy.list_idx_segments_existants

						//vider les listes alimentées par un clic unique
						params_barChart_deepCopy.list_idx_segment_single_selected = []; params_barChart_deepCopy.list_labels_segment_single_selected = [];
	                    params_barChart_deepCopy.list_idx_segments_multiples_selected.push(key_composite);	                    
						params_barChart_deepCopy.list_labels_segments_multiples_selected.push({category_field: categorie, sub_category_field: sous_categorie});
						params_barChart_deepCopy.list_keys_values_segments_multiples_selected.push({[category_field] : [categorie], [sub_category_field]: [sous_categorie]});


						//collect the backgroundcolor of the slice
						var activePoint_backgroundColor = activePoints[0]._model.backgroundColor;

						//register in the params_chart the active category & it's background color
/*						params_barChart_deepCopy.active_slices["category_field"] = categorie;
						params_barChart_deepCopy.active_slices["sub_category_field"] = sous_categorie;	
						params_barChart_deepCopy.active_slices["backgroundColor"] = activePoint_backgroundColor;
*/
						//evo
						params_barChart_deepCopy.active_slices.push({category_field: categorie, sub_category_field: sous_categorie, backgroundColor: activePoint_backgroundColor})

	                    //observableSlim
	                    /*p.changeBar1 = false;*/
	                    var chartData = activePoints[0]['_chart'].config.data;
	             

	                    //parcourir toutes les barres pour les mettre en gris sauf celles cliquées
	                    var nb_segments_existants = params_barChart_deepCopy.list_idx_segments_existants.length;
	                    var nb_categories = params_barChart_deepCopy.nb_categories;
						

	                    //ne s'applique qu'en cas de sélection multiple
	    
	                        for (var i = 0; i < this_chart.data.datasets.length; i++) {
	                            //si le segment n'appartient pas à la liste des segments selectionnés, le mettre en gris
	                            var segment_a_traiter = list_idx_segments_existants[i];

	                            //si le segment actuel a déjà été selectionné, ne pas le griser
	                            if (params_barChart_deepCopy.list_idx_segments_multiples_selected.indexOf(segment_a_traiter) === -1) {
	                            	//--------------recomposer les index à partir du segment à traiter
									var pos_sep = segment_a_traiter.indexOf("-")  //où pos_sep est la position du '-'
									var idx_Cat = segment_a_traiter.substring(0, pos_sep) //où idx_sCat est la valeur de ma catégorie
									var idx_sousCat = segment_a_traiter.substring(pos_sep+1) //où idx_sousCat est la valeur de ma sous catégorie
									//convertir les idx en int
									idx_Cat = parseInt(idx_Cat)
									idx_sousCat = parseInt(idx_sousCat)
									//--------------fermeture

	                                this_chart.data.datasets[idx_Cat].backgroundColor[idx_sousCat] = "rgba(240, 240, 240,0.5)";
	                                
	                            }
	                            //si le segment appartient à la liste des segments selectionnés, augmenter son opacité
	/*                            else {
	                                var color = chartJS_backgroundColor_deepCopy[i];
	                                color = color.replace("0.65", "0.9")
	                                this_chart.data.datasets[0].backgroundColor[i] = color;
	                                this_chart.update();
	                            }*/
	                        };
	                        this_chart.update();
	                    }

	                /*}*/
	        },false)
	}
}



