
/******************************************************************************************/
/******************************************************************************************/
/*                                                                                        */
/* This function calculates the Jaccard index of nodes connected by links                 */
/*     and applies that number to the value (weight) field of the link                    */
/*                                                                                        */
/******************************************************************************************/
function calculate_jaccard_weights(graph){
    let link_dict = {}

    graph.nodes.forEach(n => {
        link_dict[n.id] = new Set([n.id])
    })

    graph.links.forEach(l => {
        link_dict[l.source].add(l.target);
        link_dict[l.target].add(l.source);
    })

    graph.links.forEach(l => {
        let a = link_dict[l.source]
        let b = link_dict[l.target]
        let union = new Set([...a, ...b]);
        let intersection = new Set([...a].filter(x => b.has(x)));
        l.value = intersection.size / union.size
    } )
}