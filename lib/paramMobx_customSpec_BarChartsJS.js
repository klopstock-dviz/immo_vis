
/*expl de structure de données: 
labels = communes
datasets = prix_m² des 1p, 2p ... où le label est le type 1p, le tableau data contiendra les prix*/

class param2_customSpec_BarChartsJS {
  constructor() {
    mobx.extendObservable(this, {
      list_idx_segment_uniq_selected: [], //stock le segment selectionné suite à un clic simple (ex: 0-0 pour le 1er segment)
      list_labels_segment_uniq_selected: [], //stock le label du segment selectionné suite à un clic simple (ex: département 13 et nb pièces 1)
      list_idx_segments_multiples_selected: [], //stock les segments selectionnés suite à un clic + shift
      list_labels_segments_multiples_selected: [] //stock les labels des segments selectionnés suite à un clic + shift
    })

    this.category_field = ''
    this.sub_category_field = ''
    this.numerical_field = ''
    this.data = [  
                  {labels: []},
                  {
                    datasets: [
                      
                    ]
                  }
                ]

    this.ctx = ''
    this.type = 'bar'
    this.responsive = true
    this.legend = [{position: 'top'}]
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
  }
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