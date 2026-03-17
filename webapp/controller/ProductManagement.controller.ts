import Controller   from "sap/ui/core/mvc/Controller";
import JSONModel    from "sap/ui/model/json/JSONModel";
import MessageToast from "sap/m/MessageToast";
import { ProductService } from "../Services/ProductService";
import { IProductRepos } from "../Repositories/IProductRepository";
import { ZProductImpl } from "../Repositories/impl/ZProductImpl";
import {ODataRequestErrorHelper} from "../Helpers/oDataRequestErrorHelper";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { Zproduct } from "../model/Zproduct";
import Fragment from "sap/ui/core/Fragment";
import MessageBox from "sap/m/MessageBox";
import Input from "sap/m/Input";
import UIComponent from "sap/ui/core/UIComponent";
export default class UserManagementController extends Controller {
    products: Zproduct[] = [];
    private zproductImpl : ZProductImpl;
    private iproductrepo : IProductRepos;
    private productService: ProductService;
    private oODataModel : ODataModel
    private _oDataRequestErrorHelper : ODataRequestErrorHelper  
    private _pLoginDialog: Promise<any>;
    private _pendingAction: any; // Pour stocker l'action (delete ou edit)
    private _mDialogs: Map<string, Promise<any>> = new Map();
    
    public onInit(): void {
        this.oODataModel = this.getOwnerComponent()?.getModel() as ODataModel;
        this.iproductrepo = new ZProductImpl(this.oODataModel , this._oDataRequestErrorHelper)
        this.productService = new ProductService(this.iproductrepo)

        // Initialiser le modèle UI avec isLoading à true
        const oUiModel = new JSONModel({ isLoading: true });
        this.getView()?.setModel(oUiModel, "ui");

       
        const oModeldata = new JSONModel({    
                    products: [],
                })

        this.getView()?.setModel(oModeldata, "um");

        this.getProductFromDb(oModeldata);
    }
   
    private onNavBack(): void{
        const oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("RouteDashboardAdmin");

    }
    
