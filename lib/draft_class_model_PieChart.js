
sharedParams = new sharedParams()
//instancier nouveau graph 1
var params_pieChart1 = new param_customSpec_PieChartsJS()
params_pieChart1.type = "doughnut"
params_pieChart1.ctx = ctx_5
params_pieChart1.id = "pieChart1"
params_pieChart1.scope_field = "INSEE_COM" //used to filter large datasets to restricted data points to vizualise

params_pieChart1.category_field = "INSEE_COM"
params_pieChart1.numerical_field_params = {fieldName: 'prix_m2_vente', agg_type: 'mean'}
params_pieChart1.label_tooltip = "Prix m² moyen"
params_pieChart1.title[0].text = "title of the chart"


//préparer la var data à injecter dans le chart
var instantiateur_pieChart1 = new PieChart(params_pieChart1);
instantiateur_pieChart1.createChart(params_pieChart1)





pieChart1 = instantiateur_pieChart1.init_chart(params_pieChart1)
//var params_pieChart1_deepCopy = _.cloneDeep(params_pieChart1)
instantiateur_pieChart1.add_options_hover(pieChart1, params_pieChart1)
instantiateur_pieChart1.addListeners(params_pieChart1.ctx, pieChart1, params_pieChart1)

var observe_pieChart1 = new Observe_Charts_state();
observe_pieChart1.observe_chart_state(params_pieChart1, [params_barChart1 ,params_barChart2, params_barChart3, params_barChart4]);





/*var instantiateur_pieChart1 = new pieChart(params_pieChart1)
instantiateur_pieChart1.prepare_data(data_input1, params_pieChart1)
pieChart1 = instantiateur_pieChart1.init_chart(params_pieChart1)
pieChart_add_options_hover(pieChart1)
pieChart_addListeners(params_pieChart1.ctx, pieChart1)*/


//refresh avec new données
//V1
pieChart1.config.data = []
pieChart1.config.data = params_pieChart.data[0]
pieChart1.update()

//V2
params_pieChart1.data[0].datasets[0].data = [];
params_pieChart1.data[0].labels = []
/*pieChart1.config.data = []*/
instantiateur_pieChart1.prepare_data(data_input2, params_pieChart1)
pieChart1.update()

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
pieChart_add_options_hover(pieChart1)
pieChart1.update()


function pieChart_addListeners(ctx, this_chart) {
            //collecter le segment cliqué
            ctx.addEventListener("click", function(evt){
                var firstPoint = this_chart.getElementAtEvent(evt);

                if (firstPoint) {
                    var classe = this_chart.data.labels[firstPoint[0]._index];
                    var composant =  this_chart.data.datasets[0].label
                    var value = this_chart.data.datasets[0].data[firstPoint[0]._index];
                    console.log("classe: " + classe); console.log("composant: " + composant); console.log("valeur: " + value)
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

pieChart_addListeners(ctx_2, pieChart1)
pieChart1.update()