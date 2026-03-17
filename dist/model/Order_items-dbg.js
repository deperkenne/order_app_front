sap.ui.define([], function () {
  "use strict";

  class OrderItem {
    constructor(dbItems) {
      this.ItemId = dbItems.ItemId;
      this.ProductId = dbItems.CustomerId;
      this.ProductName = dbItems.TotalAmount;
      this.Quantity = dbItems.Currency;
      this.Unit = dbItems.Status;
      this.Price = dbItems.ItemId;
      this.Currency = dbItems.Currency;
      this.GrossAmount = dbItems.GrossAmount;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.OrderItem = OrderItem;
  return __exports;
});
//# sourceMappingURL=Order_items-dbg.js.map
