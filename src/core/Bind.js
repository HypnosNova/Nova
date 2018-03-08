class Bind {
  constructor(obj) {
    for (let i in obj) {
      this[i] = obj[i];
      this.defineReactive(this, i, this[i]);

    }
  }

  add(obj, func) {

  }

  defineReactive(data, key, val) {
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      set: function(newVal) {
        val = newVal;
      }
    });
  }
}
export {
  Bind
};