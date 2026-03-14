import {IOrder} from "../model/IOrder"
import { OrderItem } from "../model/Order_items";
export interface IOrderRepository {
  createOrder(order: IOrder): Promise<IOrder>;
  getOrderWithFilteredItems(orderUuid : string, productId: number):Promise<{ order: IOrder, items: OrderItem[] }>;
  getOrderId(orderUuid : string) : Promise<IOrder[]>;
  activateOrder(orderUuid: string): Promise<any>

}