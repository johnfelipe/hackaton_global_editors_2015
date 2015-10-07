window.onload = init;

var _c = console || {};
function init(){

	queue() // parallel request ajax
        .defer( d3.json, "../data/dict_partidos.json" )
        .defer( d3.json, "../data/results_paso_old.json" )
		.await( initApp );
}

function initApp(err, dict, results){
	_c.groupCollapsed("DATA")
		_c.group("dict")
			_c.log(dict);
		_c.groupEnd()
		_c.group("results")
			_c.log(results);
		_c.groupEnd()
	_c.groupEnd()

	var r = results[99][999].r; // array resultados
	
    var headers = get_headers(dict);
	var rows = get_rows(r, headers);

	var table = d3.select("#viz").append("table");

	// var thead = table.append("thead");
	// var tbody = table.append("tbody");

// cabeceras...
	headers = [{id:'0', nombre_corto: "n"}].concat(headers);
	
    var th = table.append("tr").selectAll("th")
		.data(headers, function(d){return d.id;});
		
	var th_enter = th.enter() // append ca beceras th 
        .append("th")
        .attr('id', function(d){ return "th_" + d.id })
        ;
    th_enter.append('div')
        .attr('id', function(d){ return "bar_" + d.id })
        .attr('class', 'bar')
        .style('background', function(d){
            return d.color_partido;
        })
        ;
    th_enter.append('div')
        .attr('class', 'name')
        .text(function(d){
            return d.nombre_corto;
		})
        ;



// filas....
    
    var filas = table.selectAll("tr.row")
        .data(rows, function(d){ return d[0].id }).enter()
        .append("tr")
        .attr("id", function(d){ return d[0].id })
        .attr("class", "row" )
        ;
    var cells = filas.selectAll("td")
        .data(function(d){ return d; }).enter()
        .append("td")
        .attr("id", function(d){ return "paso_" + d.id  })
        .attr("class", function(d){ return "paso_" + d.id  })
        ;
    
    cells.each(function(d, i){
        var el = d3.select(this);

        if(i === 0){ // resultado paso
            el.append("div").attr("id", function(d){ return "paso_name" + d.id }).text(function(d ){ return d.p + "%"; });
            el.append("div").attr("id", function(d){ return "paso_bar" + d.id }).text(function( d ){ return dict[d.id].nombre_corto } );
            
        }else{
            if(this.parentNode.id == d.id){
                el.classed("same", true);     ;
            }
            el.append("span").attr("class", "btn mas").attr("title", "mas 1").text("+");
            el.append("span").attr("class", "btn menos").attr("title", "menos 1").text("-");
            el.append("span").attr("class", "btn menos").attr("title", "todo").text("++");
        }
    });
        

}

function get_rows (r, headers) {
	var rows = [];
	for(x in r){
		if(/[0-9]{4}|blc/i.test(r[x].id)){
			var row = [r[x]].concat(headers);
			rows.push(row);
		}
	}
	return rows;
}

function get_headers(r){

	var h = [];
	for (var x in r) {
		if (/[0-9]{4}|blc/i.test(x)){
			r[x].id = x;
			h.push(r[x]);
		}
	} 

	return h;
}
