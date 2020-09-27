
    let vlSpec_quartiers = {
        "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
        
        "data": {
          "values": [
            {a: 'A', b: 28},
          ]
        },
        "columns": 1,
        "concat":
        [

        { //Nb annonces total et sur la carte
        "columns": 4,
        "spacing": 60,
        "concat":
          [
            { //Nb annonces total
                "height": 30,
                "width": 40,
                
                "mark": {"type":"text", "fontWeight": "bold", "color": "black", "fontSize": 13},
                "title": "Nb d'annonces de la ville",

                "encoding": {
                  "text": {"aggregate": "count", "field": "surface", "type": "quantitative"}
                }
            },

            { //Nb d'annonces de la sélection
                "height": 30,
                "width": 40,
                
                "mark": {"type":"text", "stroke": "red"},
                "title": "Nb d'annonces de la sélection",

               "transform": [
                  
                  {"filter":{"selection": "brush_quartier"}},
                  {"filter":{"selection": "clic_quartier"}},
                  {"filter":{"selection": "clic_nb_pieces_quartier"}},
                  {"filter":{"selection": "clic_dpeL_quartier"}}
                ],

                "encoding": {
                  "text": {"aggregate": "count", "field": "surface", "type": "quantitative"}
                }
            },

            { //Prix m² median ville
                /*"height": 30,*/
                "width": 200,
                
                "mark": {"type":"text", "fontWeight": "bold", "color": "black", "fontSize": 12},
                "title": {"text": "Prix au m² median de la ville", "fontSize": 12},

                "encoding": {
                  "text": {"aggregate": "median","field": "prix_m²", "type":   "quantitative"}
                }
            },

            { //Prix m² median sélection
                /*"height": 30,*/
                "width": 200,
                
                "mark": {"type":"text", "fontWeight": "bold", "color": "#ed8a09", "fontSize": 12},
                "title": {"text": "Prix au m² median de la sélection", "fontSize": 12},

               "transform": [
                     
                  {"filter":{"selection": "brush_quartier"}},
                  {"filter":{"selection": "clic_quartier"}},
                  {"filter":{"selection": "clic_nb_pieces_quartier"}},
                  {"filter":{"selection": "clic_dpeL_quartier"}}
                ],

                "encoding": {
                  "text": {"aggregate": "median","field": "prix_m²", "type":   "quantitative"}
                }
            }
          ]
        },


        { //Prix m² median selon quartier et scater prix m²/surface
        "columns": 3,
        "concat":
          [
            { //Nb d'annonces selon quartier

              "height": 350,
              "width": 200,
              "selection": {
              "clic_quartier": {"fields": ["nomQuartier"], "on": "click", "type": "multi"}, 
              "highlight": {"type": "single", "empty": "none", "on": "mouseover"}
              },
              "transform": [
                {"filter": "datum.nomQuartier !== \"\""},
                {"filter":{"selection": "brush_quartier"}},
                {"filter":{"selection": "clic_nb_pieces_quartier"}},
                {"filter":{"selection": "clic_dpeL_quartier"}}
              ],
              
              "mark": {"type":"bar", "stroke": "red", "cursor": "pointer", "tooltip": true},
              "title": "Prix au m² median selon quartier",

              "encoding": {
                "x": {"aggregate": "median",
                "field": "prix_m²", "type":   "quantitative", "title": "Prix m² median"}, 
                "y": {"field": "nomQuartier", "type": "ordinal", "axis": {"labelLimit": 120, "title": "Quartier"}},
                // "tooltip": [
                //   {"field": "Prix m² median", "type": "quantitative"},
                //   {"field": "Quartier", "type": "ordinal"}
                // ],
                
                "color":{
                    "condition":{"selection": "clic_quartier",
                    "field": "nomQuartier",
                    "title": "Quartier",
                    "type":"nominal",
                    "legend": null},
                    "value": "#eeedef"
                  },
                "fillOpacity": {
                  "condition":  {"selection": "highlight", "value": 1},
                  "value": 0.85
                },
                "strokeWidth": {
                  "condition":  [{"selection": "highlight", "value": 1}],
                  "value": 0
                }
              }
            },
            { //Prix au m² selon quartier et surface

                "title": "Prix au m² selon quartier et surface",
                "mark": {"type":"circle", "tooltip":true, "cursor": "crosshair"},
                
                
                "transform": [
                  {"filter":{"selection": "clic_quartier"}},
                  {"filter":{"selection": "clic_nb_pieces_quartier"}},
                  {"filter":{"selection": "clic_dpeL_quartier"}}
                ],
                "height": 350,
                "width": 400,
                "selection": {
                  "brush_quartier": {"type": "interval"}
                 
                },

                "encoding": {
                  "x": {
                  "field": "surface", "type":   "quantitative", "title": "Surface"}, 
                  "y": {"field": "prix_m²", "type": "quantitative", "axis": {"labelLimit": 120}, "title": "Prix m² du logement"},
                  
                  "color":{
                      "condition":{"selection": "brush_quartier",
                      "field": "nomQuartier",
                      "title": "Quartier",
                      "type":"nominal",
                      "legend": null},
                      "value": "#eeedef"
                    },
                  "size": {"field": "nb_pieces", "type": "quantitative","legend": null, "title": "Nb de pièces du logement"},
                    
                  }
            },


            { ////Répartition selon la taille des logements & DPE
            "columns": 1,
            "concat":
              [

                  {  //Répartition selon la taille des logements
                    "height": 120,
                    "width": 100,
                    "selection": {
                      "clic_nb_pieces_quartier": {"fields": ["nb_pieces"], "on": "click", "type": "multi"}, 
                      "highlight_nb_pieces": {"type": "single", "empty": "none", "on": "mouseover"}
                    },
                    
                    "mark": {"type":"bar", "tooltip":true,  "stroke": "red", "cursor": "pointer"},
                    "title": "Nb d'annonces selon la taille des logements",

                   "transform": [
                      {"filter":{"selection": "brush_quartier"}},
                      {"filter":{"selection": "clic_quartier"}},
                      {"filter":{"selection": "clic_dpeL_quartier"}}
                    ],

                    "encoding": {
                      "x": {"field": "nb_pieces", "type": "ordinal", "title": "Nb de pièces"}, 
                      "y": {"aggregate": "count", "field": "prix_m2", "type":   "quantitative", "title": "Nb d'annonces"},
                      
                      "color":{
                          "condition":{"selection": "clic_nb_pieces_quartier",
                          "field": "nb_pieces",
                          "type":"nominal",
                          "legend": null, "title": "Nb de pièces"},
                          "value": "#eeedef"
                        },
                      "fillOpacity": {
                        "condition":  {"selection": "highlight_nb_pieces", "value": 1},
                        "value": 0.85
                      },
                      "strokeWidth": {
                        "condition":  [{"selection": "highlight_nb_pieces", "value": 1}],
                        "value": 0
                      }
                    }
                },

                {    //Répartition selon le DPE
                    "height": 120,
                    "width": 100,
                    "selection": {
                      "clic_dpeL_quartier": {"fields": ["dpeL"], "on": "click", "type": "multi"}, 
                      "highlight_dpeL": {"type": "single", "empty": "none", "on": "mouseover"}
                    },
                    
                    "mark": {"type":"bar", "tooltip":true,  "stroke": "red", "cursor": "pointer"},
                    "title": "Nb d'annonces selon le DPE",

                   "transform": [
                    {"filter": "datum.dpeL !== \"0\""},
                      {"filter":{"selection": "brush_quartier"}},
                      {"filter":{"selection": "clic_quartier"}},
                      {"filter":{"selection": "clic_nb_pieces_quartier"}}
                    ],

                    "encoding": {
                      "x": {"field": "dpeL", "type": "ordinal", "title": "DPE"}, 
                      "y": {"aggregate": "count", "field": "prix_m2", "type":   "quantitative", "title": "Nb d'annonces"},
                      
                      "color":{
                          "condition":{"selection": "clic_dpeL_quartier",
                            "field": "dpeL",
                            "title": "DPE",
                            "type":"nominal",
                            "legend": null,
                          "scale": {"domain":["A", "B", "C", "D", "E", "F", "G"], "range": ["#51ba06", "#6df20f", "#aaff6e", "yellow", "#ffbe3b", "orange", "red"]}
                      },
                          "value": "#eeedef"
                        },
                      "fillOpacity": {
                        "condition":  {"selection": "highlight_dpeL", "value": 1},
                        "value": 0.85
                      },
                      "strokeWidth": {
                        "condition":  [{"selection": "highlight_dpeL", "value": 1}],
                        "value": 0
                      }
                    }
                }

              ],
            "resolve": {"scale": {"color": "independent"}}
            }

          ],
        "resolve": {"scale": {"color": "independent"}}
      }



        
      ],
      "resolve": {"scale": {"color": "independent"}}
};
    let originSignal = "";
    var view_quartiers;
     let init_VegaSpec_quartiers = function() {
      
        vlSpec_quartiers.data.values = df_global_filtre_ville;

         var vgSpec = vegaLite.compile(vlSpec_quartiers).spec;

         var tooltipOptions = {
         theme: 'light'
         };
         
         var handler = new vegaTooltip.Handler(tooltipOptions);
         var runtime = vega.parse(vgSpec);
         view_quartiers = new vega.View(runtime)
           .renderer('canvas')  // set renderer (canvas or svg)
           .tooltip(handler.call)  // note that you have to use `handler.call`!
           .initialize('#bar_quartiers') // initialize view within parent DOM container
           .hover()             // enable hover encode set processing
           .run()              // run the dataflow and render the view
           

         
         let promise = new Promise(function(resolve, reject) {     
             setTimeout(() => resolve(view_quartiers.runAsync()), 200);
           });



        




        let clic_quartier_vega = [];    
        view_quartiers.addDataListener('clic_quartier_store', function(name, value) {
            /*console.log(name, value)*/
            clic_quartier_vega = (name, value);

          //convertir liste quartiers filtrés en liste exploitable
          clic_quartier = [];
          for (i in clic_quartier_vega) {
            
            clic_quartier.push(clic_quartier_vega[i]["values"][0]);

            };

          originSignal = 'clic_quartier', actionSelection = "";
          if (clic_quartier.length === 0) {actionSelection = 'exit-selection'}
          else if (clic_quartier.length > 0) {actionSelection = 'apply-selection'}
          propagerSelections(originSignal, actionSelection)

        });



        let clic_nb_pieces_quartier_vega = [];    
        view_quartiers.addDataListener('clic_nb_pieces_quartier_store', function(name, value) {
            /*console.log(name, value)*/
            clic_nb_pieces_quartier_vega = (name, value);

          //convertir liste quartiers filtrés en liste exploitable
          clic_nb_pieces_quartier = [];
          for (i in clic_nb_pieces_quartier_vega) {
            
            clic_nb_pieces_quartier.push(clic_nb_pieces_quartier_vega[i]["values"][0]);

            };

          originSignal = 'clic_nb_pieces_quartier', actionSelection = "";
          if (clic_nb_pieces_quartier.length === 0) {
            actionSelection = 'exit-selection';
            clic_nb_pieces_quartier = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
          }
          else if (clic_nb_pieces_quartier.length > 0) {actionSelection = 'apply-selection'}
          propagerSelections(originSignal, actionSelection)

        });




        let clic_dpe_quartier_vega = [];    
        view_quartiers.addDataListener('clic_dpeL_quartier_store', function(name, value) {
            /*console.log(name, value)*/
            clic_dpe_quartier_vega = (name, value);

          //convertir liste quartiers filtrés en liste exploitable
          clic_dpe_quartier = [];
          for (i in clic_dpe_quartier_vega) {
            
            clic_dpe_quartier.push(clic_dpe_quartier_vega[i]["values"][0]);

            };

          originSignal = 'clic_dpe_quartier', actionSelection = "";
          if (clic_dpe_quartier.length === 0) {
            actionSelection = 'exit-selection';
            clic_dpe_quartier = ["A", "B", "C", "D", "E", "F", "G", "0"];
          }
          else if (clic_dpe_quartier.length > 0) {actionSelection = 'apply-selection'}
          propagerSelections(originSignal, actionSelection)

        });




        let brush_quartiers_vega = [];    
        view_quartiers.addDataListener('brush_quartier_store', function(name, value) {
              brush_quartiers_vega = (value);

              //convertir liste quartiers filtrés en liste exploitable
              brush_quartiers_surface = [], brush_quartiers_prixM2 = [];
              for (i in brush_quartiers_vega) {
                
                brush_quartiers_surface.push(brush_quartiers_vega[i]["values"][0]);
                brush_quartiers_prixM2.push(brush_quartiers_vega[i]["values"][1]);

              };
              //si selection vide, peupler avec données par défaut pour éviter un filtrage null
              let actionSelection = "";
              if (brush_quartiers_surface.length === 0) {
                actionSelection = 'exit-selection'
                brush_quartiers_surface = [0, 100000];
                brush_quartiers_prixM2 = [0, 100000];
              }
              //si selection pleine, trier les tableaux
              else {
                actionSelection = 'apply-selection'
                brush_quartiers_surface = brush_quartiers_surface[0].sort(function(a, b){return a-b});
                brush_quartiers_prixM2 = brush_quartiers_prixM2[0].sort(function(a, b){return a-b});
              }

              //ne déclencher la propagation que si le signal précédent est 
              /*if (originSignal !== "clic_nb_pieces_quartier" && originSignal !== "clic_dpe_quartier") {*/
                originSignal = 'brush_quartiers';
                propagerSelections(originSignal, actionSelection);
              /*};*/

        });

     };

