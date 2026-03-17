sap.ui.define([], function () {
  "use strict";

  class StockService {
    constructor(stockRepository) {
      this.stockRepository = stockRepository;
    }
    async createStocks(stock) {
      return this.stockRepository.saveStock(stock);
    }
    async getAllStocks() {
      return await this.stockRepository.findAll();
    }
    async ModifyStock(stockId, updateQuantity) {
      await this.stockRepository.updateByStockId(stockId, updateQuantity);
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.StockService = StockService;
  return __exports;
});
//# sourceMappingURL=StockService-dbg.js.map
