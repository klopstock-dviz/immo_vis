let vlSpec = 
{
  "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
  "description": "A simple bar chart with embedded data.",
 "data": {
  "url": "https://raw.githubusercontent.com/klopstock-dviz/immo_vis/master/data/df_annonces_gps_iris_ventes_75.csv", "format":{"type": "dsv", "delimiter": ";"}
},
        "transform": [
          {"filter": "datum.typedetransaction === 'v'"},
          {"aggregate": [{
              "op": "count",
              "field": "nb_log_en_vente",
              "as": "nb_log_en_vente"
              }],
              "groupby": ["DEP"]
    }
        ],
  "mark": {"type":"bar", "tooltip":true},
  "encoding": {
    "x": {"field": "DEP", "type": "ordinal", "axis": {"labelAngle": 0}},
    "y": {"field": "nb_log_en_vente", "type": "quantitative"}
  }
};



    var view_vlSpec, data, data_sortie_vega, data_sortie;
     function init_vlSpec() {
     	var d1 = new Date();
        var data_source = [];
   
   


/*        vlSpec_tick_prix_m2.data.values = data;*/
        
         var vgSpec = vegaLite.compile(vlSpec).spec;
         
         
         var runtime = vega.parse(vgSpec);
         view_vlSpec = new vega.View(runtime)
           .renderer('canvas')  // set renderer (canvas or svg)
           .initialize('#groupby_vl') // initialize view within parent DOM container
           .hover()             // enable hover encode set processing
           .run()              // run the dataflow and render the view
           

         
         let promise = new Promise(function(resolve, reject) {     
             setTimeout(() => resolve(view_vlSpec.runAsync()), 200);
           });

        data_sortie = [];


        view_vlSpec.addDataListener('source_0', function(name, value) {
            /*console.log(name, value)*/
            data_sortie_vega = (value);

          //convertir liste quartiers filtrés en liste exploitable
          //si selection vega appliquée, extraire les dates
          if (data_sortie_vega.length > 0) {            
            for (i in data_sortie_vega) {
              
              data_sortie.push(data_sortie_vega[i]);

              };
            console.log("tps exec vega: " + (new Date() - d1)/1000)

          }

          
        });
	
/*    function populate() {
    data_chartJS = [19042, 1041, 1413, 2260, 2581, 2847, 5802, 8723, 4411, 1319, 4082, 2473];
    labels_chartJS = ["33", "23", "19", "87", "86", "47", "64", "17", "40", "79", "24", "16"];}
    setTimeout(populate, 2000)*/
		console.log("tps exec vega: " + (new Date() - d1)/1000)
	};


     
     
     





