sap.ui.define([], function () {
  "use strict";

  class Stock {
    // 'int' n'existe pas en TS, on utilise 'number'

    constructor(dbItem) {
      // ... mapping des autres champs
      this._StockId = dbItem.StockId;
      this._ProductId = dbItem.ProductId;
      this._SkuId = dbItem.SkuId;
      this._Quantity = dbItem.Quantity;
      //this._Unit = dbItem.Unit || dbItem._Unit || ""; 
      this._AvailableQuantity = dbItem.AvailableQuantity || 0;
    }

    // Getter et Setter pour StockId
    get StockId() {
      return this._StockId;
    }

    // Getter et Setter pour ProductId
    get ProductId() {
      return this._ProductId;
    }
    // Getter et Setter pour SkuId
    get SkuId() {
      return this._SkuId;
    }

    // Getter et Setter pour Quantity
    get Quantity() {
      return this._Quantity;
    }
    set Quantity(value) {
      if (value < 0) {
        console.error("La quantité ne peut pas être négative");
        this._Quantity = 0; // Sécurité
      } else {
        this._Quantity = value;
      }
    }

    // Getter et Setter pour Unit
    get Unit() {
      return this._Unit;
    }
    set Unit(value) {
      this._Unit = value;
    }

    // Getter et Setter pour AvailableQuantity
    get AvailableQuantity() {
      return this._AvailableQuantity;
    }
    set AvailableQuantity(value) {
      if (value < 0) {
        console.error("La quantité ne peut pas être négative");
        this._AvailableQuantity = 0; // Sécurité
      } else {
        this._AvailableQuantity = value;
      }
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.Stock = Stock;
  return __exports;
});
//# sourceMappingURL=Stock-dbg.js.map
