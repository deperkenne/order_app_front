sap.ui.define([], function () {
  "use strict";

  class ProductService {
    // dependency injection 

    constructor(productRepository) {
      this.productRepo = productRepository;
    }
    async getAllProducts() {
      return this.productRepo.findAll();
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.ProductService = ProductService;
  return __exports;
});
//# sourceMappingURL=ProductService-dbg.js.map
