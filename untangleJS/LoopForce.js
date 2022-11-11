function LoopForce(_loop) {

    let loop = _loop
    let g_aspect = 2

    function n_sub(p0,p1){
        return [p0.x-p1.x,p0.y-p1.y]
    }

    function v_cross(p0,p1){
        return p0[0]*p1[1]-p0[1]*p1[0]
    }

    function v_div(v,div){
        return [v[0]/div,v[1]/div]
    }

    function v_perpendicular(v){
        return [-v[1], v[0]]
    }

    function v_mag(v){
        return Math.sqrt((v[0] * v[0]) + (v[1] * v[1]));
    }

    function map( input, in_min, in_max, out_min, out_max){
        let t = (input-in_min) / (in_max-in_min)
        return out_min * (1-t) + out_max * t
    }

    function map3( input, in_min, in_mid, in_max, out_min, out_mid, out_max){
        if( input < in_mid ) return map(input,in_min,in_mid,out_min,out_mid)
        return map(input,in_mid,in_max,out_mid,out_max)
    }

    let max_diameter = {diam: 0, cx: null, cy: null}

    for (let i = 0; i < loop.length; i++) {
        let n0 = loop[i]
        for (let j = i + 1; j < loop.length; j++) {
            let n1 = loop[j]
            let dx = n1.x - n0.x;
            let dy = n1.y - n0.y;
            let d = Math.sqrt((dx * dx) + (dy * dy));
            if (d > max_diameter.diam) max_diameter = {
                diam: d,
                i: i, j: j,
                n0: n0, n1: n1
            }
        }
    }

    function find_loop_diameter(){

        let dxy = n_sub(max_diameter.n1,max_diameter.n0)
        max_diameter.diam = v_mag(dxy)
        max_diameter.cx = (loop[max_diameter.i].x + loop[max_diameter.j].x)/2
        max_diameter.cy = (loop[max_diameter.i].y + loop[max_diameter.j].y)/2
        max_diameter.lineDir = v_div(dxy, max_diameter.diam)
        max_diameter.lineTan = v_perpendicular(max_diameter.lineDir)

        if( v_cross(max_diameter.lineTan,max_diameter.lineDir) < 0 )
            max_diameter.lineTan = [-max_diameter.lineTan[0],-max_diameter.lineTan[1]]
        return max_diameter
    }

    function calculate_elliptical_target(i,max_diam,rev_orientation,aspect=2){
        let t = (i - max_diam.i) / (max_diam.j - max_diam.i)
        let revTan = 1
        if( i < max_diam.i ) i += loop.length
        if( i > max_diam.j ) {
            t = 1 - (i-max_diam.j) / (max_diam.i + loop.length - max_diam.j)
            revTan = -1
        }

        if(rev_orientation) revTan = -revTan

        let tx = max_diam.cx +
                 map3(t,0,0.5,1,-max_diam.lineDir[0],0,max_diam.lineDir[0]) * max_diam.diam / 2 +
                 map3(t,0,0.5,1,0,max_diam.lineTan[0]*revTan,0) * max_diam.diam / 2 / aspect
        let ty = max_diam.cy +
                 map3(t,0,0.5,1,-max_diam.lineDir[1],0,max_diam.lineDir[1]) * max_diam.diam / 2 +
                 map3(t,0,0.5,1,0,max_diam.lineTan[1]*revTan,0) * max_diam.diam / 2 / aspect

        return [tx,ty]
    }

    function getTargets(max_diam,rev_orientation){
        let targets = []
        let total_displacement = 0;
        loop.forEach( (n,i) => {
            let t;
            if (i === max_diameter.i || i === max_diameter.j) {
                t = [n.x,n.y]
            }
            else {
                t = calculate_elliptical_target(i, max_diam, rev_orientation, g_aspect)
            }
            let tx = t[0]-n.x
            let ty = t[1]-n.y
            targets.push(t)
            total_displacement += Math.sqrt(tx * tx + ty * ty)
        })
        return [total_displacement,targets]
    }

    let orientation = null

    function force(alpha) {

        let max_diameter = find_loop_diameter()

        if(orientation === null) {
            let targetsF = getTargets(max_diameter, false)
            let targetsB = getTargets(max_diameter, true)
            orientation = targetsB[0]<targetsF[0]
        }


        loop.forEach( (n,i) => {

            if( i === max_diameter.i || i === max_diameter.j ) return

            let target = calculate_elliptical_target(i, max_diameter, orientation, g_aspect)

            let dx = n.x - max_diameter.cx
            let dy = n.y - max_diameter.cy

            let qx = target[0] - max_diameter.cx
            let qy = target[1] - max_diameter.cy
            let qd = Math.sqrt(qx * qx + qy * qy)

            if( dx*qx+dy*qy < qd*qd ) {
                n.vx += (target[0]-n.x) * alpha * 2
                n.vy += (target[1]-n.y) * alpha * 2
            }

        })

    }

    force.strength = function(s){
        g_aspect = 1/s
    }

    return force;
}
