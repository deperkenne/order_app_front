import { IStockRepository } from "../IStockRepository";
import {Stock} from "../../model/Stock";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { ODataRequestErrorHelper } from "../../Helpers/oDataRequestErrorHelper";
import { ODataRequestError } from "../../MyError/oDataRequestError";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
export class StockImpl implements IStockRepository{

       private oModel: ODataModel;
       private oDataRequestErrorHelper:ODataRequestErrorHelper;

       constructor(oModel: ODataModel,oDataRequestErrorHelper:ODataRequestErrorHelper) {
        this.oModel = oModel; 
        this.oDataRequestErrorHelper = oDataRequestErrorHelper;
       }

       async saveStock(stock: Stock): Promise<Stock>{
            //  Préparer les données (on convertit l'instance de classe en objet simple)
            const oPayload = {
                StockId: stock.StockId,
                ProductId: stock.ProductId,
                SkuId: stock.SkuId,
                Quantity: stock.Quantity,
                AvailableQuantity: stock.AvailableQuantity
            };
            
            //  Appel à l'ODataModel
            return new Promise((resolve, reject) => {
                    this.oModel.create("/Stock", oPayload, {
                        success: (oData: any) => {
                            // On retourne le nouvel objet créé (souvent enrichi par le backend)
                            resolve(new Stock(oData));
                            
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

        async deleteByStockId(stockId: string): Promise<boolean>{
            return true
        }

        async updateByStockId(stockId: string,updateQuantity:number): Promise<void>{

           const sPath = this.oModel.createKey("/Stock", {
               StockId: stockId
           });

           const oPayload = {
                Quantity: updateQuantity,
            };

            this.oModel.update(sPath, oPayload, {
                success: () => {
                    MessageToast.show("Stock mis à jour avec succès");
                },
                 error: (oError: any) => {
                        let message = "error durring uodate stock";
                        if (oError.responseText) {
                            const oResponse = JSON.parse(oError.responseText);
                            message = oResponse?.error?.message?.value || message;
                        }

                    MessageBox.error(message);
                }
            });     
        }

        async findByStockId(stockId: string): Promise<Stock | null> {
            return null
        }

        async findAll(): Promise<Stock[]> {
            return new Promise((resolve, reject) => {
            this.oModel.read("/Stock", {
                success: (oData:any) =>{ 
                    resolve(oData.results)
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
                     })
             }
                                   
}
    