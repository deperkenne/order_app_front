import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageToast from "sap/m/MessageToast";
import Event from "sap/ui/base/Event";
import Router from "sap/ui/core/routing/Router";
import UIComponent from "sap/ui/core/UIComponent";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";



/**
 * @namespace com.kenne.orderapp.controller
 */
export default class Main extends Controller {
    showLoading : boolean;
/*
    public onInit(): void {
        const oViewModel = new JSONModel({
            costumers:[]  as  Icostumer[],
            busy: false,
            selectedCustomer: null as  Icostumer | null
        });
        this.getView()?.setModel(oViewModel, "view");
    }
    
    public onNavigateTo(): void { 
        console.log("start co")
        this.showLoading = true;
      
        setTimeout(() => {
            this.showLoading = false; 
            const oRouter = UIComponent.getRouterFor(this);  
            oRouter.navTo("RouteProduct");
        }, 3000);  
    }
    
     private async loadCustomers(): Promise<void> {
        console.log("strrtttt process.....")
        const oModel = this.getOwnerComponent()?.getModel() as ODataModel;
        const oViewModel = this.getView()?.getModel("view") as JSONModel;

        if (!oModel) {
            console.error("Modèle non disponible");
            return;
        }
        console.log("models find..............")
        oViewModel.setProperty("/busy", true);
         console.log("models find..............")
        // Attendre un peu pour laisser le temps au proxy
        setTimeout(() => {
            console.log("commencement..............")
            oModel.read("/Customer", {
                success: (oData: any) => {
                    console.log("✅ Customers loaded:", oData);
                    console.log(`${oData.results?.length || 0} clients chargés`);
                    oViewModel.setProperty("/costumers", oData.results || []);
                    oViewModel.setProperty("/busy", false);
                    MessageToast.show(`${oData.results?.length || 0} clients chargés`);
                },
                error: (oError: any) => {
                    console.error("❌ Error:", oError);
                    oViewModel.setProperty("/busy", false);
                    
                    let errorMsg = "Erreur de chargement";
                    if (oError.responseText) {
                        try {
                            const parsed = JSON.parse(oError.responseText);
                            errorMsg = parsed.error?.message?.value || errorMsg;
                        } catch (e) {
                            errorMsg = oError.message || errorMsg;
                        }
                    }
                   
                }
        
            });
            console.log("✅ Customers finish:");
        }, 500); // Délai de 500ms
    }

    private createCustomer () : void {
            const oCustomer: Icostumer = {
                CustomerId: "Cktd5501",
                FirstName: "Jean",
                LastName: "Dupont",
                Email: "jean@mail.com"
            };
            const oModel = this.getOwnerComponent()?.getModel() as ODataModel;
            const oViewModel = this.getView()?.getModel("view") as JSONModel;
             console.log("start creatioin.....")
            oModel.create("/Customer", oCustomer, {
                success: () => {
                    console.log("customer created")
                    this.loadCustomers();
                }
            });


        }
        
        private async loadProducts(): Promise<void> {
            const oModel = this.getView()?.getModel() as ODataModel;
            const oViewModel = this.getView()?.getModel("view") as JSONModel;

            oViewModel.setProperty("/busy", true);

            oModel.read("/Customer", {
                success: (oData: ODataResponse<Icostumer>) => {
                    console.log("Produits chargés:", oData.results);
                    oViewModel.setProperty("/Icostumer", oData.results);
                    MessageToast.show(`${oData.results.length} produits chargés`);
            },
            error: (oError: any) => {
                console.error("Erreur:", oError);
                oViewModel.setProperty("/busy", false);
                MessageToast.show("Erreur de chargement des données");
            }
        });
    }
    

     private async testConnection(): Promise<void> {
        const oViewModel = this.getView()?.getModel("view") as JSONModel;
        
        try {
            // Tentative 1 : Récupérer le modèle
            const oModel = this.getOwnerComponent()?.getModel() as ODataModel;
            
            if (!oModel) {
                throw new Error("Modèle OData non trouvé dans le Component");
            }

            console.log("Modèle trouvé:", oModel);

            // Tentative 2 : Attendre les metadata
            oViewModel.setProperty("/busy", true);
            
            console.log("start load metadata...........................");
           // await oModel.metadataLoaded();
           //  console.log("✅ Metadata chargés avec succès");
            
            // Tentative 3 : Lire les données
           this.loadCustomers()

        } catch (error: any) {
            console.error("❌ Erreur de connexion:", error);
            oViewModel.setProperty("/busy", false);
            
            let errorMsg = "Erreur inconnue";
            if (error.message) {
                errorMsg = error.message;
            }
            
            oViewModel.setProperty("/errorMessage", errorMsg);
        }
    }
 
    public async getProducts(): Promise<void> {
           try {
            const oModel = this.getView()?.getModel() as ODataModel;
            const oListBinding = oModel.bindList("/Products");
            console.log("start fetch oData todb");
            console.log("Type de modèle:", oModel?.getMetadata().getName());
        
                oListBinding.attachEventOnce("dataReceived", () => {
                    const aContexts = oListBinding.getContexts();
                    const aData = aContexts.map(oContext => oContext.getObject());
                    console.log("my data",aData);
                });
              
                  // Déclencher la requête
                    oListBinding.getContexts(0, 100);
            } catch (oError) {
            console.error("Erreur:", oError);
   }
            
        
   }
    public onOrderPress(oEvent: Event): void {
        // Récupérer l'item cliqué
       const oItem = oEvent.getSource() as any;
       const oContext = oItem.getBindingContext();
       console.log("Event source:", oItem);
       console.log("Binding context:", oItem.getBindingContext());
        
        if (oContext) {
            const oOrder = oContext.getObject();
            MessageToast.show(`Commande sélectionnée: ${oOrder.orderNumber}`);
            
            // Ici tu pourrais naviguer vers une vue détail
            // this.getOwnerComponent().getRouter().navTo("detail", {
            //     orderId: oOrder.orderId
            // });
        }
        else{
            MessageToast.show(`Commande sélectionnée`);
        }
    }

    public onCreateOrder(): void {
        MessageToast.show("Création d'une nouvelle commande");
        
        // Récupérer le modèle
        const oModel = this.getView()?.getModel() as JSONModel;

        // recuperation de la list orders dans le model oData
        const aOrders = oModel.getProperty("/orders");
        
        // Ajouter une nouvelle commande
        const newOrder = {
            orderId: String(aOrders.length + 1),
            orderNumber: `CMD-2024-${String(aOrders.length + 1).padStart(3, "0")}`,
            customerName: "Nouveau Client",
            status: "Brouillon",
            totalAmount: 0
        };
        
        aOrders.push(newOrder);
        // remplacement de l'ancient orders par le nouveau
        oModel.setProperty("/orders", aOrders);


    }

    public changePage ():void {
     
        console.log("start navigation...........")
        const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
        if(oRouter){
            console.log("navigate to page Test")
           oRouter.navTo("RouteProduct");
        }

    }
        */
}