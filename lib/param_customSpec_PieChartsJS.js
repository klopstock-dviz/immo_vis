class param_customSpec_PieChartsJS {
	constructor() {
		this.data = [
					    {datasets: [{
					        data: [],
					        backgroundColor: chartJS_backgroundColor,
					        label: ''                
					    }],
					    labels: []}
						]
		this.ctx = ''
		this.type = 'pie'
		this.list_idx_segment_single_selected = [] //stock le segment selectionné suite à un clic simple (ex: 0-0 pour le 1er segment)
		this.list_labels_segment_single_selected = [] //stock le label catégorie/sous cat du segment selectionné suite à un clic simple (ex: category 13 et sub_category 1)
		this.list_keys_values_segment_single_selected = [] //stock le vrai label du segment selectionné suite à un clic simple (ex: communes 13 et nb_pieces 1)
		this.list_idx_segments_multiples_selected = [] //stock les segments selectionnés suite à un clic + shift
		this.list_labels_segments_multiples_selected = [] //stock les labels des segments selectionnés suite à un clic + shift
		this.list_final_labels_uniq_selected = new Set() //stock les labels sans doublons des segments selectionnés suite à tous types de clics (simple ou clic + shift)    
		this.brush_values = {}
		this.brush_keys_values = {}
		this.id = ""
		this.filtered_by = {}
		this.scope_field = ""
		this.category_field = ''
		this.list_of_axis = []
		this.nb_axis = 0
		this.numerical_field = ''
		this.label_tooltip = ''		
		this.interactions = [
								{elements_to_filter: 
									[]
								},
								{filtered_by: 
									[]
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
		this.responsive = true
		this.legend_position = [{position: 'top'}]
		this.legend_title = "" 
		this.title = [{
						display: true,
						text: 'set a title in the params spec'
					  }]
		this.title_x_axis = 'set a title in the params spec'
		this.title_y_axis = 'set a title in the params spec'
		this.list_idx_segments_existants = [] //stock tous les segments existant du graph                  
		this.border_activated = false	
		this.instanciator = []
		this.chart_instance = []
		this.backgroundColor_array_ClickedState = []	
		}
}