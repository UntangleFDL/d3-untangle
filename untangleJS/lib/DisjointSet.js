
/******************************************************************************************/
/******************************************************************************************/
/*                                                                                        */
/* Generic disjoint set / set union / union find implementation                           */
/*                                                                                        */
/******************************************************************************************/
let DisjointSet = function( keys, key_func=k=>k ) {
    let djs = {}
    let num_sets = keys.length
    keys.forEach(k=>djs[key_func(k)]=key_func(k))

    return {
        find : function(key){
            if( key !== djs[key] ) djs[key] = this.find(djs[key])
            return djs[key]
        },
        join : function(key1,key2){
            let root1 = this.find(key1)
            let root2 = this.find(key2)
            if( root1 !== root2 ) num_sets--
            djs[root2] = root1
            return root1
        },
        number_of_sets : function(){
            return num_sets
        }
    }
}




