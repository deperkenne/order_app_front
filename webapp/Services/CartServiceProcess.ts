
import { ICartStore,
         ICartCalculator,
         ICartPersistence,
         ICartNotifier,
         ICartItem }  from "./Interfaces/IcartService";
import { IOrderItem } from "./Interfaces/IBatchProcessing";
import { IOrderStorageRepo }  from "../Repositories/IOrderStorageRepository";
import { BatchService }       from "../Services/OrderBatchService";
import { BatchServiceProcess }from "./BatchService";
import { Zproduct }           from "../model/Zproduct";
import { IorderItemStorage } from "../Repositories/IOrder_ItemStorageRepository";
import { CartStorageHelper } from "../Helpers/CartStorageHelper";
export class CartServiceProcess {

    constructor(
        private readonly store:             ICartStore,
        private readonly calculator:        ICartCalculator,
        private readonly persistence:       ICartPersistence,
        private readonly orderStorage:      IOrderStorageRepo,
        private readonly batchService:      BatchServiceProcess,
        private readonly iOrderItemStorage: IorderItemStorage,
    ) {}
    


    // Add item to cart 
    async addToCart(product: Zproduct): Promise<void> {
        // Update the UI optimistically before backend confirmation
        const items    = this.store.getItems();
        const updated  = this.upsertItem(items, product);
        this.commitToStore(updated);

        // Call the backend through the batch processing service
        const orderUuid = this.orderStorage.getOrderUuid() || "";
        const newItem: IOrderItem = {
                        ProductId:   product.ProductId,
                        ProductName: product.Productname,
                        Quantity:    "1",
                        Price:    product.Price,  
                        Currency:    "EUR"
                    };

        try {
            const result = await this.batchService.addProductAndRefresh(orderUuid,newItem);
            if (!this.isDataSynced(result)) {
                const lastItem = updated [updated.length - 1];

                // Assign the itemUuid so it is not left empty
                lastItem.itemUuid = result.newItems[result.newItems.length -1].ItemUuid

                // If the orphan item was found, remove it from the cart
                if (lastItem) {
                    console.warn(`Removing orphan item: ${lastItem.productId}`);
                    this.deleteFromCart(lastItem);
                }
            }
            else{
                this.reconcile(result, product.Productname, product.ImageUrl);
            }
            
        } catch(error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("addToCart failed:", message);
           // this.rollback(product.ProductId);
        }
    }
    

    // Delete item from cart
    async deleteFromCart(cartItem: ICartItem): Promise<void> {
        const orderUuid = this.orderStorage.getOrderUuid() || "";

        // Update the UI optimistically before backend confirmation
        //const items   = this.store.getItems();
        const sItems = this.iOrderItemStorage.getOrderItem("myCart") || ""
        const items = CartStorageHelper.parseCartItems(sItems)
       const sItem  = items.find(
            (b: any) => String(b.productId) === String(cartItem.productId)
        );
        const updated = this.decrementOrRemove(items, cartItem.productId);
        this.commitToStore(updated);

        try {
            const result = await this.batchService.deleteProductAndRefresh(sItem, orderUuid);
            if(this.isDataSynced(result)) console.log("synchro sucess")
            //this.reconcile(result, cartItem.productName, cartItem.imageUrl);
        } catch(error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("addToCart failed:", message);
            this.rollback(cartItem.productId);
        }
    }

    isDataSynced(backendData: any): boolean {
        const oTotalAmount = Number(this.store.getTotal()); 
        const backendTotalAmount = Number(backendData?.totalOrder || 0); 

        // Compute the absolute difference between local and backend totals
        const difference = Math.abs(oTotalAmount - backendTotalAmount);

        // Define a tolerance threshold (e.g. 0.05) to account for rounding at the unit level
        const tolerance = 0.01;

        if (difference > tolerance) {
            console.warn(`True desynchronization detected: gap of ${difference}`);
            return false;
        }

        return true;
    }

    // Synchronize local cart state with the data returned by the backend
    reconcile(backendData: any, productName: string, imageUrl: string = ""): void {
        const current = this.store.getItems();
        
        // Update each cart item with the matching backend values
        const reconciled = current.map(item => {
            const backendItem = (backendData.newItems || []).find(
                (b: any) => b.ProductId === item.productId
            );
            if (!backendItem) return item;

            return {
                ...item,
                itemUuid:    backendItem.ItemUuid,
                productName,
                imageUrl:     imageUrl,
                price:       parseFloat(String(backendItem.Price)),
                currency:    backendItem.Currency,
                quantity:    parseInt(String(backendItem.Quantity), 10),   // ← string → number
                grossAmount: parseFloat(String(backendItem.GrossAmount))
            };
        });

        this.commitToStore(reconciled,backendData.Status,backendData.totalOrder);
    }

    // Rollback: remove the item from the local cart if the backend call failed
    rollback(productId: number): void {
        const items   = this.store.getItems();
        const updated = items.filter(i => i.productId !== productId);
        this.commitToStore(updated);
    }

    // Helper methods

    private upsertItem(items: ICartItem[], product: Zproduct): ICartItem[] {
        const idx = items.findIndex(i =>
            i.productId === product.ProductId
        );

        if (idx >= 0) {
            // Item already exists: increment its quantity and return a new array
            return items.map((item, i) => {
                if (i !== idx) return item;
                return this.calculator.incrementItem(item)
            });
        }

        // Item does not exist yet: create a new entry and append it to the array
        const newItem = this.calculator.buildNewItem(product, 1);
        return [...items, newItem];
    }

    private decrementOrRemove(items: ICartItem[], productId: number): ICartItem[] {
        const copy = items.map(i => ({ ...i }));
        const itemIndex = copy.findIndex((item: any) => item.productId === productId);

        if (itemIndex === -1) {
            console.warn(`Item with ProductId ${productId} not found in cart`);
            throw new Error
        }

        copy[itemIndex].quantity -= 1;
        copy[itemIndex].grossAmount = copy[itemIndex].quantity * copy[itemIndex].price
        // Remove the item from the cart when its quantity drops to zero or below
        if (copy[itemIndex].quantity <= 0) {
            copy.splice(itemIndex, 1);
        }
        
        return copy
    }
    
    // Commit the updated items to the store and persist them in browser memory
    private commitToStore(items: ICartItem[],isFromBackend?:boolean, backendTotal?: number): void {
        const total = backendTotal !== undefined
            ? String(backendTotal)
            : this.calculator.recalculateTotal(items);

        if (isFromBackend){
           this.persistence.save(items, total, items.length);
        }else{
            this.store.setItems(items);
            this.store.setTotal(total);
            this.store.setCount(items.length);
            this.persistence.save(items, total, items.length);
        }    
    }
}