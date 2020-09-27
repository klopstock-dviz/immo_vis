data_input = [ {"DEP": "43", "nb_log_en_vente": 29889}, {"DEP": "33", "nb_log_en_vente": 19889}, {"DEP": "23", "nb_log_en_vente": 39889}];
/*let chartJS_backgroundColor = [
    'rgba(255, 99, 132, 0.65)',
    'rgba(54, 162, 235, 0.65)',
    'rgba(255, 206, 86, 0.65)',
    'rgba(75, 192, 192, 0.65)',
    'rgba(153, 102, 255, 0.65)',
    'rgba(255, 159, 64, 0.65)',
    'rgba(246, 252, 50, 0.65)',
    'rgba(202, 252, 50, 0.65)',
    'rgba(97, 252, 50, 0.65)',
    'rgba(50, 252, 188, 0.65)',
    'rgba(54, 231, 255, 0.65)',
    'rgba(54, 108, 255, 0.65)',
    'rgba(67, 27, 209, 0.65)',
    'rgba(223, 43, 255, 0.65)',
    'rgba(255, 48, 69, 0.65)',
    'rgba(225, 125, 132, 0.65)',
    'rgba(25, 200, 235, 0.65)',
    'rgba(225, 175, 86, 0.65)',
    'rgba(100, 175, 192, 0.65)',
    'rgba(175, 125, 255, 0.65)',
    'rgba(225, 150, 64, 0.65)',
    'rgba(225, 225, 50, 0.65)',            
    'rgba(125, 225, 50, 0.65)',
    'rgba(75, 225, 188, 0.65)',
    'rgba(75, 200, 225, 0.65)',
    'rgba(75, 125, 255, 0.65)',
    'rgba(200, 200, 100, 0.65)',
    'rgba(100, 50, 209, 0.65)',
    'rgba(200, 75, 200, 0.65)',
    'rgba(225, 75, 100, 0.65)'
];*/

class pieChart {

	constructor(params_pieChart) {
		/*this.data = params.data2[0] -> en échec à cause de la ligne proto*/
		this.ctx = params_pieChart.ctx
		this.type = params_pieChart.type

	}

	prepare_data(data_input, params_pieChart) {
			var taille = data_input.length
	        for (var i = 0; i < taille; i++) {
	            params_pieChart.data[0].datasets[0].data.push(data_input[i]["nb_log_en_vente"])
	            params_pieChart.data[0].labels.push(data_input[i]["DEP"])
	        };			
	}


	init_chart(params_pieChart) {
		return new Chart(this.ctx, {
			    type: this.type,
			    data: params_pieChart.data[0],
	            options: {
	                responsive: true,                    
                    animation: {
                            duration: 1500,
                            easing: 'easeOutQuad'
                    },
                     tooltips: {
                        mode: 'label'
                    },
                    legend: {
                          onHover: function(e) {
                             e.target.style.cursor = 'pointer';
                          }
                    }
	            }

				
		})
	}
};



//enrichir le chrt par fonctions
function pieChart_add_options_hover(this_chart) {
		
		this_chart.config.options.hover = {
                      onHover: function(e) {
                       var point = this_chart.getElementAtEvent(e);
                       if (point.length) {
                          //transformer curseur en pointeur
                        e.target.style.cursor = 'pointer'; 

                          //mettre bordure rouge sur élément survolé
                          activePoints = this_chart.getElementAtEvent(e);                        
                          if (activePoints[0]) {
                              //relever l'index de l'élément survolé                    
                              var idx = activePoints[0]['_index'];
  /*                            this.data.datasets[0].borderColor[idx] = 'rgba(230, 11, 11, 1)'
                              this.update();*/
                          }
                       }
                       else {
                        e.target.style.cursor = 'default';
                          //parcourir toutes les barres pour annuler la bordure
                          /*var nb_segments = this.data.datasets[0].data.length*/
  /*                        for (i = 0; i < (nb_segments); i++) {                
                              this.data.datasets[0].borderColor[i] = 'rgba(230, 11, 11, 0)'
                              this.update();
                          }                        */

                      }
                    }
                 }
	}


