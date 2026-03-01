sap.ui.define([], function () {
  "use strict";

  class ODataPathBuilder {
    buildOrderPath(orderUuid) {
      return `/Orders(OrderUuid=guid'${orderUuid}',IsActiveEntity=false)`;
    }
    buildItemsPath(orderUuid) {
      return `${this.buildOrderPath(orderUuid)}/to_Items`;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.ODataPathBuilder = ODataPathBuilder;
  return __exports;
});
//# sourceMappingURL=PathBuilder-dbg.js.map
