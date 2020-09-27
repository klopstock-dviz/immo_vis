class params_label {
	constructor() {
		this.htmlNode = ""
		this.value = ""
		this.prefix = ""
		this.suffix = ""
		this.fontWeight = "600"
		this.fontSize_labels = "1rem"
		this.fontSize_titles = "0.75rem"
		this.title = ""
		this.groupTitle_fontSize = "1.25rem"
		this.filtered_by = {}
	    this.instanciator = []
	    this.chart_instance = []
		this.transformations = {}
		this.data_main = []
		this.collect_active_slices = false
	
		//useless variables, maintainded to avoid bugs in state management process
	    this.list_idx_segment_single_selected = [] //stock le segment selectionné suite à un clic simple (ex: 0-0 pour le 1er segment)
	    this.list_labels_segment_single_selected = [] //stock le label catégorie/sous cat du segment selectionné suite à un clic simple (ex: category 13 et sub_category 1)
	    this.list_keys_values_segment_single_selected = [] //stock le vrai label du segment selectionné suite à un clic simple (ex: communes 13 et nb_pieces 1)
	    this.list_keys_values_segments_multiples_selected = [] //stock les vrais labels des segments selectionnés suite à un clic multiple (ex: communes 13 et nb_pieces 1)
	    this.list_idx_segments_multiples_selected = [] //stock les segments selectionnés suite à un clic + shift
	    this.list_labels_segments_multiples_selected = [] //stock les labels des segments selectionnés suite à un clic + shift
	    this.brush_values = {}
	    this.brush_keys_values = {}
	    this.activ_categories_values = []
	    this.active_legends = {}
	    this.hidden_legends = {}
	    this.legends_field = ""    

	}
}