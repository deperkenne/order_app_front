sap.ui.define([], function () {
  "use strict";

  class OrderService {
    constructor(orderRepo, iorderstorageRepo) {
      this.orderRepo = orderRepo;
      this.iorderstorageRepo = iorderstorageRepo;
    }
    async saveOrder(order) {
      try {
        const savedOrder = await this.orderRepo.createOrder(order);
        console.log('Réponse complète SAP:', JSON.stringify(savedOrder, null, 2));
        const orderUuid = savedOrder?.OrderUuid;
        if (savedOrder && orderUuid) {
          // Sauvegarde dans le sessionStorage pour lier les futurs OrderItems
          this.iorderstorageRepo.setOrderUuid(orderUuid);
          console.log("UUID de commande synchronisé avec le stockage local.");
        } else {
          console.warn("La commande a été créée mais aucun UUID n'a été retourné par SAP.");
        }
        return savedOrder;
      } catch (error) {
        console.error("Error during saved order", error);
        throw error;
      }
    }
    async getOrderWithItems(orderUuid, productId) {
      return this.orderRepo.getOrderWithFilteredItems(orderUuid, productId);
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.OrderService = OrderService;
  return __exports;
});
//# sourceMappingURL=OrderService-dbg.js.map
