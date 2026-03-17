sap.ui.define([], function () {
  "use strict";

  class ODataBatchExecutor {
    constructor(oDataModel) {
      this.oDataModel = oDataModel;
    }
    addCreate(path, payload, groupId) {
      this.oDataModel.create(path, payload, {
        groupId
      });
    }
    addFunctionCall(path, method, urlParameters, groupId) {
      this.oDataModel.callFunction(path, {
        method,
        groupId,
        urlParameters
      });
    }
    addRead(path, urlParameters, groupId) {
      this.oDataModel.read(path, {
        groupId,
        urlParameters
      });
    }
    submitBatch(groupId) {
      return new Promise((resolve, reject) => {
        this.oDataModel.submitChanges({
          groupId,
          success: oData => {
            const responses = oData?.__batchResponses ?? [];
            resolve(responses);
          },
          error: err => {
            reject(err);
          }
        });
      });
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.ODataBatchExecutor = ODataBatchExecutor;
  return __exports;
});
//# sourceMappingURL=BachExecutor-dbg.js.map
