class sharedParams {
  	constructor() {
	    this.used_color_schemes = {}
	    this.transformations = {filter: ""}
	    this.data_source = []
	    this.data_main = []
	    this.params_data_filtred = {dataset: [], filter: ""}
	    this.list_of_axis = []
	    this.time_refresh = 0
	    this.interaction_events = {}
	    this.language = "en"
	    this.crossfilterProcess_exec_time = []
	    this.crossfilterData_exec_time = []
	    this.params_charts = []
		//example spec filter transformations
		/*transformations = {filter: [{field: "INSEE_COM", operation: "include", values: ["33063","64445","17300","33281","87085","17306"]},
											{field: "nb_pieces", operation: "<", value: 9},
											{field: "nb_pieces", operation: "between", valueMin: 3, valueMax: 8}]}*/	

	}


	prepare_data_source(data_source) {

	    var d1 = new Date();



	    //filter the primary data source according to the scope given in transformations spec bellow

	    var result_filter = []; var data_filtred = [...data_source.operational_data]
	    if (this.transformations.filter) {
		    this.transformations.filter.map(f=> {
		        
		        if (f.operation === "include") {
		            data_filtred = data_filtred.filter((item)=> f.values.indexOf(item[f.field]) !== -1)
		        }
		        else if (f.operation === "exclude") {
		            data_filtred = data_filtred.filter((item)=> f.values.indexOf(item[f.field]) === -1)
		        }        
		        else if (f.operation === "<") {
		            var fieldName = f.field; var fieldValue = f.value
		            data_filtred = data_filtred.filter((item)=> item[fieldName] < fieldValue)
		        }
		        else if (f.operation === ">") {
		            var fieldName = f.field; var fieldValue = f.value
		            data_filtred = data_filtred.filter((item)=> item[fieldName] > fieldValue)
		        }
		        else if (f.operation === "<=") {
		            var fieldName = f.field; var fieldValue = f.value
		            data_filtred = data_filtred.filter((item)=> item[fieldName] <= fieldValue)
		        }
		        else if (f.operation === ">=") {
		            var fieldName = f.field; var fieldValue = f.value
		            data_filtred = data_filtred.filter((item)=> item[fieldName] >= fieldValue)
		        }
		        else if (f.operation === "between") {
		            var fieldName = f.field; var fieldValueMin = f.valueMin; var fieldValueMax = f.valueMax;
		            data_filtred = data_filtred.filter((item)=> item[fieldName] >= fieldValueMin && item[fieldName] <= fieldValueMax)
		        }        

		        //result_filter.push(data_filtred)

		    })
		}
		
	    this.data_main = [...data_filtred]



	    //filter the geojson if provided
	    if (data_source.geojson_data) {
		    if (this.transformations.filter) {
	    		var data_filtred = Object.values([data_source.geojson_data][0])
			    
			    this.transformations.filter.map(f=> {
			        if (f.operation === "include") {
			            data_filtred = data_filtred.filter((item)=> f.values.indexOf(item[f.field]) !== -1)
			        }
			        else if (f.operation === "exclude") {
			            data_filtred = data_filtred.filter((item)=> f.values.indexOf(item[f.field]) === -1)
			        }
			    })
			}
		this.geojson_data = [...data_filtred]
		}





	console.log("tps exec filter data_source: " + (new Date() - d1)/1000)    

		//save the data source
	    this.data_source = [...data_source.operational_data]; data_source = []

	}

	
	setup_crossfilter(sharedParams) {
		this.params_charts.map(c=> {

		  var observe_ = new Observe_Charts_state();

		  //build list of third charts
		  var third_charts = [];
		  this.params_charts.filter(cc=> cc.id !== c.id).map(chart=> { 
		  	var filter, collect_active_slices

		  	//check if the user specified crossfilter params for the current target chart (chart)
		  	if (c.crossfilter && chart === c.crossfilter.chart) {
			  	//case when both filter & collect_active_slices are specified by the user spec
			  	if (c.crossfilter && c.crossfilter.hasOwnProperty('filter') && c.crossfilter.hasOwnProperty('collect_active_slices')) {
			  		third_charts.push(c.crossfilter)	
			  	}
			  	//case when only filter is specified by the user spec, collect_active_slices is always true
				else if (c.crossfilter && c.crossfilter.hasOwnProperty('filter')) {		  		
			  		third_charts.push({chart: c.crossfilter.chart, filter: c.crossfilter.filter, collect_active_slices: true}) 
			  	}
			}
		  	
		  	//case when the crossfilter params is not specified
		  	else {
			  	if (chart.filter === undefined || chart.filter !== false) {chart.filter = true }
			  	if (chart.collect_active_slices === undefined || chart.collect_active_slices !== false) {chart.collect_active_slices = true }
			  	third_charts.push({chart: chart, filter: chart.filter, collect_active_slices: chart.collect_active_slices}) 
		  	}

		  	
		  })

		  c.sharedParams = sharedParams
		  observe_.observe_chart_state(c, third_charts, c.sharedParams)
		})		
	}	
	






}


