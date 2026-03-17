sap.ui.define([], function () {
  "use strict";

  class CartServiceProcess {
    constructor(store, calculator, persistence, orderStorage, batchService) {
      this.store = store;
      this.calculator = calculator;
      this.persistence = persistence;
      this.orderStorage = orderStorage;
      this.batchService = batchService;
    }

    // Add item to cart 
    async addToCart(product) {
      // update UI
      const items = this.store.getItems();
      const updated = this.upsertItem(items, product);
      this.commitToStore(updated);

      // call a  backend
      const orderUuid = this.orderStorage.getOrderUuid() || "";
      const newItem = {
        ProductId: product.ProductId,
        ProductName: product.Productname,
        Quantity: "1",
        Price: product.Price,
        Currency: "EUR"
      };
      try {
        const result = await this.batchService.addProductAndRefresh(orderUuid, newItem);
        this.reconcile(result, product.Productname, product.ImageUrl);
      } catch {
        this.rollback(product.ProductId);
      }
    }

    // delete  item from cart
    async deleteFromCart(cartItem) {
      const orderUuid = this.orderStorage.getOrderUuid() || "";

      //  update UI
      const items = this.store.getItems();
      const updated = this.decrementOrRemove(items, cartItem.productId);
      this.commitToStore(updated);
      try {
        const result = await this.batchService.deleteProductAndRefresh(cartItem, orderUuid);
        this.reconcile(result, cartItem.productName, cartItem.imageUrl);
      } catch {
        this.rollback(cartItem.productId);
      }
    }

    // Synchronize data with the backend

    reconcile(backendData, productName, imageUrl = "") {
      const current = this.store.getItems();

      // modify corresponding item
      const reconciled = current.map(item => {
        const backendItem = (backendData.newItems || []).find(b => b.ProductId === item.productId);
        if (!backendItem) return item;
        return {
          ...item,
          itemUuid: backendItem.ItemUuid,
          productName,
          imageUrl: imageUrl,
          price: backendItem.Price,
          currency: backendItem.Currency,
          quantity: backendItem.Quantity,
          grossAmount: backendItem.GrossAmount
        };
      });
      this.commitToStore(reconciled, backendData.totalOrder);
    }

    //  Rollback 

    rollback(productId) {
      const items = this.store.getItems();
      const updated = items.filter(i => i.productId !== productId);
      this.commitToStore(updated);
    }

    // Helpers methode

    upsertItem(items, product) {
      const idx = items.findIndex(i => i.productId === product.ProductId);
      if (idx >= 0) {
        // Incrément : return new table
        return items.map((item, i) => {
          if (i !== idx) return item;
          return this.calculator.incrementItem(item);
        });
      }

      // new article
      const newItem = this.calculator.buildNewItem(product, 1);
      return [...items, newItem];
    }
    decrementOrRemove(items, productId) {
      const itemIndex = items.findIndex(item => item.productId === productId);
      if (itemIndex === -1) {
        console.warn(`Item with ProductId ${productId} not found in cart`);
        throw new Error();
      }
      items[itemIndex].quantity -= 1;
      items[itemIndex].grossAmount = items[itemIndex].quantity * items[itemIndex].price;
      // delete item in cart when qty <= 0
      if (items[itemIndex].quantity <= 0) {
        items.splice(itemIndex, 1);
      }
      return items;
    }

    // Commit the data to the store and persist it in browser memory

    commitToStore(items, backendTotal) {
      const total = backendTotal !== undefined ? String(backendTotal) : this.calculator.recalculateTotal(items);
      this.store.setItems(items);
      this.store.setTotal(total);
      this.store.setCount(items.length);
      this.persistence.save(items, total, items.length);
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.CartServiceProcess = CartServiceProcess;
  return __exports;
});
//# sourceMappingURL=CartServiceProcess-dbg.js.map
