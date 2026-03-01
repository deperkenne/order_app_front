sap.ui.define([], function () {
  "use strict";

  class ODataRequestErrorHelper {
    customizeError(oError) {
      let message = "Erreur inconnue";
      let statusCode;
      try {
        statusCode = Number(oError.statusCode);
        this.errorInfo.push(statusCode);
        if (oError.responseText) {
          const oResponse = JSON.parse(oError.responseText);
          message = oResponse?.error?.message?.value || message;
          this.errorInfo.push(message);
          return this.errorInfo;
        }
      } catch (e) {
        message = oError.message;
        this.errorInfo.push(message);
        return this.errorInfo;
      }
      return [];
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.ODataRequestErrorHelper = ODataRequestErrorHelper;
  return __exports;
});
//# sourceMappingURL=oDataRequestErrorHelper-dbg.js.map
