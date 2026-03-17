sap.ui.define(["../../model/Order_items", "../../MyError/oDataRequestError"], function (____model_Order_items, ____MyError_oDataRequestError) {
  "use strict";

  const OrderItem = ____model_Order_items["OrderItem"];
  const ODataRequestError = ____MyError_oDataRequestError["ODataRequestError"];
  class OrderItemImpl {
    constructor(oModel, oDataRequestErrorHelper) {
      this.oModel = oModel;
      this.oDataRequestErrorHelper = oDataRequestErrorHelper;
    }
    async saveOrderItem(orderItem, orderUuid) {
      const oPayload = {
        ProductId: orderItem.ProductId,
        ProductName: orderItem.ProductName,
        Quantity: orderItem.Quantity,
        Unit: orderItem.Unit,
        Price: orderItem.Price,
        Currency: orderItem.Currency
      };
      const sPath = `/Orders(OrderUuid=guid'${orderUuid}',IsActiveEntity=false)/to_Items`;

      //  Appel à l'ODataModel
      return new Promise((resolve, reject) => {
        this.oModel.create(sPath, oPayload, {
          success: oData => {
            // On retourne le nouvel objet créé (souvent enrichi par le backend)
            resolve(new OrderItem(oData));
          },
          error: oError => {
            let message = "Erreur inconnue";
            let statusCode;
            try {
              statusCode = Number(oError.statusCode);
              if (oError.responseText) {
                const oResponse = JSON.parse(oError.responseText);
                message = oResponse?.error?.message?.value || message;
              }
            } catch (e) {
              message = oError.message;
            }
            reject(new ODataRequestError(message, statusCode));
          }
        });
      });
    }
    async findAll() {
      return [];
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.OrderItemImpl = OrderItemImpl;
  return __exports;
});
//# sourceMappingURL=Order_ItemsImpl-dbg.js.map
