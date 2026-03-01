sap.ui.define(["./Cartcalculator/Cartcalculator", "./CartPersistence", "./CartServiceProcess", "./Cartstore/Cartstore", "./CreateBatchService", "../Repositories/impl/OrderStorageImpl"], function (___Cartcalculator_Cartcalculator, ___CartPersistence, ___CartServiceProcess, ___Cartstore_Cartstore, ___CreateBatchService, ___Repositories_impl_OrderStorageImpl) {
  "use strict";

  const CartCalculator = ___Cartcalculator_Cartcalculator["CartCalculator"];
  const CartPersistence = ___CartPersistence["CartPersistence"];
  const CartServiceProcess = ___CartServiceProcess["CartServiceProcess"];
  const CartStore = ___Cartstore_Cartstore["CartStore"];
  const createBatchService = ___CreateBatchService["createBatchService"];
  const OrderStorageImpl = ___Repositories_impl_OrderStorageImpl["OrderStorageImpl"];
  function CreateCartServiceProcess(oModel, productModel, _oDataRequestErrorHelper, iOrderItemStorage) {
    const batchServiceProcess = createBatchService(oModel, _oDataRequestErrorHelper);
    return new CartServiceProcess(new CartStore(productModel), new CartCalculator(), new CartPersistence(iOrderItemStorage), new OrderStorageImpl(), batchServiceProcess);
  }
  var __exports = {
    __esModule: true
  };
  __exports.CreateCartServiceProcess = CreateCartServiceProcess;
  return __exports;
});
//# sourceMappingURL=CreateCartServiceProcess-dbg.js.map
