
import { ICartStore,
         ICartCalculator,
         ICartPersistence,
         ICartNotifier,
         ICartItem }          from "./Interfaces/IcartService";
import { IOrderItem } from "./Interfaces/IBatchProcessing";
import { IOrderStorageRepo }  from "../Repositories/IOrderStorageRepository";
import { BatchService }       from "../Services/OrderBatchService";
import { BatchServiceProcess }from "./BatchService";
import { Zproduct }           from "../model/Zproduct";
export class CartServiceProcess {

    constructor(
        private readonly store:             ICartStore,
        private readonly calculator:        ICartCalculator,
        private readonly persistence:       ICartPersistence,
        private readonly orderStorage:      IOrderStorageRepo,
        private readonly batchService:      BatchServiceProcess
    ) {}
    


    // Add item to cart 
    async addToCart(product: Zproduct): Promise<void> {
        // update UI
        const items    = this.store.getItems();
        const updated  = this.upsertItem(items, product);
        this.commitToStore(updated);

        // call a  backend
        const orderUuid = this.orderStorage.getOrderUuid() || "";
        const newItem: IOrderItem = {
                        ProductId:   product.ProductId,
                        ProductName: product.Productname,
                        Quantity:    "1",
                        Price:       product.Price,
                        Currency:    "EUR"
                    };

        try {
            const result = await this.batchService.addProductAndRefresh(orderUuid,newItem);
            this.reconcile(result, product.Productname, product.ImageUrl);
        } catch {
            this.rollback(product.ProductId);
        }
    }
    

    // delete  item from cart
    async deleteFromCart(cartItem: ICartItem): Promise<void> {
        const orderUuid = this.orderStorage.getOrderUuid() || "";

        //  update UI
        const items   = this.store.getItems();
        const updated = this.decrementOrRemove(items, cartItem.productId);
        this.commitToStore(updated);

        try {
            const result = await this.batchService.deleteProductAndRefresh(cartItem, orderUuid);
            this.reconcile(result, cartItem.productName, cartItem.imageUrl);
        } catch {
            this.rollback(cartItem.productId);
        }
    }

    // Synchronize data with the backend

    reconcile(backendData: any, productName: string, imageUrl: string = ""): void {
        const current = this.store.getItems();
        
        // modify corresponding item
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
                price:       backendItem.Price,
                currency:    backendItem.Currency,
                quantity:    backendItem.Quantity,
                grossAmount: backendItem.GrossAmount
            };
        });

        this.commitToStore(reconciled, backendData.totalOrder);
    }

    //  Rollback 
   
    rollback(productId: number): void {
        const items   = this.store.getItems();
        const updated = items.filter(i => i.productId !== productId);
        this.commitToStore(updated);
    }

    // Helpers methode

    private upsertItem(items: ICartItem[], product: Zproduct): ICartItem[] {
        const idx = items.findIndex(i =>
            i.productId === product.ProductId
        );

        if (idx >= 0) {
            // Incrément : return new table
            return items.map((item, i) => {
                if (i !== idx) return item;
                return this.calculator.incrementItem(item)
            });
        }

        // new article
        const newItem = this.calculator.buildNewItem(product, 1);
        return [...items, newItem];
    }

    private decrementOrRemove(items: ICartItem[], productId: number): ICartItem[] {

        const itemIndex = items.findIndex((item: any) => item.productId === productId);

        if (itemIndex === -1) {
            console.warn(`Item with ProductId ${productId} not found in cart`);
            throw new Error
        }

        items[itemIndex].quantity -= 1;
        items[itemIndex].grossAmount = items[itemIndex].quantity * items[itemIndex].price
        // delete item in cart when qty <= 0
        if (items[itemIndex].quantity <= 0) {
            items.splice(itemIndex, 1);
        }
        
        return items
    }
    
   // Commit the data to the store and persist it in browser memory

    private commitToStore(items: ICartItem[], backendTotal?: number): void {
        const total = backendTotal !== undefined
            ? String(backendTotal)
            : this.calculator.recalculateTotal(items);

        this.store.setItems(items);
        this.store.setTotal(total);
        this.store.setCount(items.length);
        this.persistence.save(items, total, items.length);
    }
}