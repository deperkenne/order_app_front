sap.ui.define([], function () {
  "use strict";

  class BatchResponseParser {
    // Index attendus dans le tableau de réponses batch
    static POST_RESPONSE_INDEX = 0;
    static ORDER_RESPONSE_INDEX = 1;
    static ITEMS_RESPONSE_INDEX = 2;
    static MIN_RESPONSES_REQUIRED = 3;
    parseDeleteResponse(responses) {
      return this.parseResponses(responses);
    }
    parseAddResponse(responses) {
      return this.parseResponses(responses);
    }

    // Méthode protégée => extensible par héritage (OCP)
    parseResponses(responses) {
      this.validateResponses(responses);
      const postResponse = responses[BatchResponseParser.POST_RESPONSE_INDEX];
      const orderResponse = responses[BatchResponseParser.ORDER_RESPONSE_INDEX];
      const itemsResponse = responses[BatchResponseParser.ITEMS_RESPONSE_INDEX];
      const orderData = orderResponse.data ?? orderResponse;
      const itemsData = itemsResponse.data;
      const newItems = itemsData?.results ?? itemsData?.to_Items ?? [];
      return {
        success: true,
        totalOrder: orderData.TotalAmount,
        currency: orderData.Currency,
        newItems,
        postStatus: postResponse.statusCode
      };
    }
    validateResponses(responses) {
      if (!Array.isArray(responses) || responses.length < BatchResponseParser.MIN_RESPONSES_REQUIRED) {
        throw new Error(`Réponses batch incomplètes : ${responses?.length ?? 0} reçues, ` + `${BatchResponseParser.MIN_RESPONSES_REQUIRED} attendues.`);
      }
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.BatchResponseParser = BatchResponseParser;
  return __exports;
});
//# sourceMappingURL=ResponseParser-dbg.js.map
