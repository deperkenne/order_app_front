
import { IProductRepos } from "../IProductRepository";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { ODataRequestErrorHelper } from "../../Helpers/oDataRequestErrorHelper";
import { ODataRequestError } from "../../MyError/oDataRequestError";
import {Zproduct} from "../../model/Zproduct"
export class ZProductImpl implements IProductRepos{
  
    private oModel: ODataModel;
    private oDataRequestErrorHelper:ODataRequestErrorHelper;

     constructor(oModel: ODataModel,oDataRequestErrorHelper:ODataRequestErrorHelper) {
            this.oModel = oModel; 
            this.oDataRequestErrorHelper = oDataRequestErrorHelper;
           }
    
    async saveProduct(zproduct: Zproduct): Promise<Zproduct>{

         const oPayload = {
                    ProductId: zproduct.ProductId,
                    Productname: zproduct.Productname,
                    Price: zproduct.Price,
                    Currency: zproduct.Currency,
                    Stock : zproduct.Stock,      
                };

        // Appel à l'ODataModel
        return new Promise((resolve, reject) => {
                this.oModel.create("/Products", oPayload, {
                    success: (oData: any) => {
                        // On retourne le nouvel objet créé (souvent enrichi par le backend)
                        resolve(new Zproduct(oData));
                        
                    },
                    error: (oError: any) => {

                        let message = "Erreur inconnue";
                        let statusCode; 

                        try {
                            statusCode = Number(oError.statusCode);
                            if (oError.responseText) {
                                const oResponse = JSON.parse(oError.responseText);
                                message = oResponse?.error?.message?.value || message;
                            }
                        } catch (e) {
                            message = oError.message;
                        }
                        
                        reject(new ODataRequestError(message, statusCode));
                    }
                    });
                    });

    }

    async deleteByProductId(productId: number): Promise<boolean>{
        
           return true
    }

    async updateByProductId(productId: number): Promise<void>{

    }
    async findByProductId(productId: number): Promise<Zproduct | null>{
          return null
    }

    async findAll(): Promise<Zproduct[]>{
        return new Promise((resolve, reject) => {
            this.oModel.read("/Products", {
                success: (oData:any) =>{ 
                    resolve(oData.results)
                },
                 error: (oError: any) => {

                            let message = "unknow error";
                            let statusCode; 

                            try {
                                statusCode = Number(oError.statusCode);
                                if (oError.responseText) {
                                    const oResponse = JSON.parse(oError.responseText);
                                    message = oResponse?.error?.message?.value || message;
                                }
                            } catch (e) {
                                message = oError.message;
                            }
                            reject(new ODataRequestError(message, statusCode));
                }
            });
         })
    }


}