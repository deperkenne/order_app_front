sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/m/MessageToast", "sap/m/MessageBox", "../model/Stock", "sap/ui/core/Fragment", "../Repositories/impl/StockImpl", "../Services/StockService", "../Helpers/oDataRequestErrorHelper"], function (Controller, JSONModel, MessageToast, MessageBox, ___model_Stock, Fragment, ___Repositories_impl_StockImpl, ___Services_StockService, ___Helpers_oDataRequestErrorHelper) {
  "use strict";

  const Stock = ___model_Stock["Stock"];
  const StockImpl = ___Repositories_impl_StockImpl["StockImpl"];
  const StockService = ___Services_StockService["StockService"];
  const ODataRequestErrorHelper = ___Helpers_oDataRequestErrorHelper["ODataRequestErrorHelper"];
  const Main = Controller.extend("webapp.controller.Main", {
    constructor: function constructor() {
      Controller.prototype.constructor.apply(this, arguments);
      // Pour stocker l'action (delete ou edit)
      this._mDialogs = new Map();
    },
    onInit: function _onInit() {
      this._oDataRequestErrorHelper = new ODataRequestErrorHelper();
      const oODataModel = this.getOwnerComponent()?.getModel();
      if (!oODataModel) {
        throw new Error("ODataModel non initialisé dans Component !");
      }
      this._stockService = this.createStockService(oODataModel, this._oDataRequestErrorHelper);
      this.getAllStock(this._stockService);
      var oModel = new JSONModel({
        items: [],
        selectedStock: {},
        status: ""
      });
      this.getView()?.setModel(oModel, "stock");
      if (!oODataModel) {
        throw new Error("ODataModel non initialisé. Vérifie le manifest.json");
      }
    },
    // helper methode
    createStockService: function _createStockService(oModel, oDataRequestError) {
      const stockRepository = new StockImpl(oModel, oDataRequestError);
      return new StockService(stockRepository);
    },
    getAllStock: async function _getAllStock(stockService) {
      try {
        // On ATTEND que les données arrivent
        const aStocks = await stockService.getAllStocks();
        console.log("Nombre d'éléments :", aStocks.length);
        // 1. RÉCUPÉRER le modèle d'abord
        const oModel = this.getView()?.getModel("stock");
        // On met à jour le modèle existant
        oModel.setProperty("/items", aStocks);
      } catch (oError) {
        console.error("Erreur de récupération :", oError);
      }
    },
    // 1. Appelé par tes boutons Edit ou Delete
    openAuthDialog: function _openAuthDialog(oEvent, sActionType) {
      // Memorisation du context
      this._pendingAction = {
        type: sActionType,
        // 1. Récupérer l'objet cliqué (contexte de la ligne du tableau)
        context: oEvent.getSource().getBindingContext("stock")
      };
      const oSelectedData = this._pendingAction.context.getObject();
      this.loadDialog("com.kenne.orderapp.Fragments.LoginDialog", null);
    },
    // helper methode
    loadDialog: async function _loadDialog(dialogName, oData) {
      console.log("show data oData", oData);
      //name: "com.kenne.orderapp.Fragments.LoginDialog", // <--- Respecte strictement ce chemin
      // evite de recharger le fichier XML du fragment a chaque clic sur le bouton
      if (!this._mDialogs.has(dialogName)) {
        const pDialog = Fragment.load({
          id: this.getView()?.getId(),
          // attaching manually fragment to the View ID
          name: dialogName,
          // <--- Respecte strictement ce chemin
          controller: this
        }).then(oDialog => {
          console.log(dialogName, "binding");
          this.getView()?.addDependent(oDialog); // Crucial pour le dataflow du contoleur vers le fragment ou enfant

          return oDialog;
        });
        this._mDialogs.set(dialogName, pDialog);
      }
      this.setDialog(dialogName, this._mDialogs, oData);
    },
    setDialog: async function _setDialog(dialogName, mDialogs, oData) {
      console.log("start set data");
      // 2. Attendre que le dialog soit chargé
      const oDialog = await mDialogs.get(dialogName);
      // 3. Gérer les données (avant l'ouverture)
      if (oData) {
        console.log("print oData", oData);
        const oModel = oDialog.getModel("dialogData");
        if (oModel) {
          console.log("show model2..", oModel);
          oModel.setData(oData); // Mise à jour
        } else {
          console.log("start model");
          oDialog.setModel(new JSONModel(oData), "dialogData");
          const oModel = oDialog.getModel("dialogData");
        }
      }
      // 4. Ouvrir le dialog
      oDialog.open();
    },
    // 2. Bouton "Confirmer" du fragment
    onConfirmAuth: function _onConfirmAuth() {
      const sUser = this.byId("loginUser").getValue();
      const sPass = this.byId("loginPassword").getValue();

      // Simulation simple d'authentification
      if (sUser === "admin" && sPass === "123") {
        this.onCloseLogin();
        this._executePendingAction();
      } else {
        MessageToast.show("Identifiants incorrects");
      }
    },
    _executePendingAction: function _executePendingAction() {
      if (this._pendingAction.type === "DELETE") {
        // Logique de suppression ici
        MessageToast.show("Suppression réussie !");
      } else if (this._pendingAction.type === "EDIT") {
        this._handleEdit();
      }
    },
    _handleEdit: function _handleEdit() {
      console.log("start stock change.....");
      // Récupérer les données sélectionnées depuis le contexte
      const oSelectedData = this._pendingAction.context.getObject();
      console.log("show current clicked data", oSelectedData);
      // Charger le dialog d'édition avec les données
      this.loadDialog("com.kenne.orderapp.Fragments.SimpleForm", oSelectedData);
    },
    refreshView: async function _refreshView() {
      const oModel = this.getView()?.getModel("stock");
      // Le 'true' force le rafraîchissement immédiat de tous les bindings
      oModel.refresh(true);
    },
    onCreateStock: async function _onCreateStock() {
      this.loadDialog("com.kenne.orderapp.Fragments.AddStockDialog", null);
    },
    onAddStock: async function _onAddStock() {
      const StockId = this.byId("AddStockInput1").getValue();
      const ProductId = this.byId("AddStockInput2").getValue();
      const SkuId = this.byId("AddStockInput3").getValue();
      const Quantity = this.byId("AddStockInput4").getValue();
      //const Unit = (this.byId("AddStockInput5") as any).getValue();
      const AvailableQuantity = this.byId("AddStockInput6").getValue();
      const iQuantity = Number(Quantity);
      const iAvailableQuantity = Number(AvailableQuantity);
      const dbData = {
        StockId: StockId,
        ProductId: ProductId,
        SkuId: SkuId,
        Quantity: iQuantity,
        AvailableQuantity: iAvailableQuantity
      };
      const sStock = new Stock(dbData);
      try {
        const oCreatedStock = await this._stockService.createStocks(sStock);

        // OPTIMISATION : Add directly created stock to model to avoid N+1 request
        const oModel = this.getView()?.getModel("stock");
        const aItems = oModel.getProperty("/items") || [];

        // Add new stock at the begining of list
        aItems.unshift(oCreatedStock);
        oModel.setProperty("/items", aItems);
        MessageToast.show("Stock ajouté avec succès !");
      } catch (error) {
        if (error.statusCode === 400 || error.statusCode === 409) {
          MessageBox.error(error.message); // message RAP
        } else {
          MessageBox.error("Erreur technique");
        }
        this.onCloseDialogAddStock();
      }
    },
    onUpdateStock: async function _onUpdateStock() {
      // 1. Récupérer les valeurs avec validation
      const oQuantityInput = this.byId("StockInput6");
      const oStockIdInput = this.byId("StockInput1");
      if (!oQuantityInput || !oStockIdInput) {
        MessageToast.show("current view not embedded this input");
        return;
      }
      const sStockId = oStockIdInput.getValue().trim();
      const sQuantityValue = oQuantityInput.getValue().trim();
      const iQuantity = Number(sQuantityValue);
      await this._stockService.ModifyStock(sStockId, iQuantity);
      if (!sStockId) {
        MessageToast.show("stockId is required");
        if (!sQuantityValue) {
          MessageToast.show("quantity is required");
        }
      } else {
        console.log(`update stock : ${sStockId}, Quantité: ${iQuantity}`);
        //Get the stock model from view
        const oModel = this.getView()?.getModel("stock");
        if (!oModel) {
          return;
        }
        // retrieve the stock list from model
        const aStocks = oModel.getProperty("/items");
        MessageToast.show(`Stock ${sStockId} mis à jour avec succès !`);
        //check if stocks exist and is an array
        if (!Array.isArray(aStocks)) {
          console.log("not array");
          return;
        }
        // find stock index to mofify
        const iIndex = aStocks.findIndex(stock => stock.StockId === sStockId);
        if (iIndex === -1) {
          console.log("index not");
          return;
        }
        // update quantity
        aStocks[iIndex].AvailableQuantity = iQuantity;
        // update the model in UI interafce  (this trigger a refresh  of UI)
        oModel.setProperty("/stock", aStocks);
        console.log(`✓ Stock ${sStockId} updated: ${iQuantity}`);
        /*
        const stockService = this.createStockService();
        await stockService.ModifyStock(sStockId, iQuantity);
          await this.refreshView();
        MessageToast.show(`Stock ${sStockId} mis à jour avec succès !`);
        */
        this.onCloseDialogStock();
      }
    },
    //helper update manually stock 
    onCloseDialogStock: function _onCloseDialogStock() {
      this.byId("StockDialog").close(); // this work because fragmentId is attached to the ViewId
    },
    onCloseDialogAddStock: async function _onCloseDialogAddStock() {
      this.byId("AddStockDialog").close();
    },
    onCloseLogin: function _onCloseLogin() {
      this.byId("idLoginDialog").close();
    },
    getProductsData: function _getProductsData() {
      return [{
        StockId: "PRD-001",
        ProductId: "P2333",
        SkuId: "S1233",
        Quantity: 25,
        Unit: "pcs",
        AvailableQuantity: 0
      }, {
        StockId: "PRD-002",
        ProductId: "P2333",
        SkuId: "S1233",
        Quantity: 25,
        Unit: "pcs",
        AvailableQuantity: 0
      }, {
        StockId: "PRD-003",
        ProductId: "P2333",
        SkuId: "S1233",
        Quantity: 25,
        Unit: "pcs",
        AvailableQuantity: 0
      }];
    }
  });
  return Main;
});
//# sourceMappingURL=Admin-dbg.controller.js.map
