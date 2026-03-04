import Controller from "sap/ui/core/mvc/Controller"
import JSONModel from "sap/ui/model/json/JSONModel";
import { IProduct } from "../model/IProduct";
import { Zproduct } from "../model/Zproduct";
import MessageToast from "sap/m/MessageToast";
import { ProductService } from "../Services/ProductService";
import { IProductRepos } from "../Repositories/IProductRepository";
import { ZProductImpl } from "../Repositories/impl/ZProductImpl";
import {ODataRequestErrorHelper} from "../Helpers/oDataRequestErrorHelper";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { OrderService } from "../Services/OrderService";
import { IOrderStorageRepo } from "../Repositories/IOrderStorageRepository";
import { OrderStorageImpl } from "../Repositories/impl/OrderStorageImpl";
import { IOrderRepository } from "../Repositories/IOrderRepository";
import { OrderImpl } from "../Repositories/impl/OrderImpl";
import { IOrder } from "../model/IOrder";
import { IOrderItem } from "../model/IOrder_item";
import { BatchService } from "../Services/OrderBatchService";
import {  BatchServiceProcess } from "../Services/BatchService";
import CartService from "../Services/CartService";
import { IorderItemStorage } from "../Repositories/IOrder_ItemStorageRepository";
import { OrderItemStorage } from "../Repositories/impl/Order_ItemStrorage_impl";
import { createBatchService } from "../Services/CreateBatchService";
import { CartServiceProcess } from "../Services/CartServiceProcess";
import { CreateCartServiceProcess } from "../Services/CreateCartServiceProcess";
import { ICartItem } from "../Services/Interfaces/IcartService";
//import Controller from "./BaseController"; // ou votre import habituel
import Fragment from "sap/ui/core/Fragment";
import Popover from "sap/m/Popover";
import Button from "sap/m/Button";
import Event from "sap/ui/base/Event";
import UIComponent from "sap/ui/core/UIComponent";
import { ProductStorageHelper } from "../Helpers/ProductStorageHelper";
import { CartStorageHelper } from "../Helpers/CartStorageHelper";
import { CreateOrderDependencies } from "../Helpers/CreateOrderDependencies";
import { OrderStorageHelper } from "../Helpers/OrderStorageHelper";

export default class ProductsController extends Controller {
    private orderService : OrderService
    private cartService : CartService
    private batchServicep :  BatchServiceProcess
    private iOrderItemStorageRepo: IorderItemStorage
    private iorderStorage : IOrderStorageRepo
    private iorderRepo : IOrderRepository
    private productService : ProductService
    private iproductrepo : IProductRepos
    private orderBatchService:  BatchService;
    private oODataModel : ODataModel
    private _oDataRequestErrorHelper : ODataRequestErrorHelper  
    private cartserviceProcess : CartServiceProcess   
    private _oMobileMenu: Popover | null = null;
    private _pendingAction: any; // Pour stocker l'action (delete ou edit)
    private _mDialogs: Map<string, Promise<any>> = new Map();
    private _bMenuLoading: boolean = false; // ✅ évite double chargement
    // Dans la classe :
    private _bExpanded : boolean
    products: Zproduct[] = [];
    OrderUuid: string = '';
    images: string[] = [
                "images/handy.jpg",
                "images/kopfhörer.jpg",
                "images/pc.jpg",
                "images/tablet.jpg",
                "images/Uhr.jpg",
                "images/Uhr.jpg",
        ];
    
