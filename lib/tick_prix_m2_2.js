let vlSpec_tick_prix_m2 = 
{
  "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": 15,
  "height": 250,
  "padding": 0,
  "data": {"values": [{"a": 1},{"a": 2},{"a": 3},{"a": 4},{"a": 5},
                      {"a": 6},{"a": 7},{"a": 8},{"a": 9},{"a": 10}]},
  "datasets": {"source":"data"},
  "selection": {
    "brush_prix_m2": {"type": "interval", "encodings": ["y"]}
  },
  "mark": {"type":"rule", "cursor": "n-resize"},
  "encoding": {
 
    "y": {"field": "Prix_m_2", "type": "quantitative", "title": "Dispersion des prix au m²", "sort": "ascending"},
    "size": {"value": 1.5},
    "color": {"field": "nb_pieces", "type": "nominal", "legend": null}
  }
};


    var view_tick_prix_m2, data=[];
     let init_vlSpec_tick_prix_m2 = function() {
        var data = []
        brush_prix_m2=[]

        //associer un champ aux valeurs
        for (v in list_prix_m2) {
            data.push({"Prix_m_2": list_prix_m2[v]})
        }


        vlSpec_tick_prix_m2.data.values = data;
        color_map = "blues"
        /*vlSpec_tick_prix_m2.encoding.color.scale.scheme = color_map;*/

         var vgSpec = vegaLite.compile(vlSpec_tick_prix_m2).spec;

         var tooltipOptions = {
         theme: 'light'
         };
         
         var handler = new vegaTooltip.Handler(tooltipOptions);
         var runtime = vega.parse(vgSpec);
         view_tick_prix_m2 = new vega.View(runtime)
           .renderer('canvas')  // set renderer (canvas or svg)
           .tooltip(handler.call)  // note that you have to use `handler.call`!
           .initialize('#tick_prix_m2') // initialize view within parent DOM container
           .hover()             // enable hover encode set processing
           .run()              // run the dataflow and render the view
           

         
         let promise = new Promise(function(resolve, reject) {     
             setTimeout(() => resolve(view_legend_map1.runAsync()), 200);
           });

        let brush_prix_vega = [];    
        view_tick_prix_m2.addDataListener('brush_prix_m2_store', function(name, value) {
            /*console.log(name, value)*/
            brush_prix_vega = (name, value);

          //convertir liste quartiers filtrés en liste exploitable
    
          //si selection vega appliquée, extraire les dates
          if (brush_prix_vega.length > 0) {
            brush_prix_m2 = [];
            for (i in brush_prix_vega) {
              
              brush_prix_m2.push(brush_prix_vega[i]["values"][0]);

              };
            brush_prix_m2 = brush_prix_m2[0]
          }
          //sinon mettre par défaut des valeur extrêmes
          else if (brush_prix_vega.length === 0) {
            brush_prix_m2 = [0, 100000]
          }

          //tri tableau
          brush_prix_m2 = brush_prix_m2.sort(function(a, b){return a-b});


          //maj data à projeter
          //si context sur ville, filtrer les annonces à l'échelle ville avec les prix m2 ci dessus
          if (clic_ville.length > 0 && clic_quartier.length === 0) {
            filtre_ref_ville_gps_by_Vega("no_reloadVille");
            gestionLayer('ville-tick_prix_m2');
          }
          //si context sur quartier, filtrer les annonces à l'échelle ville avec les prix m2 ci dessus
          if (clic_ville.length > 0 && clic_quartier.length > 0) {
            filtre_ref_ville_quartier_gps_by_Vega("tick_prix_m2");
            gestionLayer('quartier-tick_prix_m2');
          }
          //maj map
          setTimeout(gestionLayer, 600);

          //adapter la taille des cercles au zoom
          zoom = mymap1.getZoom();
          adapt_tailleCercles(); 

          
        });

     };

     
     
     


