sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/m/MessageToast"], function (Controller, JSONModel, MessageToast) {
  "use strict";

  /**
   * @namespace com.kenne.orderapp.controller
   */
  const ProductsController = Controller.extend("com.kenne.orderapp.controller.ProductsController", {
    onInit: function _onInit() {
      const oAddedProductsModel = new JSONModel({
        addedProducts: [],
        countSelectedProduct: 0
      });
      // Créer le modèle de données
      const oProductsModel = new JSONModel({
        products: this.getProductsData(),
        countSelectedProduct: 0,
        filters: {
          searchQuery: "",
          selectedCategory: "All"
        },
        categories: ["All", "Électronique", "Audio", "Téléphonie", "Accessoires", "Photo"]
      });
      this.getView()?.setModel(oAddedProductsModel, "addedProducts"); // envoi des donnee vers la vue

      this.getView()?.setModel(oProductsModel, "products"); // ici on passe uniquement les produits a la vue
    },
    getProductsData: function _getProductsData() {
      return [{
        id: "P001",
        name: "Laptop Pro 15",
        quantity: 1,
        description: "Ordinateur portable haute performance avec écran 15 pouces, processeur Intel i7",
        price: 1299.99,
        currency: "EUR",
        category: "Électronique",
        rating: 4.5,
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
        inStock: true,
        supplier: "TechCorp"
      }, {
        id: "P002",
        name: "Casque Audio Sans Fil",
        quantity: 1,
        description: "Casque bluetooth premium avec réduction de bruit active et autonomie 30h",
        price: 249.99,
        currency: "EUR",
        category: "Audio",
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
        inStock: true,
        supplier: "SoundMax"
      }, {
        id: "P003",
        name: "Smartphone X12",
        quantity: 1,
        description: "Smartphone dernière génération avec caméra 108MP et écran AMOLED 6.7 pouces",
        price: 899.99,
        currency: "EUR",
        category: "Téléphonie",
        rating: 4.6,
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
        inStock: true,
        supplier: "MobileTech"
      }, {
        id: "P004",
        name: "Montre Connectée",
        quantity: 1,
        description: "Montre intelligente avec suivi santé complet, GPS et résistance à l'eau",
        price: 349.99,
        currency: "EUR",
        category: "Accessoires",
        rating: 4.3,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
        inStock: false,
        supplier: "WearTech"
      }, {
        id: "P005",
        name: "Appareil Photo Reflex",
        quantity: 1,
        description: "Appareil photo professionnel 24MP avec objectif 18-55mm et stabilisation",
        price: 1599.99,
        currency: "EUR",
        category: "Photo",
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1606980707146-b2202f5ab119?w=400&h=300&fit=crop",
        inStock: true,
        supplier: "PhotoPro"
      }, {
        id: "P006",
        name: "Tablette Pro 12",
        quantity: 1,
        description: "Tablette professionnelle avec stylet inclus, écran 12 pouces haute résolution",
        price: 799.99,
        currency: "EUR",
        category: "Électronique",
        rating: 4.4,
        imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
        inStock: true,
        supplier: "TabletCorp"
      }];
    },
    onSearch: function _onSearch(oEvent) {
      const sQuery = oEvent.getParameter("newValue");
      const oModel = this.getView()?.getModel("products");
      oModel.setProperty("/filters/searchQuery", sQuery); // grace a setProperty les changement sont detecter automatiquement et la vue 
      // est reactualiser automatiquement
      this.applyFilters();
    },
    onCategorySelect: function _onCategorySelect(oEvent) {
      const sCategory = oEvent.getParameter("selectedItem").getKey();
      const oModel = this.getView()?.getModel("products");
      oModel.setProperty("/filters/selectedCategory", sCategory);
      this.applyFilters();
    },
    applyFilters: function _applyFilters() {
      // Logique de filtrage (simplifiée pour l'exemple)
      MessageToast.show("Filtres appliqués");
    },
    /**
     *  
     * @param oEvent 
     *  const oContext = oButton.getBindingContext("products");
    🔹 Récupère le BindingContext du bouton
    🔹 "products" = nom du modèle (model name)
    🔹 Le contexte correspond à l’élément courant du binding (le produit)
     */
    onAddToCart: function _onAddToCart(oEvent) {
      const oButton = oEvent.getSource();
      const oContext = oButton.getBindingContext("products");
      const oProduct = oContext.getObject();

      // Récupérer le modèle appeler "addedProducts"
      const oModel = this.getView()?.getModel("addedProducts");
      // recuperation de la list orders dans le model oData
      const aProducts = oModel.getProperty("/addedProducts");
      MessageToast.show(`${aProducts.length} longeur de la list`);
      if (aProducts) {
        aProducts.push(oProduct);
        const product = aProducts[0].name;
        MessageToast.show(product + "name product");
        // remplacement de l'ancient orders par le nouveau
        oModel.setProperty("/addedProducts", aProducts);
        this.countProducts();
        MessageToast.show(`${oProduct.name} ajouté au panier`);
      }
    },
    toggleDisplay: function _toggleDisplay() {
      const oFlexBox = this.byId("flexboxProductsCard");
      if (!oFlexBox) {
        return;
      }
      oFlexBox.setVisible(!oFlexBox.getVisible());
    },
    // helper function
    countProducts: function _countProducts() {
      const oModel = this.getView()?.getModel("products");
      if (!oModel) {
        return;
      }
      const iCount = oModel.getProperty("/countSelectedProduct") || 0;
      oModel.setProperty("/countSelectedProduct", iCount + 1);
      this.applyFilters();
    },
    onProductPress: function _onProductPress(oEvent) {
      const oItem = oEvent.getSource();
      const oContext = oItem.getBindingContext("products");
      const oProduct = oContext.getObject();
      MessageToast.show(`Détails du produit: ${oProduct.name}`);
      // Ici vous pouvez naviguer vers une page de détails
      // this.getRouter().navTo("productDetail", { productId: oProduct.id });
    },
    formatPrice: function _formatPrice(price, currency) {
      return `${price.toFixed(2)} ${currency}`;
    },
    formatStock: function _formatStock(inStock) {
      return inStock ? "En stock" : "Rupture de stock";
    },
    getStockState: function _getStockState(inStock) {
      return inStock ? "Success" : "Error";
    }
  });
  return ProductsController;
});
//# sourceMappingURL=Test-dbg.controller.js.map
