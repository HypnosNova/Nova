class Screenshoter {
    constructor(world) {
        this.world = world;
        this.options = this.world.app.options;
        this.renderer = new THREE.WebGLRenderer({
            antialias: this.options.renderer.antialias,
            precision: this.options.renderer.precision,
            alpha: this.options.renderer.alpha,
            logarithmicDepthBuffer: this.options.renderer.logarithmicDepthBuffer
        });
    }

    quickShot(imgType = "jpeg", isDom = false) {
        let imgData = this.world.app.renderer.domElement.toDataURL("image/" + imgType);
        if (isDom) {
            let img = new Image();
            img.src = imgData;
            return img;
        } else {
            return imgData;
        }
    }

    renderAndShot(imgType = "jpeg", isDom = false) {
        this.world.app.renderer.render(this.world.scene, this.world.camera);
        return this.quickShot(imgType, isDom);
    }

    renderScreenShot(width = this.world.app.getWorldWidth(), height = this.world.app.getWorldHeight(), imgType = "jpeg", isDom = false) {
        this.renderer.setClearColor(this.options.renderer.clearColor,
            this.options.renderer.clearAlpha);
        this.renderer.setSize(width, height);
        let camera = this.world.camera.clone();
        if (camera.type === 'PerspectiveCamera') {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        } else {
            camera.left = -width / 2;
            camera.right = width / 2;
            camera.top = height / 2;
            camera.bottom = -height / 2;
            camera.updateProjectionMatrix();
        }

        this.renderer.render(this.world.scene, camera);
        let imgData = this.renderer.domElement.toDataURL("image/" + imgType);
        if (isDom) {
            let img = new Image();
            img.src = imgData;
            return img;
        } else {
            return imgData;
        }
    }
}