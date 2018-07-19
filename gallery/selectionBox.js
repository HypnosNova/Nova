class SelectionBox {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.startPoint = new THREE.Vector3();
        this.endPoint = new THREE.Vector3();
        this.collection = [];
    }

    select(startPoint, endPoint) {
        this.startPoint = startPoint || this.startPoint;
        this.endPoint = endPoint || this.endPoint;
        this.collection = [];
        var boxSelectionFrustum = this.createFrustum(this.startPoint, this.endPoint);
        this.searchChildInFrustum(boxSelectionFrustum, this.scene);
        return this.collection;
    }

    createFrustum(startPoint = this.startPoint, endPoint = this.endPoint) {
        this.camera.updateProjectionMatrix();
        this.camera.updateMatrixWorld();
        this.camera.updateMatrix();

        var tmpPoint = startPoint.clone();
        tmpPoint.x = Math.min(startPoint.x, endPoint.x);
        tmpPoint.y = Math.max(startPoint.y, endPoint.y);
        endPoint.x = Math.max(startPoint.x, endPoint.x);
        endPoint.y = Math.min(startPoint.y, endPoint.y);

        var vec0 = this.camera.position.clone();
        var vec1 = tmpPoint.clone();
        var vec2 = new THREE.Vector3(endPoint.x, tmpPoint.y, 0);
        var vec3 = endPoint.clone();
        var vec4 = new THREE.Vector3(tmpPoint.x, endPoint.y, 0);
        vec1.unproject(this.camera);
        vec2.unproject(this.camera);
        vec3.unproject(this.camera);
        vec4.unproject(this.camera);
        var vectemp1 = vec1.clone().sub(vec0);
        var vectemp2 = vec2.clone().sub(vec0);
        var vectemp3 = vec3.clone().sub(vec0);
        vectemp1.normalize();
        vectemp2.normalize();
        vectemp3.normalize();

        vectemp1.multiplyScalar(Number.MAX_VALUE);
        vectemp2.multiplyScalar(Number.MAX_VALUE);
        vectemp3.multiplyScalar(Number.MAX_VALUE);
        vectemp1.add(vec0);
        vectemp2.add(vec0);
        vectemp3.add(vec0);

        var p0 = new THREE.Plane();
        p0.setFromCoplanarPoints(vec0, vec1, vec2);
        var p1 = new THREE.Plane();
        p1.setFromCoplanarPoints(vec0, vec2, vec3);
        var p2 = new THREE.Plane();
        p2.setFromCoplanarPoints(vec3, vec4, vec0);
        var p3 = new THREE.Plane();
        p3.setFromCoplanarPoints(vec4, vec1, vec0);
        var p4 = new THREE.Plane();
        p4.setFromCoplanarPoints(vec2, vec3, vec4);
        var p5 = new THREE.Plane();
        p5.setFromCoplanarPoints(vectemp3, vectemp2, vectemp1);
        p5.normal = p5.normal.multiplyScalar(-1);
        return new THREE.Frustum(p0, p1, p2, p3, p4, p5);
    }

    searchChildInFrustum(frustum, object) {
        if (object instanceof THREE.Mesh) {
            if (object.material !== undefined) {
                object.geometry.computeBoundingSphere();
                var center = object.geometry.boundingSphere.center.clone().applyMatrix4(object.matrixWorld);
                if (frustum.containsPoint(center)) {
                    this.collection.push(object);
                }
            }
        }
        if (object.children.length > 0) {
            for (var x = 0; x < object.children.length; x++) {
                this.searchChildInFrustum(frustum, object.children[x]);
            }
        }
    }
}