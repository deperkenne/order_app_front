sap.ui.define([], function () {
  "use strict";

  class OrderItemService {
    constructor(orderItemRepo, iorderstorageRepo) {
      this.orderItemRepo = orderItemRepo;
      this.iorderstorageRepo = iorderstorageRepo;
    }
    async CreateOrderItem(orderItem) {
      this.orderUuid = this.iorderstorageRepo.getOrderUuid() ?? "";
      if (this.orderUuid !== "") {
        try {
          const savedItem = await this.orderItemRepo.saveOrderItem(orderItem, this.orderUuid);
          return savedItem;
        } catch (error) {
          console.error("Erreur lors de la sauvegarde de l'item:", error);
          return null;
        }
      }
      console.error("Impossible de créer l'item : OrderUuid est manquant.");
      return null;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.OrderItemService = OrderItemService;
  return __exports;
});
//# sourceMappingURL=Order_Item_Service_Impl-dbg.js.map
