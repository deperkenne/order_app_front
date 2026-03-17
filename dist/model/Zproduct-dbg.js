sap.ui.define([], function () {
  "use strict";

  class Zproduct {
    _imageurl = '';
    constructor(dbProduct) {
      this.ProductId = dbProduct.ProductId;
      this.Productname = dbProduct.Productname;
      this.Price = dbProduct.Price;
      this.Currency = dbProduct.Currency;
      this.Stock = dbProduct.Stock;
    }
    get ImageUrl() {
      return this._imageurl;
    }
    set ImageUrl(value) {
      this._imageurl = value;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.Zproduct = Zproduct;
  return __exports;
});
//# sourceMappingURL=Zproduct-dbg.js.map
