import { IorderItemStorage } from "../IOrder_ItemStorageRepository"


export class OrderItemStorage implements IorderItemStorage {
 
      getOrderItem(key:string): string | null{
         return  localStorage.getItem(key)
      }

      setOrderItem(key:string ,orderItem:any): void{
          try {
            localStorage.setItem(key,orderItem);
          } catch (error) {
            console.error('Erreur sauvegarde cart:', error);
          }
      }
      
      clearOrderItem(key:string): void {
        localStorage.removeItem(key) 
      } 
}