class EventManager {
  constructor(world) {
    try {
    	if(Hammer===undefined){
    		return;
    	}
    } catch (e) {
      console.warn('Hammer没有引入导致鼠标或触屏事件功能无法使用。Nova的事件引擎依赖Hammer。');
      return;
    }
    
    world.eventManager = this;
    this.world = world;
    this.isDeep = true;
    this.receivers = world.receivers;
    this.raycaster = new THREE.Raycaster();
    this.centerRaycaster = new THREE.Raycaster();
    this.selectedObj = null;
    this.centerSelectedObj = null;
    this.isDetectingEnter = true;
    this.hammer = new Hammer(world.app.renderer.domElement);
    this.hammer.on('pan press tap pressup', (event) => {
      this.raycastCheck(event);
    });
  }

  raycastCheck(event) {
    let vec2 = new THREE.Vector2(event.center.x / this.world.app.getWorldWidth() *
      2 - 1, event.center.y / this.world.app.getWorldHeight() * 2 - 1);
    this.raycaster.setFromCamera(vec2, this.world.camera);
    let intersects = this.raycaster.intersectObjects(this.world.receivers,
      this.isDeep);

    let intersect;
    for (let i = 0; i < intersects.length; i++) {
      if (intersects[i].object.isPenetrated) {
        continue;
      } else {
        intersect = intersects[i];
        break;
      }
    }
    if (intersect) {
      intersect.object.events[event.type].run(event, intersect);
    }

  }
}

export {
  EventManager
};