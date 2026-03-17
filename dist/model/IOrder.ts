import { IOrderItem } from "./IOrder_item";
export interface IOrder {
    OrderUuid?: string;
    OrderId: string;
    CustomerId: string;
    TotalAmount: number;
    Currency:  string;
    Status:   string;
}