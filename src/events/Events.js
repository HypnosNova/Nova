import { Signal } from './Signal';

/**
 * 由于事件处理
 * 
 * */
class Events {
  constructor(list) {
    list = list || ['press', 'tap', 'pressup', 'pan', 'swipe', 'click',
      'mousedown', 'mouseup', 'touchstart', 'touchend', 'touchmove',
      'mousemove'
    ];
    for (let eventItem of list) {
      this[eventItem] = new Signal(eventItem);
    }
  }
}

export {
  Events
};