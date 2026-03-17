sap.ui.define(["../../model/Stock", "../../MyError/oDataRequestError", "sap/m/MessageBox", "sap/m/MessageToast"], function (____model_Stock, ____MyError_oDataRequestError, MessageBox, MessageToast) {
  "use strict";

  const Stock = ____model_Stock["Stock"];
  const ODataRequestError = ____MyError_oDataRequestError["ODataRequestError"];
  class StockImpl {
    constructor(oModel, oDataRequestErrorHelper) {
      this.oModel = oModel;
      this.oDataRequestErrorHelper = oDataRequestErrorHelper;
    }
    async saveStock(stock) {
      //  Préparer les données (on convertit l'instance de classe en objet simple)
      const oPayload = {
        StockId: stock.StockId,
        ProductId: stock.ProductId,
        SkuId: stock.SkuId,
        Quantity: stock.Quantity,
        AvailableQuantity: stock.AvailableQuantity
      };

      //  Appel à l'ODataModel
      return new Promise((resolve, reject) => {
        this.oModel.create("/Stock", oPayload, {
          success: oData => {
            // On retourne le nouvel objet créé (souvent enrichi par le backend)
            resolve(new Stock(oData));
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
    async deleteByStockId(stockId) {
      return true;
    }
    async updateByStockId(stockId, updateQuantity) {
      const sPath = this.oModel.createKey("/Stock", {
        StockId: stockId
      });
      const oPayload = {
        Quantity: updateQuantity
      };
      this.oModel.update(sPath, oPayload, {
        success: () => {
          MessageToast.show("Stock mis à jour avec succès");
        },
        error: oError => {
          let message = "error durring uodate stock";
          if (oError.responseText) {
            const oResponse = JSON.parse(oError.responseText);
            message = oResponse?.error?.message?.value || message;
          }
          MessageBox.error(message);
        }
      });
    }
    async findByStockId(stockId) {
      return null;
    }
    async findAll() {
      return new Promise((resolve, reject) => {
        this.oModel.read("/Stock", {
          success: oData => {
            resolve(oData.results);
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
  }
  var __exports = {
    __esModule: true
  };
  __exports.StockImpl = StockImpl;
  return __exports;
});
//# sourceMappingURL=StockImpl-dbg.js.map
