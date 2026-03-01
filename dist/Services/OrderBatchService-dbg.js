sap.ui.define([], function () {
  "use strict";

  class BatchService {
    constructor(oModel, oDataRequestErrorHelper) {
      this.oDataModel = oModel;
      this.oDataRequestErrorHelper = oDataRequestErrorHelper;
      this.oDataModel.setDeferredGroups(["OrderBatchGroup"]);
    }
    async deleteProductAndRefresh(Item, OrderUuid) {
      const sPath1 = `/decrease_quantity`;
      const gId = "OrderBatchGroup";
      const oUrlParameters = {
        groupId: gId,
        ItemUuid: Item.itemUuid,
        IsActiveEntity: false
      };
      // Post pour delete l'item
      this.oDataModel.callFunction(sPath1, {
        method: "POST",
        groupId: gId,
        urlParameters: {
          ItemUuid: Item.itemUuid,
          IsActiveEntity: false
        }
      });
      const sPath = `/Orders(OrderUuid=guid'${OrderUuid}',IsActiveEntity=false)`;

      //  GET - Lecture chirurgicale (Total commande + Item spécifique)
      const oUrlParametersOrder = {
        "$select": "TotalAmount,Currency"
      };
      const oUrlParametersOrderItem = {
        "$filter": `ProductId eq '${Item.productId}'`,
        "$select": "ItemUuid, Price,Currency,ProductId,GrossAmount,Quantity,CreatedAt",
        "$orderby": "CreatedAt desc",
        "$top": "1"
      };

      //  On prépare le GET (Rafraîchir le total et les items)
      // Pas besoin de construire l'URL complexe, on demande juste un rafraîchissement
      this.oDataModel.read(sPath, {
        groupId: gId,
        urlParameters: oUrlParametersOrder
      });
      this.oDataModel.read(`${sPath}/to_Items`, {
        groupId: gId,
        urlParameters: oUrlParametersOrderItem
      });
      return new Promise((resolve, reject) => {
        this.oDataModel.submitChanges({
          groupId: gId,
          success: oData => {
            try {
              console.log(' Batch response:', oData);
              if (!oData.__batchResponses || oData.__batchResponses.length < 1) {
                throw new Error("Réponses batch incomplètes");
              }
              const getResponse1 = oData.__batchResponses[1];
              const readResponse1 = getResponse1.data || getResponse1;
              const getResponse2 = oData.__batchResponses[2];
              const readResponse2 = getResponse2.data;

              //  Maintenant to_Items devrait être présent
              const aAllItems = readResponse2.results || readResponse2.to_Items || [];
              const postResponse = oData.__batchResponses[0];
              const result = {
                success: true,
                totalOrder: readResponse1.TotalAmount,
                currency: readResponse1.Currency,
                newItems: aAllItems,
                postStatus: postResponse.statusCode
              };
              resolve(result);
            } catch (err) {
              console.error(' Erreur parsing:', err);
              reject(new Error("Erreur de lecture des données batch"));
            }
          },
          error: err => {
            console.error('Erreur batch:', err);
            reject(err);
          }
        });
      });
    }
    async addProductAndRefresh(orderUuid, orderItem) {
      const oPayload = {
        ProductId: orderItem.ProductId,
        ProductName: orderItem.ProductName,
        Quantity: orderItem.Quantity,
        Price: orderItem.Price,
        Currency: orderItem.Currency
      };
      const sPath = `/Orders(OrderUuid=guid'${orderUuid}',IsActiveEntity=false)`;
      const gId = "OrderBatchGroup";

      //  GET - Lecture chirurgicale (Total commande + Item spécifique)
      const oUrlParametersOrder = {
        "$select": "TotalAmount,Currency"
      };
      const oUrlParametersOrderItem = {
        "$filter": `ProductId eq '${orderItem.ProductId}'`,
        "$select": "ItemUuid, Price,Currency,ProductId,GrossAmount,Quantity,CreatedAt",
        "$orderby": "CreatedAt desc",
        "$top": "1"
      };

      //  On prépare le POST (Ajout de l'article)
      this.oDataModel.create(`${sPath}/to_Items`, oPayload, {
        groupId: gId
      });

      //  On prépare le GET (Rafraîchir le total et les items)
      // Pas besoin de construire l'URL complexe, on demande juste un rafraîchissement
      this.oDataModel.read(sPath, {
        groupId: gId,
        urlParameters: oUrlParametersOrder
      });
      this.oDataModel.read(`${sPath}/to_Items`, {
        groupId: gId,
        urlParameters: oUrlParametersOrderItem
      });
      return new Promise((resolve, reject) => {
        this.oDataModel.submitChanges({
          groupId: gId,
          success: oData => {
            try {
              console.log(' Batch response:', oData);
              if (!oData.__batchResponses || oData.__batchResponses.length < 1) {
                throw new Error("Réponses batch incomplètes");
              }
              const getResponse1 = oData.__batchResponses[1];
              const readResponse1 = getResponse1.data || getResponse1;
              const getResponse2 = oData.__batchResponses[2];
              const readResponse2 = getResponse2.data;

              //  Maintenant to_Items devrait être présent
              const aAllItems = readResponse2.results || readResponse2.to_Items || [];
              const postResponse = oData.__batchResponses[0];
              const result = {
                success: true,
                totalOrder: readResponse1.TotalAmount,
                currency: readResponse1.Currency,
                newItems: aAllItems,
                postStatus: postResponse.statusCode
              };
              resolve(result);
            } catch (err) {
              console.error(' Erreur parsing:', err);
              reject(new Error("Erreur de lecture des données batch"));
            }
          },
          error: err => {
            console.error('Erreur batch:', err);
            reject(err);
          }
        });
      });
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.BatchService = BatchService;
  return __exports;
});
//# sourceMappingURL=OrderBatchService-dbg.js.map