    // Fetches all products from the backend 
    private async getProductFromDb(oModel:JSONModel): Promise<Zproduct[]> {
        try {
            const db_products = await this.productService.getAllProducts();
            const oUiModel = this.getView()?.getModel("ui") as JSONModel;
            if (!db_products) {
                this.products = [];
            }
            else{
                this.products = db_products
                oModel.setProperty("/products", this.products);
                oUiModel?.setProperty("/isLoading", false);
            }
            return this.products;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }


  // Called by Edit  button — retrieves selected product and opens the dialog
    public onEditProduct(oEvent: any, sActionType: string): void {
        
        // Get binding context of the clicked row
        const oContext = oEvent.getSource().getBindingContext("um");

        // Extract product data from the context
        const oData = oContext?.getObject() as any;
        console.log("Selected product:", oData);

        // Open the Edit dialog and inject product data
        this.loadDialog("comkenneorderapp.Fragments.SimpleForm", oData);
    }

    public onDeleteProduct(oEvent: Event): void {


    }
    
    // Helper method — loads and opens a fragment dialog, caches it to avoid reloading
    private async loadDialog(dialogName: string, oData?: any): Promise<void> {
        console.log("show data oData", oData)

        // Load fragment only once — skip if already cached
        if (!this._mDialogs.has(dialogName)) {
            const pDialog = Fragment.load({
                id: this.getView()?.getId(),  // Attach fragment to the View ID
                name: dialogName,             
                controller: this              
            })
            .then((oDialog: any) => {
                // Handle both single Control and Control[] responses
                const dialog = Array.isArray(oDialog) ? oDialog[0] : oDialog;

                // Register dialog as dependent of the view for lifecycle management
                this.getView()?.addDependent(oDialog);

                return oDialog;
            });

            console.log(dialogName, "correct");

            // Store promise in cache immediately to prevent double loading on fast clicks
            this._mDialogs.set(dialogName, pDialog);
        }

        // Open the dialog and inject data
        try {
            await this.setDialog(dialogName, this._mDialogs, oData);
        } catch (error) {
            console.error("Erreur lors de l'ouverture du dialogue:", error);
        }
    }

    // Opens a cached dialog and injects data into it
    // oData = null for create form (empty), oData = object for edit form (prefilled)
    private async setDialog(dialogName: string, mDialogs?: any, oData?: any): Promise<void> {
        try {
            console.log("Tentative de récupération du dialogue:", dialogName);

            // Wait for the dialog promise to resolve
            const oRawDialog = await mDialogs.get(dialogName);

            if (!oRawDialog) {
                console.error("Le dialogue n'a pas pu être chargé (oDialog est null)");
                return;
            }

            // Handle both single Control and Control[] returned by Fragment.load()
            const oDialog = Array.isArray(oRawDialog) ? oRawDialog[0] : oRawDialog;

            console.log("Type du dialog récupéré:", oDialog?.getMetadata?.().getName());

            // Ensure the resolved object is a valid dialog with an open() method
            if (!oDialog || typeof oDialog.open !== "function") {
                console.error("oDialog n'est pas un Dialog valide:", oDialog);
                return;
            }

            console.log("Dialogue chargé avec succès, injection des données...");

            // Inject data into dialog model — update existing or create new
            if (oData) {
                let oModel = oDialog.getModel("dialogData");
                if (oModel) {
                    oModel.setData(oData);
                } else {
                    oDialog.setModel(new JSONModel(oData), "dialogData");
                }
            } else {
                // Reset model for create mode
                oDialog.getModel("dialogData")?.setData({});
            }

            // Open dialog only if not already open
            if (!oDialog.isOpen()) {
                oDialog.open();
                console.log("Méthode .open() appelée avec succès");
            } else {
                console.log("Le dialogue est déjà ouvert");
            }

        } catch (oError) {
            console.error("Erreur fatale dans setDialog:", oError);
        }
    }
    

    private _executePendingAction(dialogName:string): void {
                this._handleEdit(dialogName);
    
    }

    private _handleEdit(dialogName:string): void {
        console.log("start stock change.....")
        // Récupérer les données sélectionnées depuis le contexte
        const oSelectedData = this._pendingAction.context.getObject();
        console.log("show current clicked data", oSelectedData)
        // Charger le dialog d'édition avec les données
        this.loadDialog(dialogName,oSelectedData);
    }

    private async refreshView():Promise<void>{
        const oModel = this.getView()?.getModel("stock") as JSONModel;
        // Le 'true' force le rafraîchissement immédiat de tous les bindings
        oModel.refresh(true); 
    
    }
    
    public async onCreateProduct():Promise<void>{
            await this.loadDialog("comkenneorderapp.Fragments.AddProduct",null)
    }

    public async onCloseDialog(): Promise<void>{
            (this.byId("AddProductD") as any).close();
    }

    public async onAddProduct():Promise<void>{
        // Get input values from the Add Product dialog
        const productName = (this.byId("AddProductInput1") as any).getValue();
        const currency = (this.byId("AddProductInput2") as any).getValue();
        const price = (this.byId("AddProductInput3") as any).getValue();
        const iPrice = Number(price);

        // Build payload and create domain object
        const dbData = { ProductId:300, Productname: productName, Price:iPrice, Currency: currency};
        const dProduct: Zproduct = new Zproduct(dbData);

        try {
            // Save product to backend
            const oProduct = await this.productService.save(dProduct);

            // Update local model to avoid extra network request
            const oModel = this.getView()?.getModel("um") as JSONModel;
            const aProducts: Zproduct[] = oModel.getProperty("/products") || [];

            // Add new product at the top of the list
            aProducts.unshift(oProduct);
            oModel.setProperty("/products", aProducts);

            // Close dialog and notify user
            this.onCloseDialog();
            MessageToast.show("Add product success !");

        } catch (error: any) {
            // Handle known business errors from RAP backend
            if (error.statusCode === 400 || error.statusCode === 409) {
                MessageBox.error(error.message);
            } else {
                MessageBox.error("technic error");
            }
        } 
    }

    public async onUpdateProduct(): Promise<void> {
        // Get input controls from the Edit Product dialog
        const productId   = this.byId("ProductInput1") as Input;
        const productName = this.byId("ProductInput2") as Input;
        const currency    = this.byId("ProductInput3") as Input;
        const price       = this.byId("ProductInput4") as Input;

        // Check that all inputs are available before proceeding
        if (!productId || !productName || !currency || !price) {
            console.error("Inputs not found — check fragment IDs");
            return;
        }

        // Extract and trim input values
        const sProductId = Number(productId.getValue())
        const sName      = productName.getValue().trim();
        const sCurrency  = currency.getValue();
        const iPrice     = price.getValue();
       const sPrice= Number(iPrice);
        
        // Build payload and create domain object
        const dbData = { ProductId: sProductId, Productname: sName, Price: sPrice, Currency: sCurrency };
        const dProduct: Zproduct = new Zproduct(dbData);

        try {
            // Send update request to backend
            await this.productService.updateProduct(sProductId, dProduct);

            // Update local model to avoid extra network request
            const oModel = this.getView()?.getModel("um") as JSONModel;
            const aProducts: Zproduct[] = oModel.getProperty("/products") || [];
            const iProductId = String(productId.getValue());
            
            // Find the product index in the local list
            const iIndex = aProducts.findIndex(p => String(p.ProductId) === iProductId)

            if (iIndex === -1) { 
                console.log("Product index not found");
                return;
            }

            // Apply changes to the found product
            aProducts[iIndex].Productname = sName;
            aProducts[iIndex].Currency    = sCurrency;
            aProducts[iIndex].Price       = sPrice;

            // Refresh UI by updating the model
            oModel.setProperty("/products", aProducts);

            // Close dialog and notify user
            this.onCloseDialogEdit();
            MessageToast.show("Modify product success !");

        } catch (error: any) {
            // Handle known business errors from RAP backend
            if (error.statusCode === 400 || error.statusCode === 409) {
                MessageBox.error(error.message);
            } else {
                MessageBox.error("technic error");
            }
        } 
    }

    public async onCloseDialogEdit(): Promise<void> {
        // Close the Edit Product dialog
        (this.byId("ProductEditDialog") as any).close();
    }
    
}