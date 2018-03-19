class IPhone {
  constructor(app, group) {
    this.app = app;
    this.group = group;
    this.screen = {
      mesh: group.children[9],
      isHorizontal: false
    };
    this.curentFBOWorld = new NOVA.FBOWorld();
    this.app.world.scene.add(this.group);
    this.app.logicLoop.add(()=>{
    	this.update();
    });
  }

  setFBOWorld(world) {
    this.curentFBOWorld = world;
    this.screen.mesh.material.map = world.fbo.texture;
  }

  update() {
    if (this.curentFBOWorld) {
      this.curentFBOWorld.update();
    }
  }
}