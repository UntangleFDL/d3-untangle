let PersistentHomology0D = function(svg_name, graph, st=null){

    if( st==null) st = MaximalSpanningTree(graph)

    let svg = d3.select(svg_name)
    let bcWidth = $(svg_name).width();
    let bcHeight = $(svg_name).height();

    let maxW = d3.max(st.spanning_tree_links, d=>d.value)
    let currentThreshold = 0;

    let x = d3.scaleLinear()
        .range([5, bcWidth-5])
        .domain([0, maxW]);

    let y = d3.scaleLinear()
        .range([bcHeight,0])
        .domain([0,st.spanning_tree_links.length])

    let bars = svg.selectAll(".ph_bar")
        .data(st.spanning_tree_links)
        .enter()
        .append("rect")
            .attr("class", "ph_bar")
            .attr("y", (d,i) => y(i+0.95) )
            .attr("height", (d,i) => y(i)-y(i+0.95) )
            .attr("x", x(0))
            .attr("width", d => x(d.value) )
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)

    let gd = null;

    function mouseover( d ){
        d3.select(this).attr("class","ph_bar_mouseover")
        let defNodeRad = gd.getDefaultNodeRadiusFunc()
        gd.setNodeRadius( n => defNodeRad(n) * (( n === d.source || n === d.target ) ? 1.5 : 1) )
        gd.setLinkWidth( l => (l===d) ? 20 : -1 )
        gd.setLinkStroke( l => (l===d) ? "black" : "#999" )
    }

    function mouseleave( d ){
        d3.select(this).attr("class",d=> d.value<=currentThreshold ? "ph_bar_filtered" : "ph_bar")
        gd.resetNodeRadius( )
        gd.resetLinkWidth()
        gd.resetLinkStroke()
    }

    return {
        update_threshold : function( amnt ){
            currentThreshold = amnt/100*maxW
            bars.attr('class', d=> d.value<=currentThreshold ? "ph_bar_filtered" : "ph_bar" )
            gd.override_link_forces(this.get_links_under_threshold(), link=>5, link=>1 )
        },
        get_links_under_threshold : function(){
            return st.spanning_tree_links.filter( d=> d.value <= currentThreshold )
        },
        set_graph_draw : function( _gd ){
            gd = _gd
        },
        remove :function(){
            svg.selectAll("*").remove()
        }

    }

}
