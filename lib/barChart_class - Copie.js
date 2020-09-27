class barChart {

	constructor(params_barChart) {		
		this.ctx = params_barChart.ctx
		this.type = params_barChart.type
	    this.responsive = true
	    this.legend = params_barChart.legend[0]
	    this.title = params_barChart.title[0]
	    this.list_segments_selected = []


	}

/*structure à reproduire:
  datasets: [{
    label: 'Dataset 1',
    backgroundColor: [],
    data: [

    ]
    */

	prepare_data(data_input, params_barChart) {
		/*processus de création d'un nouveau dataset: 
		params_barChart.data[1].datasets.push({"label":0, backgroundColor: 'red', data: [39889, 19889, 14889]})
		répeter l'opération autant de fois qu'il y a de sous-catégories (taille_sous_categories)
		*/			

			//1.obtenir les catégories (les communes par ex)
			var categories = nb_elements_uniques(data_input, "DEP")		
			//2.obtenir les sous-catégories (la taille des logements par ex: 1p, 2p ...)
			var sous_categories = nb_elements_uniques(data_input, "nb_pieces")						
	        var taille_sous_categories = sous_categories.length

			//création des catégories dans la spec ChartJS (champ labels dans chartJS)
			params_barChart.data[0].labels.push(categories)

            //3.créer un array borderColor et borderWidth égal à taille_sous_categories
            var borderColorArray = []; 
            var borderWidthArray = [];            
            for (var i = 0; i < taille_sous_categories; i++) {
            	borderColorArray.push('rgba(230, 11, 11, 0)');
            	borderWidthArray.push(1);

        	};

			/*guide création des sous-catégories dans la spec ChartJS
			params_barChart.data[1].datasets.push({"label":data_group[i]['nb_pieces'], backgroundColor: 'red', data: [39889, 19889, 14889]})*/
	        

	        for (var i = 0; i < taille_sous_categories; i++) {
	        	//recupérer la valeur de chaque sous-catégorie (1p, 2p ...)
	        	var sous_categorie = sous_categories[i]

	        	//récupérer l'array contenant les data associées à la sous-catégorie
	        	//1.filtrer le tableau d'entrée de la sous-catégorie    
	        	var dataset = data_input.filter((item)=> item.nb_pieces === sous_categorie)
	            
	            //2.récupérer l'array
	            var data_array = nb_elements_uniques(dataset, 'nb_log')
	            
	            var backgroundColorArray = [];
	            for (var a = 0; a < taille_sous_categories; a++) {
	            	backgroundColorArray.push(chartJS_backgroundColor[i])
	        	};

	            //création des sous-catégories (champ label), data associée (champ data dans ChartJS) et couleur dans la spec ChartJS 
	            params_barChart.data[1].datasets.push({label: sous_categorie, backgroundColor: backgroundColorArray, borderWidth: borderWidthArray, 
	            	borderColor: borderColorArray, data: data_array})

	        };			

		var list_idx_segments_existants = params_barChart.list_idx_segments_existants                    
		var nb_categories = params_barChart.data[1].datasets.length
        //1.collecter les clés de tous les segments existants
		for (i = 0; i < (nb_categories); i++) {
			var nb_sous_categories = params_barChart.data[1].datasets[i].data.length

				for (a = 0; a < (nb_sous_categories); a++) {
					list_idx_segments_existants.push(a + "-" + i)
				}
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
							        labelString: 'nb annonces'
							      }
							     }],

			                    xAxes: [{
			                     scaleLabel: {
							        display: true,
							        labelString: 'INSEE_COM'
							      }
							     }]

			                },
			                
			                animation: {
			                        duration: 1500,
			                        easing: 'easeOutQuad'
			                },
			             /*    tooltips: {
			                    mode: 'label'
			                },*/
			                legend: {
			                    onHover: function(e) {
			                        if (e) {
			                      		e.target.style.cursor = 'pointer';
			                     	}
/*			                     	else {
			                     		this_chart.update()
			                     	}*/
			                      }
			                }

				        }
				      });

		//alimenter avec les labels ET LES DATASETS
		inject_metadata(barChart, params_barChart)

		return barChart 				
	}


}




