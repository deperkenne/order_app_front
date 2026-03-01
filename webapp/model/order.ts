import { IOrder } from "./IOrder";
import { IOrderItem } from "./IOrder_item";

export class Order implements IOrder { 
    OrderUuid?: string;
    OrderId: string;
    CustomerId: string;
    TotalAmount: number;
    Currency:  string;
    Status:   string;
   
    
    constructor(dbOrder: any) {
        this.OrderUuid = dbOrder.OrderUuid;
        this.OrderId = dbOrder.OrderId;
        this.CustomerId = dbOrder.CustomerId;
        this.TotalAmount = dbOrder.TotalAmount;
        this.Currency = dbOrder.Currency; 
        this.Status   = dbOrder.Status;
        this.TotalAmount = dbOrder.TotalAmount
       
    }

}