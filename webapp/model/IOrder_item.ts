export interface IOrderItem {
    ItemId?: number
    ProductId: number
    ProductName: string
    Quantity: string
    Unit?: string
    Price: number
    Currency: string
    ImageUrl?: string | undefined
    GrossAmount?: number
}