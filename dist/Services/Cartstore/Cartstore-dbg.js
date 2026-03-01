sap.ui.define([], function () {
  "use strict";

  class CartStore {
    constructor(model) {
      this.model = model;
    }
    getItems() {
      return this.model.getProperty("/filteredItems") || [];
    }
    setItems(items) {
      this.model.setProperty("/filteredItems", items);
    }
    setTotal(total) {
      this.model.setProperty("/totalAmount", total);
    }
    setCount(count) {
      this.model.setProperty("/countSelectedProduct", count);
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.CartStore = CartStore;
  return __exports;
});
//# sourceMappingURL=Cartstore-dbg.js.map
