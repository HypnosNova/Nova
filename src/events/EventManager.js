class EventManager {
  constructor(world) {
    world.eventManager = this;
    this.world = world;
    this.disable = false;
    this.isDeep = true;
    this.receivers = world.receivers;
    this.raycaster = new THREE.Raycaster();
    this.centerRaycaster = new THREE.Raycaster();
    this.selectedObj = null;
    this.centerSelectedObj = null;
    this.isDetectingEnter = true;
    let normalEventList = world.app.options.normalEventList;

    function normalEventToHammerEvent(event) {
      return {
        changedPointers: [event],
        center: {
          x: event.clientX,
          y: event.clientY,
        },
        type: event.type,
        target: event.target
      };
    }

    for (let eventItem of normalEventList) {
      world.app.parent.addEventListener(eventItem, (event) => {
        if (this.disable) return;
        this.raycastCheck(normalEventToHammerEvent(event));
      });
    }

    try {
      if (Hammer === undefined) {
        return;
      }
    } catch (e) {
      console.warn('Hammer没有引入，手势事件无法使用，只能使用基础的交互事件。');
      return;
    }
    this.hammer = new Hammer(world.app.renderer.domElement);
    console.log(world.app.options.hammerEventList)
    this.hammer.on(world.app.options.hammerEventList, (event) => {
    	if (this.disable) return;
      this.raycastCheck(event);
    });
  }

  raycastCheck(event) {
    let vec2 = new THREE.Vector2(event.center.x / this.world.app.getWorldWidth() *
      2 - 1, 1 - event.center.y / this.world.app.getWorldHeight() * 2);
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
    if (intersect && intersect.object.events && intersect.object.events[event
        .type]) {
      intersect.object.events[event.type].run(event, intersect);
    }
  }
}

export {
  EventManager
};