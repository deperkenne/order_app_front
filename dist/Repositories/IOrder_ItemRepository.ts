import { OrderItem } from "../model/Order_items";

export interface IOrderItemRepo{
   saveOrderItem(orderItems: OrderItem,orderUuid: string): Promise<OrderItem>;
   findAll(): Promise<OrderItem[]>;    
}