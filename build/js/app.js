window.onload = init;

var _c = console || {};
function init(){

    queue() // parallel request ajax
        .defer( d3.json, "../data/dict_partidos.json" )
        .defer( d3.json, "../data/results_paso_old.json" )
        .await( initApp );
}

function initApp(err, dict, data_results){
    _c.groupCollapsed("DATA"); // logging data
        _c.group("dict");
            _c.log(dict);
        _c.groupEnd();
        _c.group("results");
            _c.log(results);
        _c.groupEnd();
    _c.groupEnd();

    var especulometro = {}; // data acumulada para el especulometro
    
    var results = data_results[ 99 ][ 999 ].r; // array resultados
    
    var headers = get_headers( dict );
    var rows = get_rows( results, headers );

    var table = d3.select( "#viz" ).append( "table" );

    // var thead = table.append("thead");
    // var tbody = table.append("tbody");

// cabeceras...
    headers = [ { id: '0', nombre_corto: "n" } ].concat( headers );
    
    var th = table.append( "tr" ).selectAll( "th" )
        .data( headers, function( d ){ return d.id; });
        
    var th_enter = th.enter() // append ca beceras th 
        .append( "th" )
        .attr( 'id', function( d ){ return "th_" + d.id; } )
        .attr( 'class', function( d ){ return "column_" + d.id; } )
        ;

    var bars = th_enter.append( 'div' )
        .attr( 'id', function( d ){ return "bar_" + d.id; } )
        .attr( 'class', 'bar' )
        .style( 'background', function( d ) {
            return d.color_partido;
        } )
        ;
    var espec_porc = th_enter.append( 'div' )
        .attr( 'class', 'porc' )
        .text( "0%" );
    th_enter.append( 'div' )
        .attr( 'class', 'name' )
        .text( function( d ) {
            return d.nombre_corto;
        } )
        ;



// filas....
    
    var filas = table.selectAll( "tr.row" )
        .data( rows, function( d ){ return d[ 0 ].id; } ).enter()
        .append( "tr" )
        .attr( "id", function( d ){ return d[ 0 ].id; } )
        .attr( "class", "row" )
        ;

    var cells = filas.selectAll( "td" ) // append celdas
        .data( function( d ){ return d; } );
    var cells_enter = cells.enter()
        .append( "td" )
        ;

    cells_enter.each( function( d, i ) {
            
            if ( !especulometro[ d.id ] ) {
                especulometro[ d.id ] = 0;
            }
            
            var el = d3.select( this );

            var column = d.id;
            var paso_id = this.parentNode.id;

            if( i === 0 ){ // resultado paso
                el.attr( "id", function( d ){ return "paso_" + d.id;  } ); 
                el.append( "div" ).attr( "class", function( d ){ return "paso_bar"; } )
                    // .style("width", function(d ){ return (d.p*2) + "%"; })
                    .style("background", function( d ){ return dict[d.id].color_partido; })
                    ;
                el.append( "div" ).attr( "class", "paso_porc" ).text(function( d ){ return d.p + "%"; } );
                el.append( "div" ).attr( "class", "paso_name" ).text(function( d ){ return dict[ d.id ].nombre_corto; } );
                
            }else{ // mas y menos para cada partido pro fila
                el.attr( "class", function( d ) { return "column_" + d.id;  });
                if( this.parentNode.id == d.id ){
                    el.classed( "same", true );
                }
                el.append( "span" ).attr( "data-type", "+" ).attr( "data-paso_id", paso_id ).attr( "class", "btn mas" ).attr( "title", "mas 1" ).text( "+" );
                el.append( "span" ).attr( "data-type", "-" ).attr( "data-paso_id", paso_id ).attr( "class", "btn menos" ).attr( "title", "menos 1" ).text( "-" );
                el.append( "span" ).attr( "data-type", "++" ).attr( "data-paso_id", paso_id ).attr( "class", "btn menos" ).attr( "title", "todo" ).text( "++" );
            }
        });

    update();
    

    d3.selectAll( "td .btn" ).on( "click", function(d, i){ // click +, - or ++
        

        var op = this.dataset.type; // operador (+, -, ++)
        var paso_id = this.dataset.paso_id;
        var espec_id = d.id;
        // var paso = d3.select("#paso_"+row);
        var r = results.filter(function(x){ return x.id == paso_id; })[0]; // get nodo desde los resultados para modificar

        switch(op){  // set data values
            case "+":
                if(r.p > 1){ // suma 1% al seleccionado
                    r.p -=1; // resto 1 al porcentaje paso 
                    especulometro[espec_id] += 1; // +1 al especulometro seleccionado
                }else{
                    especulometro[espec_id] += r.p; // +1 al especulometro seleccionado
                    r.p = 0;
                }
                break;
            case "++":
                especulometro[espec_id] += r.p; // +1 al especulometro seleccionado
                r.p = 0;
                break;
            default:
                break;
        }

        _c.groupCollapsed("Click: td .btn"); // logging data
            _c.log(d);
            _c.log(especulometro);
            _c.log(r);
        _c.groupEnd();
        update();
    });
    

    function update(){
        // update bars
        bars.transition().style("height", function( d ){ return especulometro[d.id] + "px"; })
        espec_porc.text(function( d ){ return ( especulometro[d.id] ? especulometro[d.id].toFixed(2) : 0 ) + "%"; });
        // update cells
        cells.each(function(d, i){
            var el = d3.select(this);

            var column = d.id;
            var row = this.parentNode.id;

            if(i === 0){ // resultado paso
                el.select("div.paso_bar").transition()
                    .style("width", function(d ){ return (d.p*2) + "px"; })
                    ;
                el.select("div.paso_porc").text(function( d ){ return d.p.toFixed(2) + "%"; });
                
            }else{ // mas y menos para cada partido pro fila
            
            }
        });
    }


}

function get_rows (r, headers) {
	var rows = [];
	for(var x in r){
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
