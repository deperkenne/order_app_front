sap.ui.define([], function () {
  "use strict";

  class CartPersistence {
    constructor(storage) {
      this.storage = storage;
    }
    save(items, total, count) {
      this.storage.setOrderItem("myCart", JSON.stringify(items));
      this.storage.setOrderItem("myTotal", total);
      this.storage.setOrderItem("myCount", String(count));
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.CartPersistence = CartPersistence;
  return __exports;
});
//# sourceMappingURL=CartPersistence-dbg.js.map
