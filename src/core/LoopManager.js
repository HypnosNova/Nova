import { NotFunctionError } from './../error/NotFunctionError.js';

class LoopManager {
  constructor(cycleLevel = 1) {
    //当它是true，不执行该循环
    this.disable = false;
    //记录循环次数
    this.times = 0;
    //每隔多少循环执行一次update，用于调整fps。数字越大，fps越低
    this.cycleLevel = cycleLevel <= 1 ? 1 : cycleLevel;
    this.functionMap = new Map();
  }

  update(time) {
    this.times++;
    if (this.disable || (this.times % this.cycleLevel) !== 0) {
      return;
    }
    this.functionMap.forEach((value) => {
      value();
    });
  }

  add(func, key) {
    if (typeof func !== 'function') {
      throw new NotFunctionError();
    } else {
      if (key) {
        this.functionMap.set(key, func);
      } else {
        key = Symbol();
        this.functionMap.set(key, func);
        return key;
      }
    }
  }

  removeAll() {
    this.functionMap.clear();
  }

  remove(funcOrKey) {
    if (typeof funcOrKey === 'function') {
      this.functionMap.forEach((value, key) => {
        if (value === funcOrKey) {
          return this.functionMap.delete(key);
        }
      });
      return false;
    } else {
      return this.functionMap.delete(funcOrKey);
    }
  }
}

export {
  LoopManager
};