function propagerSelections(originSignal, actionSelection) {
    //1.1.origin signal = clic_quartier et action dé-selection des quartiers (retour au context ville)
    if (originSignal === "clic_quartier" && actionSelection === 'exit-selection') {          
      
      //1.recalcul des annonces à projeter
      filtre_ref_ville_gps_by_Vega("reloadVille");
      
      //2.centrer la map
      mymap1.flyToBounds(list_lat_lng);

      init_vlSpec_tick_prix_m2();
      gestionLayer('ville');
      //maj heatmap
      heatmap1.flyToBounds(list_lat_lng_filtred);


      setTimeout(gestionChangeHeatmap, 20);            

      //re-init selection
      clic_quartier = [];
      originSignal = "";
    }

    //1.2.origin signal = clic_quartier et action selection d'un quartier
    else if (originSignal === "clic_quartier" && actionSelection === 'apply-selection') {          
      //recalcul des annonces à projeter
      filtre_ref_ville_quartier_gps_by_Vega();
        
      init_vlSpec_tick_prix_m2();
      //recentrage de la carte sur le quartier
      gestionLayer('quartier');  
      
      //maj heatmap            
      heatmap1.flyToBounds(list_lat_lng_filtred);
      setTimeout(gestionChangeHeatmap, 20);
      originSignal = "";
    }
      
    //2.1.origin signal = brush_quartiers, sans clic_quartier et action selection appliquée
    else if (originSignal === "brush_quartiers" && clic_quartier.length === 0 && actionSelection === 'apply-selection') {          
    //recalcul des annonces à projeter
      //si aucun quartier sélectionné, prendre tous les quartiers par défaut
      if (clic_quartier.length === 0) {
        clic_quartier = groupby(villes_a_projeter, "nomQuartier"); clic_quartier = clic_quartier.filter((e)=> e !=="");
      }
      /*filtre_ref_ville_quartier_gps_by_Vega();*/
      filtre_ref_ville_gps_by_Vega("noreloadVille")
        
      init_vlSpec_tick_prix_m2();
      //recentrage de la carte sur le quartier
      gestionLayer('ville');  
      
      
      //maj heatmap            
      /*heatmap1.flyToBounds(list_lat_lng_filtred);*/
      setTimeout(gestionChangeHeatmap, 20);

      //re-init selection
      clic_quartier = [];
      originSignal = "";
    }

    //2.2.origin signal = brush_quartiers, sans clic_quartier et action exit-selection(retour au context ville)
    else if (originSignal === "brush_quartiers" && clic_quartier.length === 0 && actionSelection === 'exit-selection') {          
      
      //1.recalcul des annonces à projeter
      filtre_ref_ville_gps_by_Vega("reloadVille");
      
      //2.centrer la map
      mymap1.flyToBounds(list_lat_lng);

      init_vlSpec_tick_prix_m2();
      gestionLayer('ville');
      //maj heatmap
      /*heatmap1.flyToBounds(list_lat_lng_filtred);*/
      setTimeout(gestionChangeHeatmap, 20);      

      //re-init selections
      brush_quartiers_surface = [];
      brush_quartiers_prixM2 = [];
      originSignal = "";
    }      

    //2.3.origin signal = brush_quartiers, avec clic_quartier et action apply-selection(sur context quartier)
    else if (originSignal === "brush_quartiers" && clic_quartier.length > 0 && actionSelection === 'apply-selection') {          
      
      //1.recalcul des annonces à projeter
      filtre_ref_ville_quartier_gps_by_Vega();
      
      //2.centrer la map
      /*mymap1.flyToBounds(list_lat_lng);*/

      init_vlSpec_tick_prix_m2();
      gestionLayer('ville');
      //maj heatmap
      /*heatmap1.flyToBounds(list_lat_lng_filtred);*/
      setTimeout(gestionChangeHeatmap, 20);      

      //re-init selections
      brush_quartiers_surface = [];
      brush_quartiers_prixM2 = [];
      originSignal = "";
    }      

    //2.4.origin signal = brush_quartiers, avec clic_quartier et action exit-selection(retour au context quartier)
    else if (originSignal === "brush_quartiers" && clic_quartier.length > 0 && actionSelection === 'exit-selection') {          
      
      //recalcul des annonces à projeter
      filtre_ref_ville_quartier_gps_by_Vega();
        
      init_vlSpec_tick_prix_m2();
      //recentrage de la carte sur le quartier
      gestionLayer('quartier');  
      
      //maj heatmap            
      /*heatmap1.flyToBounds(list_lat_lng_filtred);*/
      setTimeout(gestionChangeHeatmap, 20);
      //re-init selections
      brush_quartiers_surface = [];
      brush_quartiers_prixM2 = [];
      originSignal = "";
    }

        //3.1.origin signal = clic_nb_pieces_quartier OU clic_dpe_quartier, sans clic_quartier et action selection appliquée
    else if ((originSignal === "clic_dpe_quartier" || originSignal === "clic_nb_pieces_quartier") 
        && clic_quartier.length === 0 && actionSelection === 'apply-selection') {          
    //recalcul des annonces à projeter
      //si aucun quartier sélectionné, prendre tous les quartiers par défaut
      if (clic_quartier.length === 0) {
        clic_quartier = groupby(villes_a_projeter, "nomQuartier"); clic_quartier = clic_quartier.filter((e)=> e !=="");
      }
      filtre_ref_ville_quartier_gps_by_Vega();
        
      init_vlSpec_tick_prix_m2();
      //recentrage de la carte sur le quartier
      gestionLayer('ville');  
      
      
      //maj heatmap            
      /*heatmap1.flyToBounds(list_lat_lng_filtred);*/
      setTimeout(gestionChangeHeatmap, 20);

      
    }

    //3.2.origin signal = clic_nb_pieces_quartier OU clic_dpe_quartier, sans clic_quartier et action exit-selection(retour au context ville)
    else if ((originSignal === "clic_dpe_quartier"  || originSignal === "clic_nb_pieces_quartier")
         && clic_quartier.length === 0 && actionSelection === 'exit-selection') {          
      
      //1.recalcul des annonces à projeter
      filtre_ref_ville_gps_by_Vega("reloadVille");
      
      //3.centrer la map
      /*mymap1.flyToBounds(list_lat_lng);*/

      init_vlSpec_tick_prix_m2();
      gestionLayer('ville');
      //maj heatmap
      /*heatmap1.flyToBounds(list_lat_lng_filtred);*/
      setTimeout(gestionChangeHeatmap, 20);      

      //re-init selections
      brush_quartiers_surface = [];
      brush_quartiers_prixM2 = [];
      
    }      

    //3.3.origin signal = clic_nb_pieces_quartier OU clic_dpe_quartier, avec clic_quartier et action apply-selection(sur context quartier)
    else if ((originSignal === "clic_dpe_quartier"  || originSignal === "clic_nb_pieces_quartier") 
          && clic_quartier.length > 0 && actionSelection === 'apply-selection') {          
      
      //1.recalcul des annonces à projeter
      filtre_ref_ville_quartier_gps_by_Vega();
      
      //3.centrer la map
      /*mymap1.flyToBounds(list_lat_lng);*/

      init_vlSpec_tick_prix_m2();
      gestionLayer('ville');
      //maj heatmap
      /*heatmap1.flyToBounds(list_lat_lng_filtred);*/
      setTimeout(gestionChangeHeatmap, 20);      

      //re-init selections
      brush_quartiers_surface = [];
      brush_quartiers_prixM2 = [];
      
    }      

    //3.4.origin signal = clic_nb_pieces_quartier OU clic_dpe_quartier, avec clic_quartier et action exit-selection(retour au context quartier)
    else if ((originSignal === "clic_dpe_quartier" || originSignal === "clic_nb_pieces_quartier") 
            && clic_quartier.length > 0 && actionSelection === 'exit-selection') {          
      

      //recalcul des annonces à projeter
      filtre_ref_ville_quartier_gps_by_Vega();
        
      init_vlSpec_tick_prix_m2();
      //recentrage de la carte sur le quartier
      gestionLayer('quartier');  
      
      //maj heatmap            
      /*heatmap1.flyToBounds(list_lat_lng_filtred);*/
      setTimeout(gestionChangeHeatmap, 20);
      //re-init selections
      brush_quartiers_surface = [];
      brush_quartiers_prixM2 = [];

    }      
      

    function gestionChangeHeatmap() {
        //si block heatmap affiché, charger la heatmap ET la nouvelle légende
      if (div_heatmap.style.display === 'block') {
        changeHeatmap()
        colorScheme = "redyellowgreen";
        init_vlSpec_legend_map_1();
      }
      //sinon, charger uniquement la heatmap en arrière plan
      else {
        changeHeatmap();
      }
    };
  };

	let refreshVegaSpec_quartiers = function() {

		//code changeset
		let changeset = view_quartiers.changeset().insert(df_global_filtre_ville.slice()).remove(vega.truthy)

		//"source_0" est le nom de la table de données vega à cibler 
		view_quartiers.change("source_0", changeset).runAsync()


  }
     
     
     
