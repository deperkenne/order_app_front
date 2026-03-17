import { IOrderItem } from "./IOrder_item"

export class  OrderItem implements IOrderItem{
    ItemId?: number
    ProductId: number
    ProductName: string
    Quantity: string
    Unit: string
    Price: number
    Currency: string
    ImageUrl?: string | undefined
    GrossAmount?: number
    TotalAmount: number

    constructor(dbItems: any) {
        this.ItemId = dbItems.ItemId;
        this.ProductId = dbItems.CustomerId;
        this.ProductName = dbItems.TotalAmount;
        this.Quantity = dbItems.Currency; 
        this.Unit   = dbItems.Status;
        this.Price  =  dbItems.ItemId;
        this.Currency = dbItems.Currency;
        this.GrossAmount = dbItems.GrossAmount;
       
    }
}