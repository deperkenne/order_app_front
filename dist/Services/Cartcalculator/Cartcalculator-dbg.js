sap.ui.define([], function () {
  "use strict";

  class CartCalculator {
    recalculateTotal(items) {
      if (!Array.isArray(items)) return "0.00";
      const total = items.reduce((sum, item) => {
        return sum + (item.grossAmount || 0);
      }, 0);
      return isNaN(total) ? "0.00" : total.toFixed(2);
    }
    buildNewItem(product, quantity) {
      const grossAmount = quantity * parseFloat(String(product.Price));
      return {
        itemUuid: "",
        productId: product.ProductId,
        productName: product.Productname,
        imageUrl: product.ImageUrl || "",
        price: parseFloat(String(product.Price)),
        currency: "EUR",
        quantity,
        grossAmount: grossAmount == undefined ? 0.00 : grossAmount
      };
    }
    incrementItem(item) {
      const newQty = item.quantity + 1;
      const newGross = newQty * item.price;
      return {
        ...item,
        quantity: newQty,
        grossAmount: newGross
      };
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.CartCalculator = CartCalculator;
  return __exports;
});
//# sourceMappingURL=Cartcalculator-dbg.js.map
