
/*expl de structure de données: 
labels = communes
datasets = prix_m² des 1p, 2p ... où le label est le type 1p, le tableau data contiendra les prix*/

class param_customSpec_BarChartsJS {
  constructor() {
    /*mobx.extendObservable(this, {
      list_idx_segment_single_selected: [], //stock le segment selectionné suite à un clic simple (ex: 0-0 pour le 1er segment)
      list_labels_segment_uniq_selected: [], //stock le label du segment selectionné suite à un clic simple (ex: département 13 et nb pièces 1)
      list_idx_segments_multiples_selected: [], //stock les segments selectionnés suite à un clic + shift
      list_labels_segments_multiples_selected: [] //stock les labels des segments selectionnés suite à un clic + shift
    })*/
    this.list_idx_segment_single_selected = [] //stock le segment selectionné suite à un clic simple (ex: 0-0 pour le 1er segment)
    this.list_labels_segment_single_selected = [] //stock le label catégorie/sous cat du segment selectionné suite à un clic simple (ex: category 13 et sub_category 1)
    this.list_keys_values_segment_single_selected = [] //stock le vrai label du segment selectionné suite à un clic simple (ex: communes 13 et nb_pieces 1)
    this.list_keys_values_segments_multiples_selected = [] //stock les vrais labels des segments selectionnés suite à un clic multiple (ex: communes 13 et nb_pieces 1)
    this.list_idx_segments_multiples_selected = [] //stock les segments selectionnés suite à un clic + shift
    this.list_labels_segments_multiples_selected = [] //stock les labels des segments selectionnés suite à un clic + shift
    this.list_final_labels_uniq_selected = new Set() //stock les labels sans doublons des segments selectionnés suite à tous types de clics (simple ou clic + shift)    
    this.brush_values = {}
    this.brush_keys_values = {}
    this.id = ""
    this.filtered_by = {} //store the id of the third chart that filters the current one, and all the axis used in the successive filters
    this.scope_field = ""
    this.category_field = ''
    this.sub_category_field = ''
    this.list_of_axis = []
    this.nb_axis = 0
    this.numerical_field_params = {fieldName: '', agg_type: '', agg_fieldName: ''}
    this.label_tooltip = ''
    this.data = [  
                  {labels: []},
                  {
                    datasets: [
                      
                    ]
                  }
                ]
    this.data_source = [  
                  {labels: []},
                  {
                    datasets: [
                      
                    ]
                  }
                ]                
    this.data_source_raw = []
    this.prepare_data_type = ''
    this.nb_categories = 0                
    this.nb_sous_categories = 0
    this.status_chart = '' //records the status active (when after a clic the chart triggers an action of cross filtering) / target (when the chart is targetedby another chart)
    this.activ_categories_values = []
    this.activ_sub_categories_values = []
    this.ctx = ''
    this.type = 'bar'
    this.responsive = true
    this.legend_position = [{position: 'top'}]
    this.legend_title = ""
    this.legend_clicked = false
    this.legends_field = ""
    this.title = [{
                    display: true,
                    text: 'set a title in the params spec'
                  }]
    this.title_x_axis = 'set a title in the params spec'
    this.title_y_axis = 'set a title in the params spec'
    this.list_idx_segments_existants = [] //stock tous les segments existant du graph                  
    this.border_activated = false
    this.interactions = [
                {elements_to_filter: 
                  []
                },
                {filtered_by: 
                  []
                }     
              ]
    this.instanciator = []
    this.chart_instance = []
    this.active_slices = []
    this.backgroundColorArray_source = {}
    this.colorsConfig = {scheme: "", colorsOrder: ""}
    this.bin_params = {bin: false, bin_field: "", agg_type: "count", domain: [0, "q0.95"], thresholds: 10}
    this.selection_params = {interaction_mode: "filter", selection_level: "all", selection_field: "", highlight_mode: "all"}
    this.transformations = {dataset: undefined, filter: undefined, crossfilter: {}}
    this.data_main = []
    this.interactions_chart_options = {hoverOptions: true, selectionOptions: true}
    this.active_legends = {}
    this.hidden_legends = {}
    this.previous_hiearchy = {}
    


  }

  adapt_to_binMode() {    
    if (this.bin_params.bin === true) {
      this.bin_params.bin_field = this.category_field
      this.category_field = this.category_field + "_binned"
    }
  }

  //adapt_to_binMode()
}


/*              data=[
                  {labels: ["13", "33", "43"]},
                  {
                    datasets: [
                      {
                        label: 1,
                        backgroundColor: 'blue',
                        data: [29889, 8889, 19889]
                      },
                      {
                        label: 2,
                        backgroundColor: 'red',
                        data: [19889, 4889, 9889]
                      },
                      {
                        label: 3,
                        backgroundColor: 'green',
                        data: [39889, 19889, 14889]
                      }                      
                    ]
                  }
                ]
*/


/*model de base:

var data = {
  labels: ["Chocolate", "Vanilla", "Strawberry"],
  datasets: [{
    label: "Blue",
    backgroundColor: "blue",
    data: [3, 7, 4]
  }, {
    label: "Red",
    backgroundColor: "red",
    data: [4, 3, 5]
  }, {
    label: "Green",
    backgroundColor: "green",
    data: [7, 2, 6]
  }]
};


  var barChartData = {
      labels: [],
      datasets: [{
        label: 'Dataset 1',
        backgroundColor: [],
        data: [

        ]
      }, {
        label: 'Dataset 2',
        backgroundColor: [],
        data: [

        ]
      }]

    }
myBar = new Chart(ctx, {
        type: 'bar',
        data: barChartData,
        options: {
          responsive: true,
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Chart.js Bar Chart'
          }
        }
      }); */