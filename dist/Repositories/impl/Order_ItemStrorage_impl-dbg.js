sap.ui.define([], function () {
  "use strict";

  class OrderItemStorage {
    getOrderItem(key) {
      return localStorage.getItem(key);
    }
    setOrderItem(key, orderItem) {
      try {
        localStorage.setItem(key, orderItem);
      } catch (error) {
        console.error('Erreur sauvegarde cart:', error);
      }
    }
    clearOrderItem(key) {
      localStorage.removeItem(key);
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.OrderItemStorage = OrderItemStorage;
  return __exports;
});
//# sourceMappingURL=Order_ItemStrorage_impl-dbg.js.map
