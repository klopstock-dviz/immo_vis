class params_map {
  constructor() {
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
    this.list_of_axis = []
    this.nb_axis = 0
    this.numerical_field_params = {fieldName: '', agg_type: '', agg_fieldName: ''}
    this.label_tooltip = ''

	this.data = [
		        {labels: []},
		        {datasets: []}
		]

	this.data_source = [
		        {labels: []},
		        {datasets: [{
			        data: [],
			        backgroundColor: [],
			        label: ''                
			    }]}
		]

    this.data_source_raw = []
    this.prepare_data_type = ''
    this.nb_categories = 0                
    this.status_chart = '' //records the status active (when after a clic the chart triggers an action of cross filtering) / target (when the chart is targetedby another chart)
    this.activ_categories_values = []
    this.htmlNode = ''
    this.type = 'map'
    this.legend_position = [{position: 'top'}]
    this.legend_title = ""
    this.legend_clicked = false
    this.title = {display: true, text: 'set a title in the params spec', position: "top"}
    this.instanciator = []
    this.chart_instance = []
    this.active_slices = []
    this.backgroundColorArray_source = {}
    this.colorsConfig = {scheme: "", colorsOrder: ""}
    this.bin_params = {bin: false}
    this.selection_params = {selection_mode: "filter", selection_level: "all"}
    this.transformations = {}
    this.data_main = []
    this.interactions_chart_options = {hoverOptions: true, selectionOptions: true}
    this.active_legends = []
    this.selected_legends = []
    this.hidden_legends = {}
    this.legends_field = ""
    this.dataset_extent = {}
    this.params_fields = {hue_params: {domain: ["min", "max"]}}
    this.interaction_type = ""
    this.legendColors = []
    this.params_legends = {show: true, position: "", shape: "", nb_cells: 8, circling_datapoints: false}
    this.params_datapoints = {}
    this.leaflet_polys_id_selected = []

  }
}