function pieChart_addListeners(ctx, this_chart) {
            //collecter le segment cliqué
            ctx.addEventListener("click", function(evt){
                var firstPoint = this_chart.getElementAtEvent(evt);

                if (firstPoint) {
                	try {
	                    var classe = this_chart.data.labels[firstPoint[0]._index];
	                    var composant =  this_chart.data.datasets[0].label
	                    var value = this_chart.data.datasets[0].data[firstPoint[0]._index];
	                    console.log("classe: " + classe); console.log("composant: " + composant); console.log("valeur: " + value)
	                }
	                catch {
	                	console.log("segment non detecté, clic à l'exterieur du graph")
	                }    
                }        

            });


            //gestion d'un clic unique sur un segment (pour désactiver les couleurs des segments non selectionnés)
            ctx.onclick = function(evt) {
                var activePoints = this_chart.getElementAtEvent(evt);
                if (activePoints[0]) {
                    var chartData = activePoints[0]['_chart'].config.data;
                    var idx = activePoints[0]['_index'];

                    //parcourir toutes les barres pour les mettre en gris sauf celle cliquée
                    var nb_segments = this_chart.data.datasets[0].data.length
                    //ne s'applique qu'en cas de sélection unique
                    if (list_segments_selected.length === 0) {
    
                        for (i = 0; i < (nb_segments); i++) {
                            if (i !== idx) {                    
                                this_chart.data.datasets[0].backgroundColor[i] = "rgba(240, 240, 240,0.5)";
                                this_chart.update();
                            }
                            else {
                                color = chartJS_backgroundColor_deepCopy[i];
                                color = color.replace("0.65", "0.9")
                                this_chart.data.datasets[0].backgroundColor[i] = color;
                                this_chart.update();
                            }
                        }
                    }
                }
                //remettre les couleurs d'origine lors d'un clic à l'extérieur des barres
                else {
                    //parcourir toutes les barres pour les remettre les couleurs d'origine
                    var nb_segments = this_chart.data.datasets[0].data.length
                    for (i = 0; i < (nb_segments); i++) {                
                        this_chart.data.datasets[0].backgroundColor[i] = chartJS_backgroundColor_deepCopy[i];
                        this_chart.update();
                    };
                    //vider liste des segments selectionnés
                    list_segments_selected = [];
                }
            }

            //rés-activer les couleurs de tous les segments
            ctx.ondblclick = function(evt) {
                var activePoints = this_chart.getElementAtEvent(evt);
                
                //parcourir toutes les barres pour les remettre les couleurs d'origine
                var nb_segments = this_chart.data.datasets[0].data.length
                for (i = 0; i < (nb_segments); i++) {                
                    this_chart.data.datasets[0].backgroundColor[i] = chartJS_backgroundColor_deepCopy[i];
                    this_chart.update();
                };
                //vider liste des segments selectionnés
                list_segments_selected = [];                
            };

      //gestion d'un clic + shift sur plusiers segments (pour désactiver les couleurs des segments non selectionnés)
      ctx.addEventListener("click",
        function(e) {
          if (e.shiftKey) {
                    console.log("Shift, yay!");
                    var activePoints = this_chart.getElementAtEvent(e);
                    var idx = activePoints[0]['_index'];
                    list_segments_selected.push(idx);
                    console.log(list_segments_selected)

                    var chartData = activePoints[0]['_chart'].config.data;

                    //parcourir toutes les barres pour les mettre en gris sauf celles cliquées
                    var nb_segments = this_chart.data.datasets[0].data.length
                    //ne s'applique qu'en cas de sélection multiple
                    if (list_segments_selected.length > 0) {
    
                        for (i = 0; i < (nb_segments); i++) {
                            //si le segment n'appartient pas à la liste des segments selectionnés, le mettre en gris
                            if (list_segments_selected.indexOf(i) === -1) {  
                                this_chart.data.datasets[0].backgroundColor[i] = "rgba(240, 240, 240,0.5)";
                                this_chart.update();
                            }
                            //si le segment appartient à la liste des segments selectionnés, augmenter son opacité
                            else {
                                color = chartJS_backgroundColor_deepCopy[i];
                                color = color.replace("0.65", "0.9")
                                this_chart.data.datasets[0].backgroundColor[i] = color;
                                this_chart.update();
                            }
                        }
                    }

                }
        },
        false);            
}