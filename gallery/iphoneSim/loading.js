var materialsUpdate = [{
  name: "第0个是左边3个声音按键",
  color: 0
}, {
  name: "第1个是指纹按钮外面的圈圈",
  color: 0x995500
}, {
  name: "第2个是左边3个声音按键",
  color: 0xeeddaa
}, {
  name: "第3个是多个部位的轮廓",
  color: 0
}, {
  name: "第4个是左边3个声音按键",
  color: 0xeeddaa
}, {
  name: "第5个是多个部位的轮廓",
  color: 0
}, {
  name: "第6个是多个部位的轮廓",
  color: 0xaa8800
}, {
  name: "第7个是正面框架",
  color: 0xeeeeee
}, {
  name: "第8个是正面框架",
  color: 0xeeeeee
}, {
  name: "第9个是屏幕", //---------------------
  color: 0xffffff
}, {
  name: "第10个是正面轮廓圈",
  color: 0xffddaa
}, {
  name: "第11个是前后摄像头的中心点",
  color: 0x332200
}, {
  name: "第12个是摄像头里面的玻璃片2个",
  color: 0xaaaaaa
}, {
  name: "第13个是正面框架",
  color: 0xeeeeee
}, {
  name: "第14个是正面框架",
  color: 0xeeeeee
}, {
  name: "第15个是三段式后盖",
  color: 0xffddaa
}, {
  name: "第16个是三段式条纹",
  color: 0xeeddaa
}, {
  name: "第17个是三段式条纹",
  color: 0xeeddaa
}, {
  name: "第18个是三段式条纹",
  color: 0xeeddaa
}, {
  name: "第19个是三段式条纹",
  color: 0xeeddaa
}, {
  name: "第20个是周围侧边一圈按键",
  color: 0xeeddaa
}, {
  name: "第21个是后置摄像头右边",
  color: 0xffaa66
}, {
  name: "第22个不知道是啥",
  color: 0
}, {
  name: "第23个不知道是啥",
  color: 0
}, {
  name: "第24个不知道是啥",
  color: 0
}, {
  name: "第25个按钮和后置摄像头的环",
  color: 0xaa8800
}, {
  name: "第26个按钮和后置摄像头的环",
  color: 0xaa8800
}, {
  name: "第27个是前后摄像头的中心点",
  color: 0x332200
}, {
  name: "第28个是正面框架加背后摄像头圈",
  color: 0xeeeeee
}, {
  name: "第29个是正面轮廓圈",
  color: 0xffddaa
}, {
  name: "第30个不知道",
  color: 0
}, {
  name: "第31个镜片",
  color: 0
}, {
  name: "第32个是周围侧边一圈按键",
  color: 0xeeddaa
}, {
  name: "第33个是正面框架",
  color: 0xeeeeee
}, {
  name: "第34不知道",
  color: 0
}];

function fixColor(obj) {
  for (let i in materialsUpdate) {
    obj.children[i].material.color = new THREE.Color(materialsUpdate[i].color);
  }
}

function createProgress() {
  let geometry = new THREE.PlaneBufferGeometry(10, 1);
  let material = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    side: THREE.DoubleSide,
    transparent: true
  });
  plane = new THREE.Mesh(geometry, material);
  plane.scale.x = 0.01;
  app.world.scene.add(plane);
  plane.position.z = -30;
  numberTxt = new NOVA.Txt("0%", {
    fontSize: 40,
    width: 180,
    height: 40,
    scale: {
      x: 0.1,
      y: 0.1,
      z: 1
    }
  });
  numberTxt.position.z = -29;
  app.world.scene.add(numberTxt);
}

function createLoadFactory() {
  let loader = new NOVA.LoaderFactory();
  loader.loadTexture("bg", "assets/images/bg.jpg");
  window.RESOURCE = loader.Resource;
  let mtlLoader = new THREE.MTLLoader(loader.manager);
  mtlLoader.setPath('../assets/model/iPhone/');
  mtlLoader.load('iphone_6_model.mtl', function(materials) {
    materials.preload();
    var objLoader = new THREE.OBJLoader(loader.manager);
    objLoader.setMaterials(materials);
    objLoader.setPath('../assets/model/iPhone/');
    objLoader.load('iphone_6_model.obj', function(obj) {
      window.iphoneGroup = obj;
    });
  });

  loader.onProgress = (url, itemsLoaded, itemsTotal) => {
    TWEEN.removeAll();
    new TWEEN.Tween(plane.scale)
      .to({ x: itemsLoaded / itemsTotal }, 300)
      .start()
      .onUpdate(() => {
        numberTxt.text = Math.round(plane.scale.x * 100) + "%";
        numberTxt.update();
      });
  }

  loader.onLoad = () => {
    setTimeout(() => {
      new TWEEN.Tween(numberTxt.material)
        .to({ opacity: 0 }, 500)
        .start();
      new TWEEN.Tween(plane.material)
        .to({ opacity: 0 }, 500)
        .start()
        .onComplete(() => {
          app.world.scene.remove(numberTxt);
          app.world.scene.remove(plane);

          new THREE.OrbitControls(app.world.camera);
          fixColor(window.iphoneGroup);
          window.IPHONE = new IPhone(app, window.iphoneGroup);
          let novaWorld = new NovaWorld(app);
          window.IPHONE.setFBOWorld(novaWorld);
        });
    }, 300);
  }
}