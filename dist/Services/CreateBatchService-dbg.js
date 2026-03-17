sap.ui.define(["./BatchService", "./executors/BachExecutor", "./parsers/ResponseParser", "./builders/PathBuilder", "./builders/QueryParameterBuilder"], function (___BatchService, ___executors_BachExecutor, ___parsers_ResponseParser, ___builders_PathBuilder, ___builders_QueryParameterBuilder) {
  "use strict";

  const BatchServiceProcess = ___BatchService["BatchServiceProcess"];
  const ODataBatchExecutor = ___executors_BachExecutor["ODataBatchExecutor"];
  const BatchResponseParser = ___parsers_ResponseParser["BatchResponseParser"];
  const ODataPathBuilder = ___builders_PathBuilder["ODataPathBuilder"];
  const ODataQueryParameterBuilder = ___builders_QueryParameterBuilder["ODataQueryParameterBuilder"];
  function createBatchService(oModel, _oDataRequestErrorHelper) {
    oModel.setDeferredGroups(["OrderBatchGroup"]);
    return new BatchServiceProcess(new ODataBatchExecutor(oModel), new BatchResponseParser(), new ODataPathBuilder(), new ODataQueryParameterBuilder());
  }
  var __exports = {
    __esModule: true
  };
  __exports.createBatchService = createBatchService;
  return __exports;
});
//# sourceMappingURL=CreateBatchService-dbg.js.map
