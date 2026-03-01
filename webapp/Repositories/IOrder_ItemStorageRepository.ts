
export interface IorderItemStorage{
      getOrderItem(key:string): string | null,
      setOrderItem(key:string,orderItem:any): void,
      clearOrderItem(key:string): void ,
}

