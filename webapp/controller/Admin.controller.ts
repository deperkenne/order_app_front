import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageToast from "sap/m/MessageToast";
import MessageBox from "sap/m/MessageBox";
import Event from "sap/ui/base/Event";
import Router from "sap/ui/core/routing/Router";
import UIComponent from "sap/ui/core/UIComponent";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import {IStock} from "../model/IStock"
import{Stock} from "../model/Stock"
import Fragment from "sap/ui/core/Fragment";
import {StockImpl} from "../Repositories/impl/StockImpl"
import { StockService } from "../Services/StockService";
import Input from "sap/m/Input";

import {ODataRequestErrorHelper} from "../Helpers/oDataRequestErrorHelper";
export default class Main extends Controller {
    
    private _pLoginDialog: Promise<any>;
    private _pendingAction: any; // Pour stocker l'action (delete ou edit)
    private _mDialogs: Map<string, Promise<any>> = new Map();
    private _stockService : StockService;
    private _oDataRequestErrorHelper : ODataRequestErrorHelper 

    public onInit(): void { 
         this._oDataRequestErrorHelper = new ODataRequestErrorHelper();
         const oODataModel = this.getOwnerComponent()?.getModel() as ODataModel;
         if (!oODataModel) {
           throw new Error("ODataModel non initialisé dans Component !");
         }   

        this._stockService = this.createStockService(oODataModel,this._oDataRequestErrorHelper);
        this.getAllStock(this._stockService);

        var oModel = new JSONModel({
            items: [],
            selectedStock: {},
            status:"",
        });
        this.getView()?.setModel(oModel, "stock");  
   
       if (!oODataModel) {
          throw new Error("ODataModel non initialisé. Vérifie le manifest.json");
       }   
    }
    
    // helper methode
    private createStockService (oModel:ODataModel,oDataRequestError:ODataRequestErrorHelper) : StockService{
        const stockRepository = new StockImpl(oModel,oDataRequestError);
        return new StockService(stockRepository);
    }

    private async getAllStock(stockService:StockService): Promise<void> {

      try {
            // On ATTEND que les données arrivent
            const aStocks = await stockService.getAllStocks();
            console.log("Nombre d'éléments :", aStocks.length);
            // 1. RÉCUPÉRER le modèle d'abord
            const oModel = this.getView()?.getModel("stock") as JSONModel;
            // On met à jour le modèle existant
            oModel.setProperty("/items", aStocks);

        } catch (oError) {
            console.error("Erreur de récupération :", oError);
        }
    }

    // 1. Appelé par tes boutons Edit ou Delete
    public  openAuthDialog(oEvent: any, sActionType: string): void {
        // Memorisation du context
        this._pendingAction = {
            type: sActionType,
            // 1. Récupérer l'objet cliqué (contexte de la ligne du tableau)
            context: oEvent.getSource().getBindingContext("stock")
        };
        const oSelectedData = this._pendingAction.context.getObject();
        
        this.loadDialog("com.kenne.orderapp.Fragments.LoginDialog",null)
    }

    // helper methode
    private async loadDialog (dialogName:string, oData?:any ): Promise<void> {
        console.log("show data oData",oData)
        //name: "com.kenne.orderapp.Fragments.LoginDialog", // <--- Respecte strictement ce chemin
        // evite de recharger le fichier XML du fragment a chaque clic sur le bouton
        if (!this._mDialogs.has(dialogName)) {
            const pDialog = Fragment.load({
                id: this.getView()?.getId(), // attaching manually fragment to the View ID
                name: dialogName ,// <--- Respecte strictement ce chemin
                controller: this // on lie le fragment au controleur actuel. Cela permet au fragment d'appeler les fonctions 
                                 //(comme onClose) directement définies dans votre fichier .controller.ts.
            }).then((oDialog: any) => {
                console.log(dialogName,"binding")
                this.getView()?.addDependent(oDialog); // ajoute le dialogue comme "dépendant" de la vue :               
                return oDialog;
            });
            this._mDialogs.set(dialogName, pDialog);
        } 
        this.setDialog(dialogName,this._mDialogs,oData)  
    }

    // oData peut etre null ou recevoire les donnees : null si nous devons remplir tous un formulaire  si non non null dans le cas de la modification
    private async setDialog(dialogName:string,mDialogs?:any,oData?:any):Promise<void>{
        console.log("start set data")
         // 2. Attendre que le dialog soit chargé
        const oDialog = await mDialogs.get(dialogName);
        // 3. Gérer les données (avant l'ouverture)
        if (oData) {
            console.log("print oData",oData)
            const oModel = oDialog.getModel("dialogData");
            if (oModel) {
                   console.log("show model2..", oModel)
                   oModel.setData(oData); // Mise à jour remplacement du model 
            } else {
                    console.log("start model")
                    oDialog.setModel(new JSONModel(
                         oData,
                    ), "dialogData");

                    const oModel = oDialog.getModel("dialogData");
            }
        }
        // 4. Ouvrir le dialog
        oDialog.open();
    }

    // 2. Bouton "Confirmer" du fragment
    public onConfirmAuth(): void {
        const sUser = (this.byId("loginUser") as any).getValue();
        const sPass = (this.byId("loginPassword") as any).getValue();

        // Simulation simple d'authentification
        if (sUser === "admin" && sPass === "123") {
            this.onCloseLogin();
            this._executePendingAction();
        } else {
            MessageToast.show("Identifiants incorrects");
        }
    }
    
