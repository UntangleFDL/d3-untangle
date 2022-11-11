/******************************************************************************************/
/******************************************************************************************/
/*                                                                                        */
/* Graph minimum spanning tree implementation                                             */
/*                                                                                        */
/*     Assumptions: Nodes are assumed to have 'id' fields.                                */
/*                  Links are assumed to have 'value' fields used as weight.              */
/******************************************************************************************/
let MaximalSpanningTree = function(graph){
    let djs = DisjointSet(graph.nodes,k=>k.id)

    if( 'value' in graph.links[0] )
        graph.links.sort( (a,b)=> b.value-a.value )

    let st = []
    let notSt = []

    graph.links.forEach( (link,i) => {
        link.rank = i+1
        let rs = djs.find( ( typeof link.source == 'string' ) ? link.source : link.source.id )
        let rt = djs.find( ( typeof link.target == 'string' ) ? link.target : link.target.id )
        if( rs === rt )
            notSt.push(link)
        else{
            djs.join(rs,rt)
            st.push(link)
        }
    })

    return {
        spanning_tree_links: st,
        cycle_links: notSt,
        spanning_tree: function () {
            return {nodes: graph.nodes, links: st}
        },
        node_dictionary: function () {
            let ret = {}
            graph.nodes.forEach(n => {
                ret[n.id] = n;
            })
            return ret
        },
        link_dictionary: function () {
            let ret = {}
            graph.nodes.forEach(n => {
                ret[n.id] = [];
            })
            st.forEach(l => {
                ret[ ( typeof l.source == 'string' ) ? l.source : l.source.id ].push(l.target);
                ret[ ( typeof l.target == 'string' ) ? l.target : l.target.id ].push(l.source);
            })
            return ret
        },
        link_dictionary_weighted: function () {
            let ret = {}
            graph.nodes.forEach(n => {
                ret[n.id] = [];
            })
            st.forEach(l => {
                ret[ ( typeof l.source == 'string' ) ? l.source : l.source.id ].push( { s: l.source, t: l.target, value: l.value } );
                ret[ ( typeof l.target == 'string' ) ? l.target : l.target.id ].push( { s: l.target, t: l.source, value: l.value } );
            })
            return ret
        }
    }
}