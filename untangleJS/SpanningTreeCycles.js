let SpanningTreeCycles = function( graph, st=null ) {
    if(st == null) st = MaximalSpanningTree(graph)

    let g_link_dict = {}
    graph.nodes.forEach(n => {
        g_link_dict[n.id] = [];
    })
    graph.links.forEach((l,i) => {
        g_link_dict[l.source].push({node: l.target, link: l});
        g_link_dict[l.target].push({node: l.source, link: l});
    })

    function shortest_path( src, tgt, rank ){
        let visited = new Set()
        let pq = new PriorityQueue([{id:src, cost:0, path:[]}], (a,b)=> (a.cost<b.cost) ? -1 : (a.cost>b.cost)? 1 : 0)
        let curr = null
        do{
            curr = pq.pop()
            if( visited.has(curr.id) ) continue;
            visited.add(curr.id)

            g_link_dict[curr.id].filter( l => l.link.rank < rank ).forEach(n => {
                if( !visited.has(n.node) )
                    pq.push({id: n.node, cost: curr.cost + 1,path: curr.path.concat(n.link)})
            })
        } while( curr.id !== tgt )
        return curr.path
    }


    function find_loop( cycle_link ){
        //let tmp = cycle_link.value
        //cycle_link.value = 0
        let sp = shortest_path(cycle_link.source.id,cycle_link.target.id, cycle_link.rank)
        //cycle_link.value = tmp
        sp.push(cycle_link)
        return sp
    }


    function get_node_order( loop ){
        let cur_node = loop[0].source
        if( loop[0].source === loop[1].source || loop[0].source === loop[1].target )
            cur_node = loop[0].target

        let loop_node_order = [cur_node]
        loop.forEach( l => {
            cur_node = (cur_node === l.target) ? l.source : l.target
            loop_node_order.push( cur_node )
        })
        loop_node_order.pop()
        return loop_node_order
    }


    let loops = []
    st.cycle_links.forEach( cl => {

        let src_links = g_link_dict[cl.source].filter( s => s.link.rank < cl.rank ).map( s => s.node )
        let tgt_links = g_link_dict[cl.target].filter( t => t.link.rank < cl.rank ).map( s => s.node )

        let trivial_cycle = src_links.filter( n => tgt_links.includes(n) ).length > 0

        if( !trivial_cycle ) loops.push({
            link : cl,
            __loop : null,
            __node_order : null,
            birth : cl.value,
            loop : function(){
                if( this.__loop == null ) this.__loop = find_loop(cl)
                return this.__loop
            },
            node_order : function(){
                if( this.__node_order == null ) this.__node_order = get_node_order(this.loop())
                return this.__node_order
            }
        })
    })


    return {
        spanning_tree : st,
        loops: loops
    }
}