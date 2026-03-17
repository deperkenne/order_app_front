sap.ui.define([], function () {
  "use strict";

  class ODataRequestError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.ODataRequestError = ODataRequestError;
  return __exports;
});
//# sourceMappingURL=oDataRequestError-dbg.js.map
