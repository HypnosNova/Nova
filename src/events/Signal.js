/**
 * 用于事件处理
 * 
 * */
class Signal {
  constructor(type) {
    this.type = type;
    this.functionArr = [];
  }

  add(func) {
    if (typeof func !== 'function') {
      throw new NotFunctionError();
    } else {
      this.functionArr.push(func);
    }
  }

  remove(func) {
    return _.remove(this.functionArr, function(n) {
      return n === func;
    });
  }

  run(event, intersect) {
    this.functionArr.forEach(
      (func) => {
        func(event, intersect);
      });
  }
}

export {
  Signal
};