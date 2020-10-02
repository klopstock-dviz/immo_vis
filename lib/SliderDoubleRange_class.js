class SliderDoubleRange {

	createChart(params_chart, sharedParams) {
		//params_chart.transformations.crossfilter = {"INSEE_COM": ["33063", "33281"], nb_pieces: [2]}//, "33281"
		params_chart.rangeDataset = this.prepare_data_p1(params_chart, sharedParams)

		this.init_slider(params_chart)

		params_chart.chart_type = "slider"

		params_chart.instanciator = this
		
		//add params chart to shared params if no present
		/*if (sharedParams.params_charts.includes(params_chart) === false) {
			sharedParams.params_charts.push(params_chart)
		}*/

		params_chart.created = true
	}

	updateChart(params_chart, sharedParams) {
		params_chart.value = this.prepare_data_p1(params_chart)

		this.init_slider(params_chart)
	}

	prepare_data_p1(params_chart, sharedParams) {
	    var d1 = new Date();

	    //get the dataset to use: by default use the operationnal dataset
	    if (params_chart.range_params.dataset === undefined) {
	    	var dataset = [...sharedParams.data_main]
	    }
	    else {
	    	var dataset = [...params_chart.range_params.dataset]
	    }

	    //get the field to use
	    if (params_chart.range_params.field === undefined) {
	    	console.log('field for slider ' + params_chart.id + ' not defined')
	    	return {min: undefined, max: undefined}
	    }
	    else {
	    	var field = params_chart.range_params.field	    		    	
	    }


	    //set the min value
	    return dataset_extent(params_chart.range_params.domain, dataset, field)

	}

	init_slider(params_chart) {

    	var slider = document.getElementById(params_chart.htmlNode);

  //  		var title = document.createElement('h6')
		// title.id = params_chart.id + "_title"
		// title.style.marginBottom = "5px"
		// title.innerHTML = params_chart.title
		// title.style.fontSize = "1.25rem";
		// slider.appendChild(title)


    	if (params_chart.tooltip_format && params_chart.tooltip_format.decimals) {
	      	var decimal = params_chart.tooltip_format.decimals
    	}
    	else {
    		var decimal = 4
    	}

    	//get the thousand_separator
    	if (params_chart.tooltip_format && params_chart.tooltip_format.thousand_separator) {
	      	var thousand_separator = params_chart.tooltip_format.thousand_separator
    	}
    	else {
    		var thousand_separator = '.'
    	}

    	//get the thousand_separator
    	if (params_chart.tooltip_format && params_chart.tooltip_format.suffix) {
	      	var suffix = params_chart.tooltip_format.suffix
    	}
    	else {
    		var suffix = ''
    	}

    	//get the listen method
    	if (params_chart.listen_method === undefined) {
    		params_chart.listen_method = 'update'
    	}

    	//get start & end values for the handler
    	//if (params_chart.rangeDataset.min)
    	var min = parseFloat(params_chart.rangeDataset.min); var max = parseFloat(params_chart.rangeDataset.max);
    	var start = [min.toFixed(decimal), max.toFixed(decimal)]
      noUiSlider.create(slider, {
          start: start,
          tooltips: [wNumb({decimals: decimal, suffix: suffix}), wNumb({decimals: decimal, suffix: suffix})],
          connect: true,
          range: {
              'min': params_chart.rangeDataset.min,
              'max': params_chart.rangeDataset.max
          },
          format: wNumb({
                  decimals: decimal,
                  thousand: thousand_separator,
                  suffix: suffix
              })
      });

      //set the pos of the handlers
      slider.noUiSlider.set([Math.floor(min), Math.ceil(max)]);



      //read the values of handlers when moving
		slider.noUiSlider.on(params_chart.listen_method, function (values, handle) {

			var min = parseFloat(slider.noUiSlider.getOrigins()[0].innerText.replace(params_chart.tooltip_format.suffix, ''))
			var max = parseFloat(slider.noUiSlider.getOrigins()[1].innerText.replace(params_chart.tooltip_format.suffix, ''))
		    params_chart.list_idx_segment_single_selected = [min, max];
		});      
		


    }

}

