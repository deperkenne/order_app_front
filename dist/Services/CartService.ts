import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { ODataRequestErrorHelper } from "../Helpers/oDataRequestErrorHelper";
import JSONModel from "sap/ui/model/json/JSONModel";
import { IOrderItem } from "../model/IOrder_item";
import { Zproduct } from "../model/Zproduct";
import { IorderItemStorage } from "../Repositories/IOrder_ItemStorageRepository";
import { IOrderStorageRepo } from "../Repositories/IOrderStorageRepository";
import {BatchService}   from "../Services/OrderBatchService";
import { BatchServiceProcess } from "./BatchService";



export default class CartService{
    private iOrderItemStorage: IorderItemStorage
    private iOrderStorage : IOrderStorageRepo
    private orderBatchService : BatchService
    private oDataModel: ODataModel;
    private productsModel: JSONModel; 
    private batchService: BatchServiceProcess;
    private CartItems:{}
    
    constructor(
        productsModel: JSONModel,  
        oDataModel: ODataModel,
        iOrderItemStorage: IorderItemStorage,
        iOrderStorage: IOrderStorageRepo,
        orderBatchService : BatchService,
        batchService: BatchServiceProcess,
    ) {
        this.productsModel = productsModel; 
        this.oDataModel = oDataModel;
        this.iOrderItemStorage = iOrderItemStorage;
        this.iOrderStorage = iOrderStorage;
        this.orderBatchService = orderBatchService;
        this.batchService = batchService;
    }

    async deleteToCart(orderItem: any) {
        const currentItems: any[] = this.productsModel.getProperty("/filteredItems") || [];
        const orderUuid = this.iOrderStorage.getOrderUuid() || '';
        const itemIndex = currentItems.findIndex((item: any) => item.productId === orderItem.productId);

        if (itemIndex === -1) {
            console.warn(`Item with ProductId ${orderItem.productId} not found in cart`);
            return;
        }

        currentItems[itemIndex].quantity -= 1;
        currentItems[itemIndex].grossAmount = currentItems[itemIndex].quantity * currentItems[itemIndex].price
        // delete item dans le panier si la qty est inferieur ou egal 0
        if (currentItems[itemIndex].quantity <= 0) {
            currentItems.splice(itemIndex, 1);
        }
        
        this.productsModel.setProperty("/filteredItems", currentItems);
        const newTotal = this.recalculateTotal(currentItems)
        // Restaurer l'état précédent
        this.productsModel.setProperty("/totalAmount", newTotal);
        this.productsModel.setProperty("/countSelectedProduct", currentItems.length);

        // Restaurer aussi la mémoire navigateur
        this.saveCartInMemory(currentItems);


        try{
            // Appeler le service batch
            const result = await this.batchService.deleteProductAndRefresh(
                currentItems[itemIndex] , orderUuid
            );
            
            if (result && result.newItems) {
                result.newItems = result.newItems.map((item: any) => ({
                    ...item,
                    imageUrl: orderItem.imageUrl || '',
                }));

                // make data synchronisation
                this.reconcileWithBackend(result,orderItem.productName)
                
            }
        }catch(error){
         this.rollback(orderItem.ProductId)
         alert("Quantity for product: " + orderItem.Productname + " not available");
        }

    }

    

    async addToCart ( oProduct: Zproduct){
        // cart update with frontend calcul
        this.updateUIOptimistically(oProduct)  
         
        const orderUuid = this.iOrderStorage.getOrderUuid() || '';
        const orderItem = this.prepareDataForBAck(oProduct);
        try{
            // Appeler le service batch
            const result = await this.orderBatchService.addProductAndRefresh(
            orderUuid,
            orderItem,
            );
            
            if (result && result.newItems) {
                result.newItems = result.newItems.map((item: any) => ({
                    ...item,
                    imageUrl: oProduct.ImageUrl || '',
                }));

                // make data synchronisation
                this.reconcileWithBackend(result,oProduct.Productname)
                
            }
        }catch(error){
            this.rollback(oProduct.ProductId)
            alert("Quantity for product: " + oProduct.Productname + " not available");
        }
    }