    private _executePendingAction(): void {
        if (this._pendingAction.type === "DELETE") {
            // Logique de suppression ici
            MessageToast.show("Suppression réussie !");
        } else if (this._pendingAction.type === "EDIT") {
             this._handleEdit();
        }
    }

    private _handleEdit(): void {
        console.log("start stock change.....")
        // Récupérer les données sélectionnées depuis le contexte
        const oSelectedData = this._pendingAction.context.getObject();
        console.log("show current clicked data", oSelectedData)
        // Charger le dialog d'édition avec les données
        this.loadDialog("com.kenne.orderapp.Fragments.SimpleForm",oSelectedData);
    }

    private async refreshView():Promise<void>{
        const oModel = this.getView()?.getModel("stock") as JSONModel;
        // Le 'true' force le rafraîchissement immédiat de tous les bindings
        oModel.refresh(true); 
    
    }
    
    public async onCreateStock():Promise<void>{
           this.loadDialog("com.kenne.orderapp.Fragments.AddStockDialog",null)
    }

    public async onAddStock():Promise<void>{
         const StockId = (this.byId("AddStockInput1") as any).getValue();
         const ProductId = (this.byId("AddStockInput2") as any).getValue();
         const SkuId = (this.byId("AddStockInput3") as any).getValue();
         const Quantity = (this.byId("AddStockInput4") as any).getValue();
         //const Unit = (this.byId("AddStockInput5") as any).getValue();
         const AvailableQuantity = (this.byId("AddStockInput6") as any).getValue();
         const iQuantity = Number(Quantity);
         const iAvailableQuantity =  Number(AvailableQuantity)
         const dbData =  { StockId: StockId, ProductId: ProductId, SkuId: SkuId, Quantity: iQuantity, AvailableQuantity: iAvailableQuantity }
         const sStock: Stock = new Stock(dbData);
         try{
                const oCreatedStock = await this._stockService.createStocks(sStock);
                 
                // OPTIMISATION : Add directly created stock to model to avoid N+1 request
                const oModel = this.getView()?.getModel("stock") as JSONModel;
                const aItems: Stock[] = oModel.getProperty("/items") || [];
                
                // Add new stock at the begining of list
                aItems.unshift(oCreatedStock);
                oModel.setProperty("/items", aItems);
                
                MessageToast.show("Stock ajouté avec succès !");
            }catch (error: any) {

                if (error.statusCode === 400 || error.statusCode === 409) {
                    MessageBox.error(error.message); // message RAP
                } else {
                    MessageBox.error("Erreur technique");
                }

                this.onCloseDialogAddStock();
            } 
    }

    public async onUpdateStock(): Promise<void> {
        // 1. Récupérer les valeurs avec validation
        const oQuantityInput = this.byId("StockInput6") as Input;
        const oStockIdInput = this.byId("StockInput1") as Input;
        if (!oQuantityInput || !oStockIdInput) {
            MessageToast.show("current view not embedded this input")
            return;
        }
        
       const sStockId = oStockIdInput.getValue().trim();
       const sQuantityValue = oQuantityInput.getValue().trim();
       const iQuantity = Number(sQuantityValue);

       await this._stockService.ModifyStock(sStockId,iQuantity)

       if(!sStockId){
         MessageToast.show("stockId is required")
         if(!sQuantityValue){
            MessageToast.show("quantity is required")
         }
       }
       
       else{
            console.log(`update stock : ${sStockId}, Quantité: ${iQuantity}`);
            //Get the stock model from view
            const oModel = this.getView()?.getModel("stock") as JSONModel;
            if (!oModel) {
                return;
            }
            // retrieve the stock list from model
            const aStocks: Stock[] = oModel.getProperty("/items");
            MessageToast.show(`Stock ${sStockId} mis à jour avec succès !`);
            //check if stocks exist and is an array
            if (!Array.isArray(aStocks)) {
                console.log("not array")
                return;
            }
            // find stock index to mofify
            const iIndex = aStocks.findIndex(stock => stock.StockId === sStockId);

            if (iIndex === -1) { 
                console.log("index not")
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
            this.onCloseDialogStock()
       }

    }

    //helper update manually stock 
  
    public onCloseDialogStock () : void{
         (this.byId("StockDialog") as any).close(); // this work because fragmentId is attached to the ViewId
       
    }

    public async onCloseDialogAddStock(): Promise<void>{

          (this.byId("AddStockDialog") as any).close();

    }

    public onCloseLogin(): void {
        (this.byId("idLoginDialog") as any).close();
    }


    
    private getProductsData(): IStock[] {
        return [
                    { StockId: "PRD-001", ProductId: "P2333", SkuId: "S1233", Quantity: 25, Unit: "pcs" , AvailableQuantity: 0 },
                    { StockId: "PRD-002", ProductId: "P2333", SkuId: "S1233", Quantity: 25, Unit: "pcs", AvailableQuantity: 0 },
                    { StockId: "PRD-003", ProductId: "P2333", SkuId: "S1233", Quantity: 25, Unit: "pcs", AvailableQuantity: 0 },
                ]
        }
        

}
