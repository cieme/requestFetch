export default {
  forEach(obj: any, fn: any) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === "undefined") {
      return;
    }

    // Force an array if not already something iterable
    if (typeof obj !== "object") {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }

    if (Array.isArray(obj)) {
      // Iterate over array values
      for (var i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // Iterate over object keys
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(null, obj[key], key, obj);
        }
      }
    }
  },
  /* 克隆 */
  extend(a: any, b: any, thisArg?: any) {
    const _this = this;
    this.forEach(b, function (val: any, key: any) {
      if (thisArg && typeof val === "function") {
        a[key] = _this.bind(val, thisArg);
      } else {
        a[key] = val;
      }
    });
    return a;
  },
  /* bind */
  bind(fn: Function, thisArg: any) {
    return function wrap() {
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      return fn.apply(thisArg, args);
    };
  },
};
