import { IOrderItemRepo } from "../IOrder_ItemRepository";
import { OrderItem } from "../../model/Order_items";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { ODataRequestErrorHelper } from "../../Helpers/oDataRequestErrorHelper";
import { ODataRequestError } from "../../MyError/oDataRequestError";
export class OrderItemImpl implements IOrderItemRepo{

    private oModel: ODataModel;
    private oDataRequestErrorHelper:ODataRequestErrorHelper;
      
    constructor(oModel: ODataModel,oDataRequestErrorHelper:ODataRequestErrorHelper) {
        this.oModel = oModel; 
        this.oDataRequestErrorHelper = oDataRequestErrorHelper;
    }

    async saveOrderItem(orderItem: OrderItem, orderUuid: string): Promise<OrderItem>{
       
        const oPayload = {
            ProductId: orderItem.ProductId,
            ProductName: orderItem.ProductName,
            Quantity: orderItem.Quantity,
            Unit: orderItem.Unit,
            Price: orderItem.Price,
            Currency: orderItem.Currency
        };
        
        const sPath = `/Orders(OrderUuid=guid'${orderUuid}',IsActiveEntity=false)/to_Items`;

        //  Appel à l'ODataModel
        return new Promise((resolve, reject) => {
                this.oModel.create(sPath, oPayload, {
                    success: (oData: any) => {
                        // On retourne le nouvel objet créé (souvent enrichi par le backend)
                        resolve(new OrderItem(oData));
                        
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

      async findAll(): Promise<OrderItem[]>{
        return []
      }

}