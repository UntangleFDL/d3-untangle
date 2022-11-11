
if (Array.prototype.revEach === undefined) {
    Object.defineProperty(Array.prototype, 'revEach', {
        writable : false,
        enumerable : false,
        configurable : false,
        value : function (func) {
            for (let i = this.length-1; i >= 0; i--) {
                func(this[i], i, this);
            }
        }
    });
}


let SpanningTreeLayout = function( graph, st=null ) {

    if( st == null ) st = MaximalSpanningTree(graph)

    let node_dict = st.node_dictionary()
    let link_dict = st.link_dictionary()

    function lerp( v_min, v_max, t){
        return v_min + (v_max-v_min)*t
    }

    function initialize_tree(root=null){
        if( root == null && typeof(st.spanning_tree_links[0].source) == 'object') root = st.spanning_tree_links[0].source
        if( root == null && typeof(st.spanning_tree_links[0].source) != 'object') root = node_dict[st.spanning_tree_links[0].source]

        let treeNodes = {}
        let visited = new Set()
        let queue = [root.id]
        let curIdx = 0

        while (curIdx < queue.length) {
            let currID = node_dict[queue[curIdx]].id
            treeNodes[currID] = {children:[],subtree_size:1,layer:0,range:[0, 1]}
            link_dict[currID].forEach(currNeighbor => {
                if (!visited.has(currNeighbor)) {
                    queue.push(currNeighbor);
                    treeNodes[currID].children.push(currNeighbor)
                }
            })
            visited.add(currID)
            curIdx++
        }

        return { 'queue': queue, 'root':root.id, 'treeNodes': treeNodes }
    }

    function calculate_subtrees( tree ){
        tree.queue.revEach( currID => {
            tree.treeNodes[currID].children.forEach( childID =>{
                tree.treeNodes[currID].subtree_size += tree.treeNodes[childID].subtree_size
            })
        })
    }

    function abstract_layout( tree ) {
        tree.queue.forEach( currID => {
            let currLink = tree.treeNodes[currID]
            let cur_subtree = 0, tot_subtree = currLink.subtree_size-1
            currLink.children.forEach(childID => {
                tree.treeNodes[childID].layer = currLink.layer + 1
                tree.treeNodes[childID].range[0] = lerp( currLink.range[0], currLink.range[1], cur_subtree / tot_subtree )
                cur_subtree += tree.treeNodes[childID].subtree_size
                tree.treeNodes[childID].range[1] = lerp( currLink.range[0], currLink.range[1], cur_subtree / tot_subtree )
            })
        })
    }

    function layered_layout( tree, x_range, y_range ) {
        let max_layer = d3.max(tree.queue, n => tree.treeNodes[n].layer)
        tree.queue.forEach( currID => {
            let treeNode = tree.treeNodes[currID]
            let node = node_dict[currID]
            node.x = lerp( x_range[0], x_range[1], (treeNode.range[0] + treeNode.range[1]) / 2 )
            node.y = lerp( y_range[0], y_range[1], treeNode.layer / max_layer )
        })
    }

    function radial_layout( tree, x_range, y_range ) {
        let max_layer = d3.max(tree.queue, n => tree.treeNodes[n].layer)
        let radius = Math.min(x_range[1] - x_range[0], y_range[1] - y_range[0]) / 2
        tree.queue.forEach( currID => {
            let treeNode = tree.treeNodes[currID]
            let node = node_dict[currID]
            let ang = lerp(0,2*Math.PI, (treeNode.range[0] + treeNode.range[1]) / 2 )
            let rad = radius * treeNode.layer / max_layer
            node.x = lerp( x_range[0], x_range[1], 0.5) + rad * Math.cos(ang)
            node.y = lerp( y_range[0], y_range[1], 0.5) + rad * Math.sin(ang)
        })
    }

    return {
        spanning_tree: function (){
            return st
        },
        layered_layout : function(x_range=[0,1000], y_range=[0,1000], root = null){
            let tree = initialize_tree(root)
            calculate_subtrees(tree)
            abstract_layout(tree)
            layered_layout(tree, x_range,y_range)
        },
        radial_layout : function(x_range=[0,1000], y_range=[0,1000], root = null){
            let tree = initialize_tree(root)
            calculate_subtrees(tree)
            abstract_layout(tree)
            radial_layout(tree, x_range,y_range)
        }
    }

}

