class params_slider {
	constructor() {
	    this.list_idx_segment_single_selected = [] //stock le segment selectionné suite à un clic simple (ex: 0-0 pour le 1er segment)
	    this.list_labels_segment_single_selected = [] //stock le label catégorie/sous cat du segment selectionné suite à un clic simple (ex: category 13 et sub_category 1)
	    this.list_keys_values_segment_single_selected = [] //stock le vrai label du segment selectionné suite à un clic simple (ex: communes 13 et nb_pieces 1)
	    this.list_keys_values_segments_multiples_selected = [] //stock les vrais labels des segments selectionnés suite à un clic multiple (ex: communes 13 et nb_pieces 1)
	    this.list_idx_segments_multiples_selected = [] //stock les segments selectionnés suite à un clic + shift
	    this.list_labels_segments_multiples_selected = [] //stock les labels des segments selectionnés suite à un clic + shift
	    this.brush_values = {}
	    this.brush_keys_values = {}
	    this.id = ""
	    this.filtered_by = {} //store the id of the third chart that filters the current one, and all the axis used in the successive filters
    	this.range_field = ""
    	this.category_field = this.range_field
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
	    this.activ_categories_values = []
	    this.ctx = ''                
	    this.legend_clicked = false
	    this.legends_field = ""
	    this.instanciator = []
	    this.chart_instance = []
	    this.active_slices = []
	    this.backgroundColorArray_source = {}
	    this.colorsConfig = {scheme: "", colorsOrder: ""}
	    this.selection_params = {interaction_mode: "filter", selection_level: "all", selection_field: "", highlight_mode: "all"}
	    this.transformations = {dataset: undefined, filter: undefined, crossfilter: {}}
	    this.data_main = []
	    this.active_legends = {}
	    this.hidden_legends = {}
	    //set update_handles_position, as the ability of the handles of the slider to be repositioned by other charts during the crossfilter process, to false by default
	    this.update_handles_position = true
		
	}

	
}