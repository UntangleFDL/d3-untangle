let GraphDraw = function(graph){

    // Clear the SVG
    d3.select("#graph").selectAll("*").remove();


    // Get SVG properties and create a group that all objects can go into
    const svg = d3.select("#graph").append("g")
    const svg_width = $('#graph').width();
    const svg_height = $('#graph').height();

    //
    //const nodes = graph.nodes;
    //const links = graph.links;
    let tick_cb = null;
    let current_zoom = 1

    let default_point_radius_func = graph.nodes.length < 125 ? () => 9 : (graph.nodes.length < 1000 ? () => 7 : () => 5 )
    let default_stroke_width_func = d => Math.max(0.1,(Math.sqrt(d.value)/current_zoom))
    //let default_stroke_func = () => graph.links.length/graph.nodes.length < 4 ? "#999" : "#bbb"
    let default_stroke_func = () => graph.links.length/graph.nodes.length < 4 ? "#909090" : "#bbb"
    // console.log(graph.links.length)
    // console.log(graph.nodes.length)
    // console.log(graph.links.length/graph.nodes.length)

    let current_point_radius_func = default_point_radius_func
    let current_stroke_width_func = default_stroke_width_func
    let current_stroke_func = default_stroke_func

    // Create SVG Elements for Links
    const link = svg.append("g")
                        .attr("stroke", current_stroke_func)
                        .selectAll("line")
                        .data(graph.links)
                            .join("line")
                            .attr("stroke-width", current_stroke_width_func );


    // Create SVG Elements for Nodes
    const node = svg.append("g")
                        .attr("stroke", "#fff")
                        .attr("stroke-width", 1)
                        .selectAll("circle")
                        .data(graph.nodes)
                            .join("circle")
                            .attr("r", current_point_radius_func )


    // Create the FDL Simulation
    const linkForce = d3.forceLink(graph.links).id(d => d.id)
    const defaultLinkDistance = linkForce.distance()
    const defaultLinkStrength = linkForce.strength()

    const manyBodyForce = d3.forceManyBody()

    const centerForce = d3.forceCenter(svg_width / 2, svg_height / 2)

    const simulation = d3.forceSimulation(graph.nodes)
                            .force("link", linkForce)
                            .force("charge", manyBodyForce)
                            .force("center", centerForce);

    simulation.on("end", ()=>zoom_to_fit(0.95,2500))
    init_fit = false
    let interation_count = 0;
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        if( tick_cb != null) tick_cb();
        if( !init_fit ) { init_fit=true; zoom_to_fit(0.6,2500)}
        if( (interation_count++%50) === 0) zoom_to_fit(0.85,500)
    });


    // Create Zoom functionalities
    let zoom_handler = d3.zoom().on("zoom", function(){
        current_zoom = d3.event.transform.k
        node.attr('r', current_point_radius_func ) //d => point_radius_func(d) / d3.event.transform.k)
        node.attr('stroke-width', 1 / d3.event.transform.k)
        link.attr("stroke-width", current_stroke_width_func ) //d => stroke_width_func(d) / d3.event.transform.k)
        svg.attr("transform", d3.event.transform)
    });
    svg.call(zoom_handler).call(zoom_handler.transform, d3.zoomIdentity);

    function zoom_to_fit(paddingPercent, transitionDuration) {

        let bounds = svg.node().getBBox();
        if (bounds.width === 0 || bounds.height === 0) return; // nothing to fit

        transitionDuration = transitionDuration || 0

        let mid = [bounds.x + bounds.width / 2, bounds.y + bounds.height / 2]
        let scale = (paddingPercent || 0.75) / Math.max(bounds.width / svg_width, bounds.height / svg_height)

        let transform = d3.zoomIdentity
            .translate(svg_width / 2 - scale * mid[0], svg_height / 2 - scale * mid[1])
            .scale(scale);

        if( transitionDuration === 0 )
            svg.call( zoom_handler ).call(zoom_handler.transform, transform)
        else
            svg.call(zoom_handler).transition().duration(transitionDuration).call(zoom_handler.transform, transform)

        //setTimeout( zoom_to_fit, 3000, paddingPercent, transitionDuration);
    }



    return {
        graph : function() {
            return graph
        },
        set_tick_callback : function(cb){
            tick_cb = cb;
            return this
        },
        set_click_callback : function(cb){
            node.on("click",cb)
            return this
        },
        override_link_forces : function(links, distance_func, strength_func){
            let override_link_distance = {}
            let override_link_strength = {}
            links.forEach( link => {
                override_link_distance[link.index] = distance_func(link)
                override_link_strength[link.index] = strength_func(link)
            })
            linkForce.distance( link => (link.index in override_link_distance) ? override_link_distance[link.index] : defaultLinkDistance(link) )
            linkForce.strength( link => (link.index in override_link_strength) ? override_link_strength[link.index] : defaultLinkStrength(link) )
            simulation.alpha(1.0).restart();
            return this
        },
        fit_graph : function(){
            zoom_to_fit(0.975,0)
        },
        setNodeFill : function( func ){
            node.attr( "fill", func)
        },
        resetNodeFill : function(){
            node.attr( "fill", "black")
        },
        setNodeStroke : function( func ){
            node.attr( "stroke", func)
        },
        getDefaultNodeRadiusFunc : function(){
            return default_point_radius_func
        },
        setNodeRadius : function( func ){
            current_point_radius_func = function(d){
                let v = func(d)/current_zoom
                if( v < 0 ) v = default_point_radius_func(d)/current_zoom
                return v
            }
            node.attr( "r", current_point_radius_func )
        },
        resetNodeRadius : function(){
            current_point_radius_func = function(d){ return default_point_radius_func(d)/current_zoom }
            node.attr( "r", current_point_radius_func )
        },
        setLinkWidth : function( func ){
            current_stroke_width_func = function(d) {
                let v = func(d)
                return (v<0) ? default_stroke_width_func(d) : v/current_zoom
            }
            link.attr("stroke-width", current_stroke_width_func)
        },
        resetLinkWidth : function(){
            current_stroke_width_func = default_stroke_width_func
            link.attr( "stroke-width", current_stroke_width_func )
        },
        setLinkStroke : function( func ){
            current_stroke_func = function(d) {
                let v = func(d)
                return (v==null) ? default_stroke_func(d) : v
            }
            link.attr("stroke", current_stroke_func)
        },
        resetLinkStroke : function(){
            current_stroke_func = default_stroke_func
            link.attr( "stroke", current_stroke_func )
        },
        addForce : function(name, force){
            simulation.force(name, force)
            simulation.alpha(1).restart()
        },
        getForce : function(name){
            return simulation.force(name)
        },
        restartSimulation : function(){
            simulation.alphaDecay(0.01).alpha(1).restart()
        },
        removeForce : function(name){
            simulation.force(name, null)
            simulation.alpha(1).restart()
        },
        stopSimulation: function(){
            simulation.stop()
        },
        get_json : function(){
            let tmp_data = {}
            tmp_data['nodes'] = graph.nodes
            tmp_data['links'] = []
            graph.links.forEach( function(L){
               tmp_data.links.push({'value':L.value,'source':L.source.id,'target':L.target.id});
            });
            return JSON.stringify(tmp_data);
        }


    }
}