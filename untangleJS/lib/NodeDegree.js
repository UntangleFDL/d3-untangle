/******************************************************************************************/
/******************************************************************************************/
/*                                                                                        */
/* This function calculates the Degree of each node in the graph                          */
/*                                                                                        */
/******************************************************************************************/
function calculate_node_degree(graph){
    let node_dict = {}

    graph.nodes.forEach(n => {
        n.degree = 0
        node_dict[n.id] = n
    })

    graph.links.forEach(l => {
        node_dict[l.source].degree += 1
        node_dict[l.target].degree += 1
    })

    let tmpDeg = graph.nodes.map( n => n.degree )
    tmpDeg.sort( (a,b) => (a-b) )
    let prior = -1, cnt = 0, degMap = {}
    tmpDeg.forEach( d => {
        if( d === prior ) return
        degMap[d] = cnt
        prior = d
        cnt++
    })

    graph.nodes.forEach(n => {
        n.degreeRank = degMap[n.degree]
    })
}