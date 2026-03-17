sap.ui.define([], function () {
  "use strict";

  const ORDER_SELECT_FIELDS = "TotalAmount,Currency";
  const ITEM_SELECT_FIELDS = "ItemUuid,Price,Currency,ProductId,GrossAmount,Quantity,CreatedAt";
  const ITEM_ORDERBY = "CreatedAt desc";
  const ITEM_TOP = "1";
  class ODataQueryParameterBuilder {
    buildOrderParams() {
      return {
        "$select": ORDER_SELECT_FIELDS
      };
    }
    buildItemParams(productId) {
      return {
        "$filter": `ProductId eq '${productId}'`,
        "$select": ITEM_SELECT_FIELDS,
        "$orderby": ITEM_ORDERBY,
        "$top": ITEM_TOP
      };
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.ODataQueryParameterBuilder = ODataQueryParameterBuilder;
  return __exports;
});
//# sourceMappingURL=QueryParameterBuilder-dbg.js.map
