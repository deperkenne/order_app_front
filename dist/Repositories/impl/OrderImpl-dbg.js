sap.ui.define(["../../model/order", "../../MyError/oDataRequestError", "../../model/Order_items"], function (____model_order, ____MyError_oDataRequestError, ____model_Order_items) {
  "use strict";

  const Order = ____model_order["Order"];
  const ODataRequestError = ____MyError_oDataRequestError["ODataRequestError"];
  const OrderItem = ____model_Order_items["OrderItem"];
  class OrderImpl {
    constructor(oModel, oDataRequestErrorHelper) {
      this.oModel = oModel;
      this.oDataRequestErrorHelper = oDataRequestErrorHelper;
    }
    async createOrder(order) {
      const oPayload = {
        CustomerId: order.CustomerId,
        OrderId: order.OrderId,
        Currency: order.Currency,
        Status: order.Status
      };

      //  Appel à l'ODataModel
      return new Promise((resolve, reject) => {
        this.oModel.create("/Orders", oPayload, {
          success: oData => {
            // On retourne le nouvel objet créé (souvent enrichi par le backend)
            resolve(new Order(oData));
          },
          error: oError => {
            reject(this.handleODataError(oError));
          }
        });
      });
    }
    async getOrderWithFilteredItems(orderUuid, productId) {
      const sPath = `/Orders(OrderUuid=guid'${orderUuid}',IsActiveEntity=false)`;
      const oUrlParameters = {
        $select: "TotalAmount",
        $expand: "to_Items",
        "to_Items/$filter": `ProductId eq '${productId}'`,
        "to_Items/$select": "ItemId,ProductId,GrossAmount,Quantity,CreatedAt",
        "to_Items/$orderby": "CreatedAt asc",
        "to_Items/$top": "1"
      };
      return new Promise((resolve, reject) => {
        this.oModel.read(sPath, {
          urlParameters: oUrlParameters,
          success: oData => {
            const order = new Order({
              TotalAmount: oData.TotalAmount
            });
            const items = oData.to_Items.results.map(item => new OrderItem(item));
            resolve({
              order,
              items
            });
          },
          error: oError => {
            reject(this.handleODataError(oError));
          }
        });
      });
    }
    handleODataError(oError) {
      let message = "Erreur inconnue";
      let statusCode;
      try {
        statusCode = Number(oError.statusCode);
        if (oError.responseText) {
          const oResponse = JSON.parse(oError.responseText);
          message = oResponse?.error?.message?.value || message;
        }
      } catch (e) {
        message = oError.message || "Erreur lors du parsing";
      }
      return new ODataRequestError(message, statusCode);
    }
    async getOrderId(orderUuid) {
      return [];
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.OrderImpl = OrderImpl;
  return __exports;
});
//# sourceMappingURL=OrderImpl-dbg.js.map
