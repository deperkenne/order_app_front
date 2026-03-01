import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageToast from "sap/m/MessageToast";
import Event from "sap/ui/base/Event";
import { IProduct } from "../model/IProduct";
import FlexBox from "sap/m/FlexBox";

/**
 * @namespace com.kenne.orderapp.controller
 */


export default class ProductsController extends Controller {
    public onInit(): void {
        
        const oAddedProductsModel = new JSONModel({
            addedProducts: [] as IProduct[],
            countSelectedProduct: 0
        });
        // Créer le modèle de données
        const oProductsModel = new JSONModel({
            products: this.getProductsData(),
            countSelectedProduct:0,
            filters: {
                searchQuery: "",
                selectedCategory: "All"
            },
            categories: ["All", "Électronique", "Audio", "Téléphonie", "Accessoires", "Photo"]
        });

        this.getView()?.setModel(oAddedProductsModel,"addedProducts") // envoi des donnee vers la vue

        this.getView()?.setModel(oProductsModel, "products"); // ici on passe uniquement les produits a la vue
    }
    
    private getProductsData(): IProduct[] {
        return [
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
                quantity: 1,
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
        ];
    }
    
    public onSearch(oEvent: any): void {
        const sQuery = oEvent.getParameter("newValue");
        const oModel = this.getView()?.getModel("products") as JSONModel;
        oModel.setProperty("/filters/searchQuery", sQuery); // grace a setProperty les changement sont detecter automatiquement et la vue 
                                                            // est reactualiser automatiquement
        this.applyFilters();
    }
    
    public onCategorySelect(oEvent: any): void {
        const sCategory = oEvent.getParameter("selectedItem").getKey();
        const oModel = this.getView()?.getModel("products") as JSONModel;
        oModel.setProperty("/filters/selectedCategory", sCategory);
        this.applyFilters();
    }
    
    private applyFilters(): void {
        // Logique de filtrage (simplifiée pour l'exemple)
        MessageToast.show("Filtres appliqués");
    }


    /**
     *  
     * @param oEvent 
     *  const oContext = oButton.getBindingContext("products");
    🔹 Récupère le BindingContext du bouton
    🔹 "products" = nom du modèle (model name)
    🔹 Le contexte correspond à l’élément courant du binding (le produit)
     */
    
    public onAddToCart(oEvent: any): void {
        const oButton = oEvent.getSource();
        const oContext = oButton.getBindingContext("products");
        const oProduct = oContext.getObject() as IProduct;

        // Récupérer le modèle appeler "addedProducts"
        const oModel = this.getView()?.getModel("addedProducts") as JSONModel;
        // recuperation de la list orders dans le model oData
        const aProducts = oModel.getProperty("/addedProducts");
        MessageToast.show(`${aProducts.length} longeur de la list`);
        if(aProducts){
            aProducts.push(oProduct)
            const product = aProducts[0].name;
            MessageToast.show(product + "name product");
            // remplacement de l'ancient orders par le nouveau
            oModel.setProperty("/addedProducts", aProducts );
            this.countProducts();
            MessageToast.show(`${oProduct.name} ajouté au panier`);
        }

    }


  
    private toggleDisplay(): void {
        const oFlexBox = this.byId("flexboxProductsCard") as FlexBox;

        if (!oFlexBox) {
            return;
        }

        oFlexBox.setVisible(!oFlexBox.getVisible());
    }
    



    
    // helper function
    private countProducts(): void {
        const oModel = this.getView()?.getModel("products") as JSONModel;

        if (!oModel) {
            return;
        }
        const iCount = oModel.getProperty("/countSelectedProduct") || 0;
        oModel.setProperty("/countSelectedProduct", iCount + 1);
        this.applyFilters();
    }

    public onProductPress(oEvent: any): void {
        const oItem = oEvent.getSource();
        const oContext = oItem.getBindingContext("products");
        const oProduct = oContext.getObject() as IProduct;
        
        MessageToast.show(`Détails du produit: ${oProduct.name}`);
        // Ici vous pouvez naviguer vers une page de détails
        // this.getRouter().navTo("productDetail", { productId: oProduct.id });
    }
    
    public formatPrice(price: number, currency: string): string {
        return `${price.toFixed(2)} ${currency}`;
    }
    
    public formatStock(inStock: boolean): string {
        return inStock ? "En stock" : "Rupture de stock";
    }
    
    public getStockState(inStock: boolean): string {
        return inStock ? "Success" : "Error";
    }
}