    onInit(): void {
            this._oDataRequestErrorHelper = new ODataRequestErrorHelper();
            this.oODataModel = this.getOwnerComponent()?.getModel() as ODataModel;
            this.iproductrepo = new ZProductImpl(this.oODataModel, this._oDataRequestErrorHelper);
            this.productService = new ProductService(this.iproductrepo)
            this.orderBatchService = new BatchService(this.oODataModel, this._oDataRequestErrorHelper);
            this.iOrderItemStorageRepo = new OrderItemStorage();
            this.batchServicep = createBatchService(this.oODataModel, this._oDataRequestErrorHelper);
            CreateOrderDependencies.initializeOrderDependencies(
                this.oODataModel, 
                this._oDataRequestErrorHelper,
                this.iorderRepo,
                this.iorderStorage,
                this.orderService
            )    
            
            this._bExpanded = false;
            //this.iOrderItemStorageRepo.clearOrderItem("myCart")
            //this.iOrderItemStorageRepo.clearOrderItem("myCount")
            //this.iOrderItemStorageRepo.clearOrderItem("myTotal")
            //this.iOrderItemStorageRepo.clearOrderItem("myProducts")
             
            
            
            const oModelUi  = new JSONModel({
                isCartVisible: false 

            })
            

            this.getView()?.setModel(oModelUi,"ui");
            const oModeldata = new JSONModel({
                  
                products: [],
                cartItems: [], 
                totalAmount: 0,
                filteredItems: [],
                countSelectedProduct: 0

            })
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
            const oModel = this.getView()?.getModel("products") as JSONModel;
            this.cartserviceProcess = CreateCartServiceProcess(
                this.oODataModel, 
                oModel,
                this._oDataRequestErrorHelper,
                this.iOrderItemStorageRepo,
            )

            this.handleAuthCallback();  
            this.setCartModelFromMemory(oModel);
            this.saveOrder();
            //this.initializeOrder(); // create order
            this.setProductsWithFallback(oModel);  
                  // ici parceque l'app vas redemarer grace a la redirection 
    }
    
    