    private reconcileWithBackend(backendData: any,productName:string): void {
        console.log(" Réconciliation avec backend...",backendData);
        const currentItems = this.productsModel.getProperty("/filteredItems") || [];

        const reconciledItems = currentItems.map((item: any) => {
            console.log(" Réconciliation avec backend...");
            if (!backendData.newItems || !Array.isArray(backendData.newItems)) {
                 return
            }
            const backendItem = backendData.newItems.find(
                (b: any) => b.ProductId === item.productId
            );
            console.log("backendItem",backendItem)
            // Si trouvé  remplacer par les données backend
            if (backendItem) {
                return {
                    ...item,
                    itemUuid : backendItem.ItemUuid,
                    productId: backendItem.ProductId,
                    productName: productName,
                    imageUrl: backendItem.imageUrl,
                    price: backendItem.Price,
                    currency: backendItem.Currency,
                    quantity: backendItem.Quantity,
                    grossAmount: backendItem.GrossAmount,
                };
            }else{
                return item
            }
        });

        // Mettre à jour le modèle avec les vraies données
        this.productsModel.setProperty("/filteredItems", reconciledItems);
        
        // Total calculé par le backend (pas le frontend!)
        this.productsModel.setProperty("/totalAmount", backendData.totalOrder);
        this.productsModel.setProperty("/countSelectedProduct", reconciledItems.length);

        // Sauvegarder en mémoire les données réconciliées
        this.saveCartInMemory(reconciledItems);

        console.log("Réconciliation terminée:", {
            total: backendData.TotalAmount,
            items: reconciledItems.length
        });
    }
    
    // prepare item for backend 
    private prepareDataForBAck(oProduct:Zproduct): IOrderItem{
       //  Préparer l'item à ajouter
            const newItem: IOrderItem = {
                ProductId: oProduct.ProductId,
                ProductName: oProduct.Productname,
                Quantity: "1",
                Price: oProduct.Price,
                Currency: "EUR",
            };
       return   newItem
       
    }

    // prepare item for frontend
    private prepareDataForFront(oProduct:any,quantity:number, newGrossAmount:number): any{
       //  Préparer l'item à ajouter
            this.CartItems = {
                itemUuid: "",
                productId: oProduct.ProductId,
                productName: oProduct.Productname,
                imageUrl: oProduct.ImageUrl,
                price: oProduct.Price,
                currency: oProduct.Currency,
                quantity: quantity,
                grossAmount: newGrossAmount.toFixed(2),
            
            };
       
    }



    

   
    //  ROLLBACK - Revenir à l'état précédent si erreur
    private rollback(productId:number): void {

        console.log(" Rollback en cours... for  ", productId);
        const updatedItems = this.removeFromCart(productId)

        //  Mettre à jour le modèle
        this.productsModel.setProperty("/filteredItems", updatedItems);
        const newTotal = this.recalculateTotal(updatedItems);

        // Restaurer l'état précédent
        this.productsModel.setProperty("/filteredItems", updatedItems.items);
        this.productsModel.setProperty("/totalAmount", newTotal);
        this.productsModel.setProperty("/countSelectedProduct", updatedItems.length);

        // Restaurer aussi la mémoire navigateur
        this.saveCartInMemory(updatedItems);

        console.log(" Rollback effectué");
    }
    


   // Supprimer un item du panier
 
    public removeFromCart (productId: number): any  {
        
            // 2️ Récupérer les items actuels
            const currentItems: any[] = this.productsModel.getProperty("/filteredItems") || [];

            console.log("Suppression de:", productId);
            console.log("Avant suppression:", currentItems.length, "items");

            const updatedItems = currentItems.filter(
                (item: any) => item.productId !== productId
            );
            
            return updatedItems
    };
    
    
    
    // calcul total Amount
    private recalculateTotal(cartitems: any): string {
        let nTotal: number = 0;

        if (!cartitems || !Array.isArray(cartitems)) {
            console.error("recalculateTotal: cartitems n'est pas un tableau:", cartitems);
            this.productsModel.setProperty("/totalAmount", "0.00");
            return "";
        }

        nTotal = cartitems.reduce((sum: number, item: any) => {
            // On force la conversion en nombre et on gère le cas où la valeur est absente
            const amount = parseFloat(item.grossAmount) || 0;
            return sum + amount;
        }, 0);

        // Sécurité supplémentaire : on vérifie que nTotal est un nombre valide avant toFixed
        const sFormattedTotal = (typeof nTotal === 'number' && !isNaN(nTotal)) 
            ? nTotal.toFixed(2) 
            : "0.00";
        return sFormattedTotal;
    }
    

