export interface IOrderStorageRepo {
      getOrderUuid(): string | null,
      setOrderUuid(uuid: string): void,
      clearOrderUuid(): void ,
      hasOrderUuid(): boolean
}