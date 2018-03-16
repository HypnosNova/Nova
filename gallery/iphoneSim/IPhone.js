class IPhone {
  constructor(app, group) {
    this.app = app;
    this.group = group;
    this.screen = {
      mesh: group.children[9],
      isHorizontal: false
    };
    this.curentApp = undefined;
    this.app.world.scene.add(this.group);
  }
}