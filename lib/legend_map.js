
let vlSpec_legend_map_1 = 
{
  "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "width": 1,
  "height": 150,
  "padding": 1,
  "data": {"values": [{"a": 1},{"a": 2},{"a": 3},{"a": 4},{"a": 5},
                      {"a": 6},{"a": 7},{"a": 8},{"a": 9},{"a": 10}]},
  "datasets": {"source":"data"},
  "mark": {"type":"tick"},
  "encoding": {
 
    "y": {"field": "a", "type": "quantitative", "title": null,  
      "axis": {
          "labels": false}},
    "color": {
      "field": "a",
      "type": "quantitative",
      "sort": "ascending",
      "scale": {"scheme": "redyellowgreen", "reverse": true},
      "legend": {"title":"Prix m²", "tickCount": 4}
    }
  },
  "config": {
    "tick": {
      "thickness": 0.1,
      "bandSize": 1
    }
  }
};


    var view_legend_map1, data=[];

    function init_vlSpec_legend_map_1() {
        data=[]

        //associer un champ aux valeurs
        for (v in list_prix_m2) {
            data.push({"a": list_prix_m2[v]})
        }

        //enlever valeurs extrêmes
        min_prix_m2 = Percentile_5(list_prix_m2); max_prix_m2 = Percentile_95(list_prix_m2);
        data = data.filter(function(item) {
          return item["a"] > min_prix_m2 && item["a"] < max_prix_m2;
      });

        vlSpec_legend_map_1.data.values = data;
        color_map = "blues"
        vlSpec_legend_map_1.encoding.color.scale.scheme = colorScheme;
        if (colorScheme === "redyellowgreen") {vlSpec_legend_map_1.encoding.color.scale.reverse = true}
        else {vlSpec_legend_map_1.encoding.color.scale.reverse = false}

         var vgSpec = vegaLite.compile(vlSpec_legend_map_1).spec;

         var tooltipOptions = {
         theme: 'light'
         };
         
         var handler = new vegaTooltip.Handler(tooltipOptions);
         var runtime = vega.parse(vgSpec);
         view_legend_map1 = new vega.View(runtime)
           .renderer('canvas')  // set renderer (canvas or svg)
           .tooltip(handler.call)  // note that you have to use `handler.call`!
           .initialize('#legend_map') // initialize view within parent DOM container
           .hover()             // enable hover encode set processing
           .run()              // run the dataflow and render the view
           

         
         let promise = new Promise(function(resolve, reject) {     
             setTimeout(() => resolve(view_legend_map1.runAsync()), 200);
           });

  };

     
     
     