    public updateUIOptimistically (oProduct:any): any {
        const oData = this.productsModel.getData();
        let quantity:number = 0;
         let newGrossAmount : number = 0;
        //  Chercher si l'article est déjà dans le panier
        let oExistingItem = null;

        if (oData.filteredItems && Array.isArray(oData.filteredItems)) {
            oExistingItem = oData.filteredItems.find(
                (item: any) => item.productId === oProduct.ProductId || item.ProductId === oProduct.ProductId
            );
        }

        if (oExistingItem) {
           
            // Trouver l'index de l'item
            const itemIndex = oData.filteredItems.indexOf(oExistingItem);
            //  Mettre à jour avec setProperty pour déclencher le binding
            const newQuantity = oExistingItem.quantity + 1;

            newGrossAmount = newQuantity * parseFloat(oProduct.Price);
            if(typeof newGrossAmount === 'number' && !isNaN(newGrossAmount)){
                this.productsModel.setProperty(`/filteredItems/${itemIndex}/quantity`, newQuantity);
                this.productsModel.setProperty(`/filteredItems/${itemIndex}/grossAmount`, newGrossAmount.toFixed(2));
            }else{

                throw Error
            }
            
            // rewrite this block to respect single responsability principe
            const total  = this.recalculateTotal(oData.filteredItems)
            this.productsModel.setProperty("/totaAMount", total)
            console.log("cartItem lenght:",oData.filteredItems.length)
            // save orderItem in memory
            const sCartJson = JSON.stringify(oData.filteredItems);
            this.saveCartInMemory(sCartJson)
            return oData.filteredItems
            
        }
            
        else {
            // Ajout d'un nouvel article
            quantity = 1;
            newGrossAmount = (quantity * oProduct.Price);

            console.log("subAmount",newGrossAmount)
            
            this.prepareDataForFront(oProduct,quantity,newGrossAmount)

            let updateCartItems = this.productsModel.getProperty("/filteredItems");

            if (!updateCartItems || !Array.isArray(updateCartItems)) {
                console.error("recalculateTotal: cartitems n'est pas un tableau:");
                updateCartItems = [];  
            }

            //const updatedItems = [...updateCartItems, this.CartItems];
            updateCartItems.push(this.CartItems)
            console.log("cartitem",updateCartItems);
            // 3. Rafraîchir la vue
            this.productsModel.setProperty("/filteredItems",  updateCartItems);
            const total = this.recalculateTotal(updateCartItems);
            this.productsModel.setProperty("/totaAMount", total)
            this.productsModel.setProperty("/countSelectedProduct", updateCartItems.length)
            this.saveCartInMemory(updateCartItems)
            return updateCartItems
        }
        return    
    }
    


    // SAUVEGARDE MÉMOIRE NAVIGATEUR
    private saveCartInMemory(cart: any): void {
        //  Récupération et nettoyage des valeurs
        const totalAmount = this.productsModel.getProperty("/totalAmount");
        const countSelectedProduct = this.productsModel.getProperty("/countSelectedProduct");

        // On s'assure d'avoir des nombres valides avant de convertir en string
        const nTotal: number = typeof totalAmount === "string" ? parseFloat(totalAmount) : (totalAmount || 0);
        const nCount: number = parseInt(countSelectedProduct) || 0;

        //  Préparation des chaînes de caractères
        const sCart = JSON.stringify(cart);
        const sTotalAmount = nTotal.toFixed(2); 
        const sCount = nCount.toString();

        //  Stockage effectif
        this.iOrderItemStorage.setOrderItem("myCart", sCart);
        this.iOrderItemStorage.setOrderItem("myTotal", sTotalAmount);
        this.iOrderItemStorage.setOrderItem("myCount", sCount);
    }
}