function barChart_add_options_hover(this_chart) {
		
		this_chart.config.options.hover = {
                onHover: function(e) {
                     var point = this_chart.getElementAtEvent(e);
                     if (point.length) {
                        //transformer curseur en pointeur
                     	e.target.style.cursor = 'pointer'; 

                     	//effacer les bordures précédantes
                     	this_chart.update();

                        //si survol d'un segment, mettre bordure rouge sur élément survolé
                        activePoints = this_chart.getElementAtEvent(e);                        
                        if (activePoints[0]) {
                            //relever l'index de l'élément survolé                    
                            var idx = activePoints[0]['_index'];
							var datasetIdx = activePoints[0]['_datasetIndex'];

							activePoint_backgroundColor = activePoints[0]._model.backgroundColor;
							activePoints[0]._model.borderColor = "rgba(230, 11, 11, 1)";
							datasetLabel = activePoints[0]._model.datasetLabel;
							label = activePoints[0]._model.label;

							//test désactivation couleurs segments non selectionnés

							var nb_categories = this_chart.config.data.datasets.length
/*							for (i = 0; i < (nb_categories); i++) {
								this_chart.config.data.datasets[i].backgroundColor = "rgba(240, 240, 240,0.5)"
							}
							this_chart.update()
*/
							//réactiver couleur segment actuel
/*							activePoints[0]._model.backgroundColor = activePoint_backgroundColor*/
							
/*							console.log('idx: ' + idx); console.log('datasetIdx: ' + datasetIdx); console.log('datasetLabel: ' + datasetLabel);
							console.log('label: ' + label)*/
/*							this_chart.config.data.datasets[datasetIdx].borderColor[idx] = 'rgba(230, 11, 11, 1)'
							this_chart.update()*/
/*							this_chart.config.data.datasets[idx].borderWidth = 1
							activePoints[0]._model.borderColor = 'rgba(230, 11, 11, 1)'*/
 /*                           this_chart.data.datasets[0].borderColor[idx] = 'rgba(230, 11, 11, 1)'
                            this_chart.update();*/
                        }

                     }
                     else {
                     	e.target.style.cursor = 'default';

                     }
                }
	}
}


