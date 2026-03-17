export class Stock {
    private readonly _StockId: string;
    private readonly _ProductId: string;
    private readonly _SkuId: string;
    private _Quantity: number; // 'int' n'existe pas en TS, on utilise 'number'
    private _Unit: string;
    private _AvailableQuantity: number;

    constructor(dbItem: any) {
        // ... mapping des autres champs
        this._StockId = dbItem.StockId;
        this._ProductId = dbItem.ProductId;
        this._SkuId = dbItem.SkuId;
        this._Quantity = dbItem.Quantity;
        //this._Unit = dbItem.Unit || dbItem._Unit || ""; 
        this._AvailableQuantity = dbItem.AvailableQuantity || 0;
   
    }

    // Getter et Setter pour StockId
    get StockId(): string {
        return this._StockId;
    }
  
    // Getter et Setter pour ProductId
    get ProductId(): string {
        return this._ProductId;
    }
    // Getter et Setter pour SkuId
    get SkuId(): string {
        return this._SkuId;
    }
   
    // Getter et Setter pour Quantity
    get Quantity(): number {
        return this._Quantity;
    }
    set Quantity(value: number) {
        if(value < 0){
            console.error("La quantité ne peut pas être négative");
            this._Quantity = 0; // Sécurité
        }
        else{
           this._Quantity = value;
        }
    }

    // Getter et Setter pour Unit
    get Unit(): string {
        return this._Unit;
    }
    set Unit(value: string) {
        this._Unit = value;
    }

    // Getter et Setter pour AvailableQuantity
    get AvailableQuantity(): number {
        return this._AvailableQuantity;
    }
    set AvailableQuantity(value: number) {
          if(value < 0){
            console.error("La quantité ne peut pas être négative");
           this._AvailableQuantity = 0; // Sécurité
        }
        else{
         this._AvailableQuantity = value;
        }
        
    }
}