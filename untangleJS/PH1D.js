let PersistentHomology1D = function(svg_name, graph, st=null){

    let loops = SpanningTreeCycles(graph, st).loops
    loops.forEach( (l,i) => { l.name = "loop_" + i; l.isActive = false })

    let gd = null;

    let svg = d3.select(svg_name)
    let bcWidth = $(svg_name).width();
    let bcHeight = $(svg_name).height();

    svg.append("style").text(
        ".ph_bar { fill: #555 }" + "\n" +
        ".ph_bar_mouseover { fill: red }" + "\n" +
        ".ph_bar_selected { fill: darkred }" + "\n" +
        ".ph_bar_filtered { fill: lightgray }"
    )

    let maxW = d3.max(loops, d=>d.birth)

    let x = d3.scaleLinear()
        .range([5, bcWidth-5])
        .domain([0, maxW]);

    let y = d3.scaleLinear()
        .range([bcHeight,0])
        .domain([0,loops.length])

    let bars = svg.selectAll(".ph_bar")
        .data(loops)
        .enter()
        .append("g")
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)
            .on("click", mouseclick)
            .on("contextmenu", clear_selection )

    bars.append("rect")
            .attr("class", "ph_bar")
            .attr("y", (d,i) => y(i+0.95) )
            .attr("height", (d,i) => y(i)-y(i+0.95) )
            .attr("x", x(0))
            .attr("width", d => x(d.birth)-x(0) )

    bars.append("rect")
            .attr("class", "ph_bar_selected")
            .attr("y", (d,i) => y(i+0.95) )
            .attr("height", (d,i) => y(i)-y(i+0.95) )
            .attr("x", x(0))
            .attr("width", d => x(0)-x(0) )

    function clear_selection( d ){
        d3.event.preventDefault()
        if( d.isActive ) {
            gd.removeForce(d.name)
            d.isActive = false
            d3.select(this).select(".ph_bar_selected").attr("width", 0)
            active_loops.splice(active_loops.indexOf(d),1)
        }
    }

    let active_loops = []
    function active_link(l){
        let ret = false;
        active_loops.forEach( al =>{
            ret = ret || al.loop().includes(l)
        })
        return ret
    }

    function mouseclick( d ){
        //console.log(loops.indexOf(d))
        if( !d.isActive ) {
            gd.addForce(d.name, LoopForce(d.node_order()))
            active_loops.push(d)
        }

        d.isActive = true
        gd.getForce(d.name).strength( x.invert(d3.event.offsetX)/maxW )
        gd.restartSimulation()
        d3.select(this).select(".ph_bar_selected").attr("width", d3.event.offsetX-x(0) )
    }

    function mouseover( d, idx ){
        highlight_loop(idx)
    }

    function mouseleave( d, idx ){
        unhighlight_loop(idx)
    }

    function highlight_loop( idx ){
        let d = loops[idx]
        d3.select(bars.nodes()[idx]).select(".ph_bar").attr("class", 'ph_bar_mouseover')
        let defNodeRad = gd.getDefaultNodeRadiusFunc()
        gd.setNodeRadius( n =>  ( (d.node_order().includes(n) ) ? (defNodeRad(n)*1.5) : -1 ) )        
        gd.setLinkWidth( l => (d.loop().includes(l)) ? 20 : (active_link(l) ? 10 : -1) )
        gd.setLinkStroke( l => (d.loop().includes(l)) ? "#888" : null )
    }

    function unhighlight_loop(idx){
        let d = loops[idx]
        d3.select(bars.nodes()[idx]).select(".ph_bar_mouseover").attr("class", 'ph_bar')
        gd.resetNodeRadius( )
        gd.setLinkWidth( l => active_link(l) ? 10 : -1 )
        gd.resetLinkStroke()
    }


    return {
        set_graph_draw : function( _gd ){
            gd = _gd
        },
        activate_loop : function( idx, amnt ){
            let d = loops[idx]

            if( !d.isActive ) {
                gd.addForce(d.name, LoopForce(d.node_order()))
                active_loops.push(d)
            }

            d.isActive = true
            gd.getForce(d.name).strength( amnt )
            gd.restartSimulation()
            d3.select(bars.nodes()[idx]).select(".ph_bar_selected").attr("width", x(amnt*d.birth)-x(0) )
        },
        deactivate_loops : function( idx_list ){
            idx_list.forEach( idx =>{
                let d = loops[idx]
                if( d.isActive ) {
                    gd.removeForce(d.name)
                    d.isActive = false
                    d3.select(bars.nodes()[idx]).select(".ph_bar_selected").attr("width", 0)
                    active_loops.splice(active_loops.indexOf(d),1)
                }
                gd.restartSimulation()
            })
        },
        highlight_loop : function( idx ){ highlight_loop(idx) },
        unhighlight_loop : function( idx ){ unhighlight_loop(idx) },
        remove :function(){
            svg.selectAll("*").remove()
        }
    }

}