function barChart_addListeners(ctx, this_chart, params_barChart_deepCopy) {

            //gestion de la bordure en zone blanche
            ctx.addEventListener("mouseover", function(evt){
                var activePoints = this_chart.getElementAtEvent(evt);

  /*              if (activePoints[0]) {

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
                    maj_couleurs(this_chart, params_barChart_deepCopy)                	
                }        */

            });






            //collecter le segment cliqué
            ctx.addEventListener("click", function(evt){
                var activePoints = this_chart.getElementAtEvent(evt);

                if (activePoints[0]) {

                	try {
						var categorie = activePoints[0]._model.label;
						var sous_categorie = activePoints[0]._model.datasetLabel;
/*						var datasetLabel = activePoints[0]._model.datasetLabel;
						var label = activePoints[0]._model.label;*/

						/*list_segments_selected.push({"categorie": categorie, "sous_categorie": sous_categorie})*/

/*	                    var classe = this_chart.data.labels[activePoints[0]._index];
	                    var composant =  this_chart.data.datasets[0].label
	                    var value = this_chart.data.datasets[0].data[activePoints[0]._index];*/
	                    console.log("classe: " + categorie); console.log("composant: " + sous_categorie); /*console.log("valeur: " + value)*/
/*	                    console.log(datasetLabel)*/
	                }
	                catch {
	                	console.log("segment non detecté, clic à l'exterieur du graph")
	                }    
                }        

            });


            //gestion d'un clic unique sur un segment (pour désactiver les couleurs des segments non selectionnés)
            ctx.onclick = function(evt) {
            	
                var activePoints = this_chart.getElementAtEvent(evt);
                //si le clic est fait sur un des segments
                if (activePoints[0]) {
                	//1.remettre les couleurs d'origine sur tous les segments
	                maj_couleurs(this_chart, params_barChart_deepCopy)

                    var idx = activePoints[0]['_index'];
					var datasetIdx = activePoints[0]['_datasetIndex'];
					var key_composite = datasetIdx + "-" + idx

					var list_idx_segments_selected = params_barChart_deepCopy.list_idx_segments_selected
					var list_labels_segments_selected = params_barChart_deepCopy.list_labels_segments_selected
					var list_idx_segments_existants = params_barChart_deepCopy.list_idx_segments_existants
					list_idx_segments_selected = []; list_labels_segments_selected = [];
                    list_idx_segments_selected.push(key_composite);



					
					console.log("idx: " + idx); console.log("datasetIdx: " + datasetIdx); console.log("id dataset: + key_composite")
                    var chartData = activePoints[0]['_chart'].config.data;                

                    //parcourir toutes les barres pour les mettre en gris sauf celle cliquée
                    var nb_categories = this_chart.config.data.datasets.length

                    //ne s'applique qu'en cas de sélection unique (nb de segments = 0 ou 1)
                    if (list_idx_segments_selected.length < 2) {
    
                        for (i = 0; i < (nb_categories); i++) {
                            //si la categorie parcourue n'est pas la catégorie active
                            var nb_sous_categories = this_chart.config.data.datasets[i].data.length;

                            	for (a = 0; a < (nb_sous_categories); a++) {
                            		var lock_composite = a + "-" + i
                            		//si on entre dans un segment différent du segment actif, griser la couleur du segment
                            		if (key_composite !== lock_composite) {
	                            	//la couleur de fond se désactive ainsi pour le 1er segment: bar1.config.data.datasets[0].backgroundColor[0] = 'grey'
	                            		this_chart.config.data.datasets[a].backgroundColor[i] = "rgba(240, 240, 240,0.5)";
	                                /*this_chart.data.datasets[0].backgroundColor[i] = "rgba(240, 240, 240,0.5)";*/
	                            	}
									else {
										color = activePoints[0]._model.backgroundColor;
										color = color.replace("0.65", "1")
										activePoints[0]._model.backgroundColor = color;
									
									}

                            	}                            	



                        };
                        this_chart.update()                    
                    }

                }

                //remettre les couleurs d'origine lors d'un clic à l'extérieur des barres
                else {
                    //parcourir toutes les barres pour les remettre les couleurs d'origine
/*                    var nb_segments = this_chart.data.datasets[0].data.length
                    for (i = 0; i < (nb_segments); i++) {                
                        this_chart.data.datasets[0].backgroundColor[i] = chartJS_backgroundColor_deepCopy[i];
                        this_chart.update();
                    };*/

                    maj_couleurs(this_chart, params_barChart_deepCopy)
					//vider liste des segments selectionnés
					params_barChart_deepCopy.list_idx_segments_selected = [];
					params_barChart_deepCopy.list_labels_segments_selected= []

                }
            }





            //rés-activer les couleurs de tous les segments
            ctx.ondblclick = function(evt) {
                maj_couleurs(this_chart, params_barChart_deepCopy)

				//vider liste des segments selectionnés
				params_barChart_deepCopy.list_idx_segments_selected = [];
				params_barChart_deepCopy.list_labels_segments_selected= []


            };
            





      //gestion d'un clic + shift sur plusiers segments (pour désactiver les couleurs des segments non selectionnés)
      ctx.addEventListener("click",
        function(e) {
          if (e.shiftKey) {
                    console.log("Shift, yay!");
                	//1.remettre les couleurs d'origine sur tous les segments
	                maj_couleurs(this_chart, params_barChart_deepCopy)

                    var activePoints = this_chart.getElementAtEvent(e);
                    var idx = activePoints[0]['_index'];
					var datasetIdx = activePoints[0]['_datasetIndex'];
					var key_composite = datasetIdx+"-"+idx
					
					var categorie = activePoints[0]._model.label;
					var sous_categorie = activePoints[0]._model.datasetLabel;

					var list_idx_segments_selected = params_barChart_deepCopy.list_idx_segments_selected
					var list_labels_segments_selected = params_barChart_deepCopy.list_labels_segments_selected
					var list_idx_segments_existants = params_barChart_deepCopy.list_idx_segments_existants
                    list_idx_segments_selected.push(key_composite);
                    list_labels_segments_selected.push({"categorie": categorie, "sous_categorie": sous_categorie})
                    console.log(list_idx_segments_selected); console.log(list_labels_segments_selected)

                    var chartData = activePoints[0]['_chart'].config.data;
             

                    //parcourir toutes les barres pour les mettre en gris sauf celles cliquées
                    var nb_segments_existants = params_barChart_deepCopy.list_idx_segments_existants.length;
                    var nb_categories = this_chart.config.data.datasets.length;
					

                    //ne s'applique qu'en cas de sélection multiple
                    if (list_idx_segments_selected.length > 0) {
    
                        for (i = 0; i < (nb_segments_existants); i++) {
                            //si le segment n'appartient pas à la liste des segments selectionnés, le mettre en gris
                            var segment_a_traiter = list_idx_segments_existants[i];

                            //si le segment actuel a déjà été selectionné, ne pas le griser
                            if (list_idx_segments_selected.indexOf(segment_a_traiter) === -1) {
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

                }
        },false)
}
            

function inject_metadata(barChart, params_barChart) {
	//alimenter avec les labels
	if (barChart.config.data.labels.length === 0) {
		barChart.config.data.labels = [...params_barChart.data[0].labels[0]]
	}
	//alimenter avec les datasets
	var l = params_barChart.data[1].datasets.length;
	var datasets = [];
	for (var i = 0; i < l; i++) {
		datasets.push(params_barChart.data[1].datasets[i])
	}
	barChart.config.data.datasets = _.cloneDeep(datasets)
	

	barChart.update()

	//procedure manuelle pour remmetre les couleurs source
	/*bar1.config.data.datasets[2].backgroundColor = _.cloneDeep(params_bar1_deepCopy.data[1].datasets[2].backgroundColor)*/

	return barChart
}

function maj_couleurs(barChart, params_barChart) {
	//on entre dans cette func pour enlever le focus posé sur les segments

	var nb_categories = params_barChart.data[1].datasets.length;
	var backgroundColorArray = [];

	//parcours catégories
	for (var i = 0; i < nb_categories; i++) {		
		
		//parcours sous-catégories
		var nb_sous_categories = params_barChart.data[1].datasets[i].data.length;
		for (var a = 0; a < nb_sous_categories; a++) {
/*			backgroundColorArray.push(params_barChart.data[1].datasets[a].backgroundColor[i])*/
			var backgroundColor = params_barChart.data[1].datasets[a].backgroundColor[i];
			var borderColor = params_barChart.data[1].datasets[a].borderColor[i];
			barChart.config.data.datasets[a].backgroundColor[i] = backgroundColor;
			/*barChart.config.data.datasets[a].borderWidth[i] = 0;*/
		}

		/*barChart.config.data.datasets[i].backgroundColor = backgroundColorArray;*/
		barChart.update();



	}
	
	

	

	//procedure manuelle pour remmetre les couleurs source
	/*bar1.config.data.datasets[2].backgroundColor = _.cloneDeep(params_bar1_deepCopy.data[1].datasets[2].backgroundColor)*/

}