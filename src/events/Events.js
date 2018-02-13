import { Signal } from './Signal';

/**
 * 由于事件处理
 * 
 * */
class Events {
  constructor() {
    this.press = new Signal('press');
    this.pressup = new Signal('pressup');
    this.tap = new Signal('tap');
    this.enter = new Signal('enter');
    this.leave = new Signal('leave');
    this.pan = new Signal('pan');
    this.panleft = new Signal('panleft');
    this.panright = new Signal('panright');
    this.panstart = new Signal('panstart');
    this.pandown = new Signal('pandown');
    this.panup = new Signal('panup');
  }
}

export {
  Events
};