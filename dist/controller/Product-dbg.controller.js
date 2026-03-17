sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "../Services/ProductService", "../Repositories/impl/ZProductImpl", "../Helpers/oDataRequestErrorHelper", "../Services/OrderService", "../Repositories/impl/OrderStorageImpl", "../Repositories/impl/OrderImpl", "../Services/OrderBatchService", "../Repositories/impl/Order_ItemStrorage_impl", "../Services/CreateBatchService", "../Services/CreateCartServiceProcess", "sap/ui/core/Fragment", "sap/ui/core/UIComponent"], function (Controller, JSONModel, ___Services_ProductService, ___Repositories_impl_ZProductImpl, ___Helpers_oDataRequestErrorHelper, ___Services_OrderService, ___Repositories_impl_OrderStorageImpl, ___Repositories_impl_OrderImpl, ___Services_OrderBatchService, ___Repositories_impl_Order_ItemStrorage_impl, ___Services_CreateBatchService, ___Services_CreateCartServiceProcess, Fragment, UIComponent) {
  "use strict";

  const ProductService = ___Services_ProductService["ProductService"];
  const ZProductImpl = ___Repositories_impl_ZProductImpl["ZProductImpl"];
  const ODataRequestErrorHelper = ___Helpers_oDataRequestErrorHelper["ODataRequestErrorHelper"];
  const OrderService = ___Services_OrderService["OrderService"];
  const OrderStorageImpl = ___Repositories_impl_OrderStorageImpl["OrderStorageImpl"];
  const OrderImpl = ___Repositories_impl_OrderImpl["OrderImpl"];
  const BatchService = ___Services_OrderBatchService["BatchService"];
  const OrderItemStorage = ___Repositories_impl_Order_ItemStrorage_impl["OrderItemStorage"];
  const createBatchService = ___Services_CreateBatchService["createBatchService"];
  const CreateCartServiceProcess = ___Services_CreateCartServiceProcess["CreateCartServiceProcess"];
  const ProductsController = Controller.extend("webapp.controller.ProductsController", {
    constructor: function constructor() {
      Controller.prototype.constructor.apply(this, arguments);
      this._oMobileMenu = null;
      // Pour stocker l'action (delete ou edit)
      this._mDialogs = new Map();
      this._bMenuLoading = false;
      this.products = [];
      this.OrderUuid = '';
      this.images = ["images/handy.jpg", "images/kopfhörer.jpg", "images/pc.jpg", "images/tablet.jpg", "images/Uhr.jpg", "images/Uhr.jpg"];
    },
    onInit: function _onInit() {
      this._oDataRequestErrorHelper = new ODataRequestErrorHelper();
      this.oODataModel = this.getOwnerComponent()?.getModel();
      this.iproductrepo = new ZProductImpl(this.oODataModel, this._oDataRequestErrorHelper);
      this.productService = new ProductService(this.iproductrepo);
      this.orderBatchService = new BatchService(this.oODataModel, this._oDataRequestErrorHelper);
      this.iOrderItemStorageRepo = new OrderItemStorage();
      this.batchServicep = createBatchService(this.oODataModel, this._oDataRequestErrorHelper);
      this._bExpanded = false;
      //this.iOrderItemStorageRepo.clearOrderItem("myCart")
      //this.iOrderItemStorageRepo.clearOrderItem("myCount")
      //this.iOrderItemStorageRepo.clearOrderItem("myTotal")
      //this.iOrderItemStorageRepo.clearOrderItem("myProducts")

      const oModelUi = new JSONModel({
        isCartVisible: false
      });
      this.getView()?.setModel(oModelUi, "ui");
      const oModeldata = new JSONModel({
        products: [],
        cartItems: [],
        totalAmount: 0,
        filteredItems: [],
        countSelectedProduct: 0
      });
      /** 
      const oModel = new JSONModel({
          products: [
          {
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
          },
          {
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
          },
          {
              id: "P003",
              name: "Smartphone X12",
              Quantity: 1,
              description: "Smartphone dernière génération avec caméra 108MP et écran AMOLED 6.7 pouces",
              price: 899.99,
              currency: "EUR",
              category: "Téléphonie",
              rating: 4.6,
              imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
              inStock: true,
              supplier: "MobileTech"
          },
          {
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
          },
          {
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
          },
          {
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
          }
          ],
            cartItems: [], 
          totalAmount: 0,
          filteredItems: [],
          countSelectedProduct: 0
      });
      */

      this.getView()?.setModel(oModeldata, "products");
      const oModel = this.getView()?.getModel("products");
      this.cartserviceProcess = CreateCartServiceProcess(this.oODataModel, oModel, this._oDataRequestErrorHelper, this.iOrderItemStorageRepo);
      this.handleAuthCallback();
      this.getCartItemsFromMemory();
      this.initializeOrder();
      this.loadAndInitialize();
      // ici parceque l'app vas redemarer grace a la redirection 
    },
    // --- PARTIE 2 : GÉRER LE RETOUR DE SAP (AU CHARGEMENT DE LA PAGE) ---
    handleAuthCallback: function _handleAuthCallback() {
      const urlParams = new URLSearchParams(window.location.search);
      const sAuthCode = urlParams.get('code');
      if (sAuthCode) {
        console.log("Code reçu, échange contre un Token...");
        console.log("Code reçu, échange contre un Token... ", sAuthCode);
        this.exchangeCodeForToken(sAuthCode);
      }
    },
    // Utilitaire : générer un code_verifier aléatoire
    generateCodeVerifier: function _generateCodeVerifier() {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return btoa(String.fromCharCode(...array)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    },
    // Utilitaire : dériver le code_challenge depuis le verifier
    generateCodeChallenge: async function _generateCodeChallenge(verifier) {
      const encoder = new TextEncoder();
      const data = encoder.encode(verifier);
      const digest = await crypto.subtle.digest('SHA-256', data);
      return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    },
    // PARTIE 1 : Lancer la connexion
    onLoginPress: async function _onLoginPress() {
      const sClientId = "88dd4681-0e04-417f-9b15-c6d97022e374";
      //const sRedirectUri = "http://localhost:8080/index.html"; // ✅ pas d'encode ici
      const sRedirectUri = window.location.hostname === "localhost" ? "http://localhost:8080/index.html" : `https://${window.location.hostname}/index.html`;
      const sCodeVerifier = this.generateCodeVerifier();
      const sChallenge = await this.generateCodeChallenge(sCodeVerifier);

      // ✅ Stocker le verifier pour l'étape 3
      sessionStorage.setItem("pkce_code_verifier", sCodeVerifier);
      window.location.href = `https://ankyikmcs.trial-accounts.ondemand.com/oauth2/authorize` + `?response_type=code` + `&client_id=${sClientId}` + `&redirect_uri=${encodeURIComponent(sRedirectUri)}` + `&scope=openid%20profile%20email` + `&code_challenge=${sChallenge}` + `&code_challenge_method=S256`;
    },
    // PARTIE 3 : Échanger le code
    exchangeCodeForToken: async function _exchangeCodeForToken(code) {
      const sCodeVerifier = sessionStorage.getItem("pkce_code_verifier"); // ✅ récupéré
      const sClientId = "88dd4681-0e04-417f-9b15-c6d97022e374";
      //const sRedirectUri = "http://localhost:8080/index.html"; // ✅ pas d'encode ici
      const sRedirectUri = window.location.hostname === "localhost" ? "http://localhost:8080/index.html" : `https://${window.location.hostname}/index.html`;
      //const sTokenEndpoint = "/oauth2/token"; // local
      const sTokenEndpoint = "https://ankyikmcs.trial-accounts.ondemand.com/oauth2/token"; // in production

      const CodeVerifier = sessionStorage.getItem("pkce_code_verifier");
      if (!CodeVerifier) {
        console.error("❌ code_verifier manquant !");
        return;
      }
      const body = new URLSearchParams({
        // ✅ URLSearchParams encode lui-même
        grant_type: "authorization_code",
        code: code,
        client_id: sClientId,
        redirect_uri: sRedirectUri,
        code_verifier: sCodeVerifier
      });
      try {
        const response = await fetch(sTokenEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: body
        });
        const data = await response.json();
        if (data.id_token) {
          console.log("Connexion réussie !", data);
          // Stocker le jeton (localStorage ou Session)
          sessionStorage.removeItem("pkce_code_verifier"); // ici
          sessionStorage.setItem("user_token", data.id_token);
          localStorage.setItem("user_token", data.id_token);

          // NETTOYAGE de l'URL (enlever le ?code=...) et redirection interne
          window.location.href = sRedirectUri + "#/DashboardAdmin";
        }
      } catch (error) {
        console.error("Erreur lors de l'échange du token", error);
      }
    },
    navigateToAdmin: function _navigateToAdmin() {
      console.log("start navigation.....");
      const oRouter = UIComponent.getRouterFor(this);
      oRouter.navTo("RouteDashboardAdmin");
    },
    getProductFromMemory: function _getProductFromMemory() {
      const oModel = this.getView()?.getModel("products");
      let sProduct = this.iOrderItemStorageRepo.getOrderItem("myProducts");
      let mProduct = [];
      if (typeof sProduct === "string") {
        if (sProduct.trim() === "") {
          console.log("Panier vide (string vide)");
          mProduct = [];
        } else if (sProduct.startsWith("[object")) {
          mProduct = [];
        } else {
          //  Parser la chaîne JSON
          try {
            mProduct = JSON.parse(sProduct);
            if (typeof mProduct === "string") {
              mProduct = JSON.parse(mProduct); // Donne enfin le tableau []
            }
            console.log("JSON parsé avec succès:", mProduct.length, "items");
          } catch (parseError) {
            console.error(" Erreur parsing JSON:", parseError);
            console.error(" Contenu:", sProduct);
            mProduct = [];
          }
        }
      }
      oModel.setProperty("/products", mProduct);
    },
    getCartItemsFromMemory: function _getCartItemsFromMemory() {
      const oModel = this.getView()?.getModel("products");
      let sCart = this.iOrderItemStorageRepo.getOrderItem("myCart");
      const sTotalAmount = this.iOrderItemStorageRepo.getOrderItem("myTotal");
      const sCountCart = this.iOrderItemStorageRepo.getOrderItem("myCount");
      console.log("start memory", sCart);
      console.log("start count", sCountCart);
      console.log("start total ", sTotalAmount);
      let aItems = [];
      let nTotalAmount = 0;
      let nCount = 0;
      if (typeof sCart === "string") {
        if (sCart.trim() === "") {
          console.log("Panier vide (string vide)");
          aItems = [];
        } else if (sCart.startsWith("[object")) {
          aItems = [];
        } else {
          //  Parser la chaîne JSON
          try {
            aItems = JSON.parse(sCart);
            if (typeof aItems === "string") {
              aItems = JSON.parse(aItems); // Donne enfin le tableau []
            }
            console.log("JSON parsé avec succès:", aItems.length, "items");
          } catch (parseError) {
            console.error(" Erreur parsing JSON:", parseError);
            console.error(" Contenu:", sCart);
            aItems = [];
          }
        }
      }
      if (Array.isArray(sCart)) {
        // Cas 3: C'est déjà un tableau (getOrderItem retourne un objet)
        console.log("Storage retourne déjà un tableau");
        aItems = sCart;
      }
      if (sTotalAmount && sTotalAmount !== "null" && sTotalAmount !== "undefined") {
        nTotalAmount = parseFloat(sTotalAmount); // string → number

        if (isNaN(nTotalAmount)) {
          console.warn("Total invalide, initialisation à 0");
          nTotalAmount = 0;
        }
      }
      if (sCountCart && sCountCart !== "null" && sCountCart !== "undefined") {
        nCount = parseInt(sCountCart, 10); // string → number (entier)

        if (isNaN(nCount)) {
          console.warn(" Count invalide, initialisation à 0");
          nCount = 0;
        }
      }
      oModel.setProperty("/filteredItems", aItems);
      oModel.setProperty("/totalAmount", nTotalAmount.toFixed(2));
      oModel.setProperty("/countSelectedProduct", nCount);
    },
    initializeOrder: async function _initializeOrder() {
      this.iorderStorage = new OrderStorageImpl();
      this.OrderUuid = this.iorderStorage.getOrderUuid() || '';
      if (this.OrderUuid) {
        console.log('Commande existante:', this.OrderUuid);
        return;
      }
      this.iorderRepo = new OrderImpl(this.oODataModel, this._oDataRequestErrorHelper);
      this.orderService = new OrderService(this.iorderRepo, this.iorderStorage);
      const newOrder = {
        "OrderId": "2026003",
        "CustomerId": "0000000014",
        "TotalAmount": 0,
        "Currency": "EUR",
        "Status": "PENDING"
      };
      const response = await this.orderService.saveOrder(newOrder);
      console.log("new order value", response);
    },
    loadAndInitialize: async function _loadAndInitialize() {
      const sProducts = this.iOrderItemStorageRepo.getOrderItem("myProducts");
      if (!sProducts || sProducts === "null" || sProducts === "undefined" || sProducts.trim() === "") {
        try {
          // load data from backend
          await this.getProducts();

          //  RÉCUPÉRER le modèle d'abord
          const oModel = this.getView()?.getModel("products");

          // On met à jour le modèle existant
          oModel.setProperty("/products", this.products);
          console.log('Modèles créés avec', this.products[0].Price, 'produits');
          console.log('Modèles créés avec', this.products);
        } catch (error) {
          console.error('Erreur initialisation:', error);
        }
      } else {
        this.getProductFromMemory();
      }
    },
    getProducts: async function _getProducts() {
      try {
        const db_products = await this.productService.getAllProducts();
        if (!db_products) {
          this.products = [];
          return;
        }
        this.products = db_products.map((product, index) => {
          product.ImageUrl = this.images && this.images[index] ? this.images[index] : '';
          return product;
        });
        const sProducts = JSON.stringify(this.products);
        this.iOrderItemStorageRepo.setOrderItem("myProducts", sProducts);
        console.log('Produits chargés:', this.products.length);
      } catch (error) {
        console.error('Erreur:', error);
        throw error;
      }
    },
    onDelete: function _onDelete(oEvent) {
      const oButton = oEvent.getSource();
      const oContext = oButton.getBindingContext("products"); // products is given model name
      const oCartItem = oContext.getObject();

      /**
      this.cartService = new CartService(
         oModel,
         oDataModel,
         this.iOrderItemStorageRepo,
         this.iorderStorage,
         this.orderBatchService,
         this.batchServicep
      );
      */

      if (oCartItem) {
        // this.cartService.deleteToCart(oProduct);
        this.cartserviceProcess.deleteFromCart(oCartItem);
      }
    },
    //https://abapcloud.com/sap-event-mesh-abap-cloud/
    addToCard: function _addToCard(oEvent) {
      console.log("ajouter au panier ");
      const oButton = oEvent.getSource();
      const oContext = oButton.getBindingContext("products");
      const oProduct = oContext.getObject();
      this.cartserviceProcess.addToCart(oProduct);
    },
    _updateTotal: function _updateTotal(aCartItems) {
      const oModel = this.getView()?.getModel();
      const total = aCartItems.reduce((sum, item) => sum + item.subtotal, 0);
      oModel.setProperty("/total", total);
    },
    toggleDisplay: function _toggleDisplay() {
      const oModel = this.getView()?.getModel("ui");
      const aVisible = oModel.getProperty("/isCartVisible");
      oModel.setProperty("/isCartVisible", !aVisible);
    },
    formatStock: function _formatStock(iInStock) {
      return iInStock > 0 ? `En stock ` : "Rupture";
    },
    getStockState: function _getStockState(iInStock) {
      return iInStock > 0 ? "Success" : "Error";
    },
    onHamburgerPress: async function _onHamburgerPress(oEvent) {
      const oButton = oEvent.getSource();
      if (this._bMenuLoading) return; // ✅ bloque si déjà en cours de chargement

      if (!this._oMobileMenu) {
        this._bMenuLoading = true;
        try {
          this._oMobileMenu = await Fragment.load({
            name: "com.kenne.orderapp.Fragments.MobileMenu",
            // ⚠️ sans id de vue
            controller: this
          });
          this.getView()?.addDependent(this._oMobileMenu);
        } finally {
          this._bMenuLoading = false;
        }
      }
      if (this._oMobileMenu.isOpen()) {
        this._oMobileMenu.close();
        oButton.setIcon("sap-icon://menu2");
      } else {
        this._oMobileMenu.openBy(oButton);
        oButton.setIcon("sap-icon://decline");
      }
    }
  });
  return ProductsController;
});
//# sourceMappingURL=Product-dbg.controller.js.map
