export class Zproduct {
  ProductId: number;    
  Productname: string;    
  Price: number;           
  Currency: string; 
  Status : string;    
  Stock: number; 
  private _imageurl: string = '';


  constructor(dbProduct: any) {
        this.ProductId = dbProduct.ProductId;
        this.Productname = dbProduct.Productname;
        this.Price = dbProduct.Price;
        this.Currency = dbProduct.Currency; 
        this.Stock = dbProduct.Stock;
  }

  get ImageUrl(): string {
    return this._imageurl;
  }

  set ImageUrl(value: string) {
    this._imageurl = value;
  }

}