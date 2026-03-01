sap.ui.define(["../../MyError/oDataRequestError", "../../model/Zproduct"], function (____MyError_oDataRequestError, ____model_Zproduct) {
  "use strict";

  const ODataRequestError = ____MyError_oDataRequestError["ODataRequestError"];
  const Zproduct = ____model_Zproduct["Zproduct"];
  class ZProductImpl {
    constructor(oModel, oDataRequestErrorHelper) {
      this.oModel = oModel;
      this.oDataRequestErrorHelper = oDataRequestErrorHelper;
    }
    async saveProduct(zproduct) {
      const oPayload = {
        ProductId: zproduct.ProductId,
        Productname: zproduct.Productname,
        Price: zproduct.Price,
        Currency: zproduct.Currency,
        Stock: zproduct.Stock
      };

      // Appel à l'ODataModel
      return new Promise((resolve, reject) => {
        this.oModel.create("/Products", oPayload, {
          success: oData => {
            // On retourne le nouvel objet créé (souvent enrichi par le backend)
            resolve(new Zproduct(oData));
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
    async deleteByProductId(productId) {
      return true;
    }
    async updateByProductId(productId) {}
    async findByProductId(productId) {
      return null;
    }
    async findAll() {
      return new Promise((resolve, reject) => {
        this.oModel.read("/Products", {
          success: oData => {
            resolve(oData.results);
          },
          error: oError => {
            let message = "unknow error";
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
  __exports.ZProductImpl = ZProductImpl;
  return __exports;
});
//# sourceMappingURL=ZProductImpl-dbg.js.map