    // --- PARTIE 2 : GÉRER LE RETOUR DE SAP (AU CHARGEMENT DE LA PAGE) ---
public handleAuthCallback(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const sAuthCode = urlParams.get('code');

    if (sAuthCode) {
        console.log("Code reçu, échange contre un Token...");
        console.log("Code reçu, échange contre un Token... ",sAuthCode);
        this.exchangeCodeForToken(sAuthCode);
    }
}


// Utilitaire : générer un code_verifier aléatoire
private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Utilitaire : dériver le code_challenge depuis le verifier
private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// PARTIE 1 : Lancer la connexion
public async onLoginPress(): Promise<void> {
    const sClientId = "88dd4681-0e04-417f-9b15-c6d97022e374";
    //const sRedirectUri = "http://localhost:8080/index.html"; // ✅ pas d'encode ici
    const sRedirectUri = window.location.hostname === "localhost"
    ? "http://localhost:8080/index.html"
    : `https://${window.location.hostname}/index.html`;

    const sCodeVerifier = this.generateCodeVerifier();
    const sChallenge = await this.generateCodeChallenge(sCodeVerifier);

    // ✅ Stocker le verifier pour l'étape 3
    sessionStorage.setItem("pkce_code_verifier", sCodeVerifier);

    window.location.href = `https://ankyikmcs.trial-accounts.ondemand.com/oauth2/authorize`
        + `?response_type=code`
        + `&client_id=${sClientId}`
        + `&redirect_uri=${encodeURIComponent(sRedirectUri)}`
        + `&scope=openid%20profile%20email`
        + `&code_challenge=${sChallenge}`
        + `&code_challenge_method=S256`;     
}


// PARTIE 3 : Échanger le code
private async exchangeCodeForToken(code: string): Promise<void> {
    const sCodeVerifier = sessionStorage.getItem("pkce_code_verifier"); // ✅ récupéré
    const sClientId = "88dd4681-0e04-417f-9b15-c6d97022e374";
    //const sRedirectUri = "http://localhost:8080/index.html"; // ✅ pas d'encode ici
     const sRedirectUri = window.location.hostname === "localhost"
    ? "http://localhost:8080/index.html"
    : `https://${window.location.hostname}/index.html`;
    //const sTokenEndpoint = "/oauth2/token"; // local
    const sTokenEndpoint = "https://ankyikmcs.trial-accounts.ondemand.com/oauth2/token"; // in production

    

    const CodeVerifier = sessionStorage.getItem("pkce_code_verifier");

        if (!CodeVerifier) {
            console.error("❌ code_verifier manquant !");
            return;
    }

    const body = new URLSearchParams({ // ✅ URLSearchParams encode lui-même
        grant_type: "authorization_code",
        code: code,
        client_id: sClientId,
        redirect_uri: sRedirectUri,
        code_verifier: sCodeVerifier!
    });


    try {
        const response = await fetch(sTokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        });

        const data = await response.json();
        

        if (data.id_token) {
            console.log("Connexion réussie !",data);
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
    }

    public navigateToAdmin(): void{
        console.log("start navigation.....")
        const oRouter = UIComponent.getRouterFor(this);  
        oRouter.navTo("RouteDashboardAdmin");

    }
    
    private setProductModelFromMemory(oModel: JSONModel): void {
        const products = ProductStorageHelper.resolveProductsFromStorage(this.iOrderItemStorageRepo);
        oModel.setProperty("/products", products);
    }


    private setCartModelFromMemory(oModel: JSONModel): void {
        const { items, totalAmount, count } = CartStorageHelper.resolveCartFromStorage(
            this.iOrderItemStorageRepo
        );

        oModel.setProperty("/filteredItems", items);
        oModel.setProperty("/totalAmount", totalAmount.toFixed(2));
        oModel.setProperty("/countSelectedProduct", count);
    }

    /*
    
    private getProductFromMemory(oModel:any): void{
        //const oModel = this.getView()?.getModel("products") as JSONModel;
        let sProduct = this.iOrderItemStorageRepo.getOrderItem("myProducts");
        let mProduct: any[] = [];
         if((typeof sProduct  === "string")){
              if (sProduct .trim() === "") {
                console.log("Panier vide (string vide)");
                 mProduct = [];
              } else if (sProduct.startsWith("[object")) {
                 mProduct = [];
              }else {
                //  Parser la chaîne JSON
                try {
                      mProduct = JSON.parse(sProduct);
                    if(typeof  mProduct  === "string"){
                     mProduct= JSON.parse( mProduct ); // Donne enfin le tableau []
                    }
                    console.log("JSON parsé avec succès:", mProduct .length, "items");
                } catch (parseError) {
                    console.error(" Erreur parsing JSON:", parseError);
                    console.error(" Contenu:", sProduct);
                   mProduct  = [];
                }
               
            }
        }
        
        oModel.setProperty("/products", mProduct);
    }
   
    */


    /*
   
    private getCartItemsFromMemory(oModel: JSONModel): void{
        let sCart = this.iOrderItemStorageRepo.getOrderItem("myCart");
        const sTotalAmount = this.iOrderItemStorageRepo.getOrderItem("myTotal");
        const sCountCart = this.iOrderItemStorageRepo.getOrderItem("myCount");
        
        console.log("start memory", sCart)
        console.log("start count", sCountCart)
        console.log("start total ",sTotalAmount)
        let aItems: any[] = [];
        let nTotalAmount = 0;
        let nCount = 0;
        if((typeof sCart === "string")){
              if (sCart.trim() === "") {
                console.log("Panier vide (string vide)");
                aItems = [];
              } else if (sCart.startsWith("[object")) {
                aItems = [];
              }else {
                //  Parser la chaîne JSON
                try {
                     aItems = JSON.parse(sCart);
                    if(typeof  aItems === "string"){
                      aItems= JSON.parse( aItems); // Donne enfin le tableau []
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
            nTotalAmount = parseFloat(sTotalAmount);  // string → number
            
            if (isNaN(nTotalAmount)) {
                console.warn("Total invalide, initialisation à 0");
                nTotalAmount = 0;
            }
        }
        if (sCountCart && sCountCart !== "null" && sCountCart !== "undefined") {
            nCount = parseInt(sCountCart, 10);  // string → number (entier)
            
            if (isNaN(nCount)) {
                console.warn(" Count invalide, initialisation à 0");
                nCount = 0;
            }
        }

        oModel.setProperty("/filteredItems", aItems);
        oModel.setProperty("/totalAmount",nTotalAmount.toFixed(2));
        oModel.setProperty("/countSelectedProduct",nCount);
    }
    */

    private async saveOrder(): Promise<void> {

        if(OrderStorageHelper.hasExistingOrder(this.iorderStorage)){
           console.log('Commande existante:', this.OrderUuid);
           return;
        }

         const newOrder: IOrder = {
            "OrderId": "2026003",
            "CustomerId": "0000000014",
            "TotalAmount": 0,
            "Currency": "EUR",
            "Status": "PENDING"
        };

        const response = await this.orderService.saveOrder(newOrder) ;

    }
    
    /** 
    // this methode make many thing it need refactory
    private async  initializeOrder(): Promise<void> {
        this.iorderStorage = new OrderStorageImpl();
        this.OrderUuid = this.iorderStorage.getOrderUuid() || '';
        
        // verify order in localstorage
        if (this.OrderUuid) {
           console.log('Commande existante:', this.OrderUuid);
           return;

        }
            
        //this.iorderRepo = new OrderImpl(this.oODataModel, this._oDataRequestErrorHelper);
        //this.orderService  = new OrderService (this.iorderRepo,this.iorderStorage);

        const newOrder: IOrder = {
            "OrderId": "2026003",
            "CustomerId": "0000000014",
            "TotalAmount": 0,
            "Currency": "EUR",
            "Status": "PENDING"
        };

        const response = await this.orderService.saveOrder(newOrder) ;
        console.log("new order value", response)

    }
   */

    private async setProductsWithFallback(oModel:JSONModel):Promise<void> {
        const sProducts = this.iOrderItemStorageRepo.getOrderItem("myProducts");

        if (!sProducts || sProducts === "null" || sProducts === "undefined" || sProducts.trim() === "") {
            try {
                // load data from backend
                const dProduct =  await this.getProductFromDb();
                const sProducts = JSON.stringify(dProduct);
                this.iOrderItemStorageRepo.setOrderItem("myProducts",sProducts)
                    
                //  RÉCUPÉRER le modèle d'abord
                // const oModel = this.getView()?.getModel("products") as JSONModel;

                // On met à jour le modèle existant
                oModel.setProperty("/products", this.products);
                console.log('Modèles créés avec', this.products);
            } catch (error) {
                console.error('Erreur initialisation:', error);
            }
        }else{
              this.setProductModelFromMemory(oModel);
        }
    }
    
    private async getProductFromDb(): Promise<Zproduct[]>{
        try {
    
            const db_products = await this.productService.getAllProducts();
            
            if (!db_products) {
                this.products = [];
            }

            this.products = db_products.map((product: Zproduct, index: number) => {
            product.ImageUrl = (this.images && this.images[index]) ? this.images[index] : '';
            return product;
            });
            
            return this.products
            //const sProducts = JSON.stringify(this.products);
            //this.iOrderItemStorageRepo.setOrderItem("myProducts",sProducts)
        } catch (error) {
            console.error('Erreur:', error);
            throw error;  
        }
    }
    
    

    onDelete(oEvent:any): void {
        const oButton = oEvent.getSource();
        const oContext = oButton.getBindingContext("products"); // products is given model name
        const oCartItem = oContext.getObject() as ICartItem;
       
        if(oCartItem){
            //https://abapcloud.com/sap-event-mesh-abap-cloud/
          this.cartserviceProcess.deleteFromCart(oCartItem);
        }

    }

   
    addToCard(oEvent:any):void{
            const oButton = oEvent.getSource();
            const oContext = oButton.getBindingContext("products");
            const oProduct = oContext.getObject() as Zproduct ;
           
            this.cartserviceProcess.addToCart(oProduct);
    }

    private _updateTotal(aCartItems: any[]): void {
        const oModel = this.getView()?.getModel() as JSONModel;
        const total = aCartItems.reduce((sum, item) => sum + item.subtotal, 0);
        oModel.setProperty("/total", total);
    }

    private toggleDisplay(): void {
            const oModel = this.getView()?.getModel("ui") as JSONModel;
            const aVisible = oModel.getProperty("/isCartVisible");
            
            oModel.setProperty("/isCartVisible", !aVisible)

    }

    public formatStock(iInStock: number): string {
        return iInStock > 0 ? `En stock ` : "Rupture";
    }

    public getStockState(iInStock: number): string {
        return iInStock > 0 ? "Success" : "Error";
    }



 

public async onHamburgerPress(oEvent: Event): Promise<void> {
  const oButton = oEvent.getSource() as Button;

  if (this._bMenuLoading) return; // ✅ bloque si déjà en cours de chargement

  if (!this._oMobileMenu) {
    this._bMenuLoading = true;
    try {
      this._oMobileMenu = await Fragment.load({
        name: "com.kenne.orderapp.Fragments.MobileMenu", // ⚠️ sans id de vue
        controller: this
      }) as Popover;

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



}