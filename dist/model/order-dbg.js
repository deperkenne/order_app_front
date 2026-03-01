sap.ui.define([], function () {
  "use strict";

  class Order {
    constructor(dbOrder) {
      this.OrderUuid = dbOrder.OrderUuid;
      this.OrderId = dbOrder.OrderId;
      this.CustomerId = dbOrder.CustomerId;
      this.TotalAmount = dbOrder.TotalAmount;
      this.Currency = dbOrder.Currency;
      this.Status = dbOrder.Status;
      this.TotalAmount = dbOrder.TotalAmount;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.Order = Order;
  return __exports;
});
//# sourceMappingURL=order-dbg.js.map
