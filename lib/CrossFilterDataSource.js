function CrossFilterDataSource(data_source, filterList) {
    filterList.map(f=> {
        
        if (f.operation === "include") {
            data_source = data_source.filter((item)=> f.values.indexOf(item[f.field]) !== -1)		            
        }
        else if (f.operation === "exclude") {
            data_source = data_source.filter((item)=> f.values.indexOf(item[f.field]) === -1)
        }        
        else if (f.operation === "<") {
            var fieldName = f.field; var fieldValue = f.value
            data_source = data_source.filter((item)=> item[fieldName] < fieldValue)
        }
        else if (f.operation === ">") {
            var fieldName = f.field; var fieldValue = f.value
            data_source = data_source.filter((item)=> item[fieldName] > fieldValue)
        }
        else if (f.operation === "<=") {
            var fieldName = f.field; var fieldValue = f.value
            data_source = data_source.filter((item)=> item[fieldName] <= fieldValue)
        }
        else if (f.operation === ">=") {
            var fieldName = f.field; var fieldValue = f.value
            data_source = data_source.filter((item)=> item[fieldName] >= fieldValue)
        }
        else if (f.operation === "between") {
            var fieldName = f.field; var fieldValueMin = f.valueMin; var fieldValueMax = f.valueMax;
            data_source = data_source.filter((item)=> item[fieldName] >= fieldValueMin && item[fieldName] <= fieldValueMax)
        }
        else if (f.operation === "between_binMode") {
            var fieldName = f.field.replace("_binned", ""); var fieldValueMin = f.valueMin; var fieldValueMax = f.valueMax;
            data_source = data_source.filter((item)=> item[fieldName] >= fieldValueMin && item[fieldName] < fieldValueMax)
        }		        
    })

    return data_source
}


function formFilterArray(params_chart) {
    var filter_array = {}, filterList = {}
        Object.assign(filter_array, params_chart.transformations.crossfilter)


        var filter_array_transformed = Object.values(_.mapValues(params_chart.transformations.crossfilter,
            function(value, key) {
                if (key.indexOf("binned") > -1) {
                    
                    var result = value.map(v=> {
                        var pos_sep = v.indexOf("-");
                        var valueMin = parseFloat(v.substring(0, pos_sep));
                        var valueMax = parseFloat(v.substring(pos_sep+1));

                        return {field:key, operation: "between_binMode", valueMin: valueMin, valueMax: valueMax}
                    })

                    return result
                }
                else if (key.indexOf("brushed") > -1) {
                    var pos_sep = value[0].indexOf("-");
                    var valueMin = parseFloat(value[0].substring(0, pos_sep));
                    var valueMax = parseFloat(value[0].substring(pos_sep+1));
                    return {field:key.replace('_brushed', ''), operation: "between", valueMin: valueMin, valueMax: valueMax};
                }                   
                else {
                    return {field:key, operation: "include", values: value};
                }
            })).flat()

    //flaten the values for the include operations
    filter_array_transformed.map(o=> { if (o.operation === "include" && typeof(o.values) === "object") {o.values = o.values.flat()} })
    
    //add the values into the filter bar chart list
    Object.assign(filterList, filter_array_transformed);

    //reset crossfilet object
    if (params_chart.reset_crossfilter === undefined) {params_chart.transformations.crossfilter = {} }
    

    return filterList

}


function prepare_engage_crossfilter(data_chart, params_chart, filterList, data_chuncks, sharedParams) {
    //stat exec time
    var t1 = (new Date())/1000
    //transform the filterList into an array that we can push in it filter objects
    filterList = Object.values(filterList).filter(l=> l.field !== "")
                
                    
    //prepare data filter
    //1.check if the filter contains binned field
    var filter_binned_fields = filterList.filter(o=> o.field.indexOf("_binned") > -1)

    //2.if binned fields are found, map over each binned field, extend it with other non binned fields, and pass the filter array to the crossfilter func
    if (filter_binned_fields.length > 1) {              
        //2.1.rebuild an array of all non binned fields
        var filterList_non_binned_fields = filterList.filter(f=> f.field.indexOf("_binned") === -1)

        //map
        filter_binned_fields.map(binned_field=> { 
            var final_filterList = [...filterList_non_binned_fields]

            //2.2.fusion the array built in 2.1 with each object of filter_binned_fields
            final_filterList.push(binned_field)

            //2.3.launch the crossfilter func with the array built in 2.2   
            var data_chunck = getFiltredData(data_chart, final_filterList, params_chart.id, sharedParams)

            data_chuncks = data_chuncks.concat(data_chunck)
            //console.table(final_filterList)
            final_filterList = []
        })

        var t2 = (new Date())/1000; var tf = parseFloat((t2-t1).toFixed(3))
        sharedParams.crossfilterData_exec_time.push({[params_chart.id]: tf, time: (new Date).toLocaleString()})

        return data_chuncks

        
    }

    else {
        var data_chuncks = getFiltredData(data_chart, filterList, params_chart.id, sharedParams);

        var t2 = (new Date())/1000; var tf = parseFloat((t2-t1).toFixed(3))
        sharedParams.crossfilterData_exec_time.push({[params_chart.id]: tf, time: (new Date).toLocaleString()})

        return data_chuncks
    }       
}

function getFiltredData(data_chart, filterList, params_chart_id, sharedParams) {

    //build the id used by the current cross-filter process
    var id_current = filterList.map(o=> Object.values(o).join()).join("|")

    //get back the id used by the previous cross-filter process
    var id_previous = sharedParams.params_data_filtred.filter

    //if the current filter ID is different from the shared filter id, and the filter do not contains binned value, call the filter function to refresh the dataset <ith the last filter values
    if (id_current !== id_previous && id_current.indexOf("_binned") > -1) {
        var filterList = filterList.filter(l=> l.field !== "")
        var data_chart = CrossFilterDataSource(data_chart, filterList);

        //register the filtred data in the shared params
        //sharedParams.params_data_filtred.dataset = _.cloneDeep(data_chart);
        sharedParams.params_data_filtred.dataset = data_chart;
        sharedParams.params_data_filtred.filter = id_current
        console.log(params_chart_id + ": filtred with " + id_current)
    }
    else if (id_current === id_previous && (id_current !== "")) {
        //var data_chart = _.cloneDeep(sharedParams.params_data_filtred.dataset)
        var data_chart = [...sharedParams.params_data_filtred.dataset]
    }

    //else if a filter is provided by the used in the initial parameters, use them for filtering the dataset
    else if (Object.keys(filterList).length > 0) {
        var data_chart = CrossFilterDataSource(data_chart, filterList);
    }    

    return data_chart
}