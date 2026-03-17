import { IOrderRepository } from "../IOrderRepository";
import {Order} from "../../model/order"
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { ODataRequestErrorHelper } from "../../Helpers/oDataRequestErrorHelper";
import { ODataRequestError } from "../../MyError/oDataRequestError";
import { OrderItem } from "../../model/Order_items";
import { IOrder } from "../../model/IOrder";

export class OrderImpl implements IOrderRepository{

    private oModel: ODataModel;
    private oDataRequestErrorHelper:ODataRequestErrorHelper;

    constructor(oModel: ODataModel,oDataRequestErrorHelper:ODataRequestErrorHelper) {
        this.oModel = oModel; 
        this.oDataRequestErrorHelper = oDataRequestErrorHelper;
    }

    async createOrder(order: IOrder): Promise<IOrder> {
        const oPayload = {
                CustomerId : order.CustomerId,
                OrderId : order.OrderId,
                Currency: order.Currency,
                Status: order.Status,
            };
            
        //  Appel à l'ODataModel
        return new Promise((resolve, reject) => {
                this.oModel.create("/Orders", oPayload, {
                    success: (oData: any) => {
                        // On retourne le nouvel objet créé (souvent enrichi par le backend)
                        resolve(new Order(oData));
                        
                    },
                    error: (oError: any) => {

                        reject(this.handleODataError(oError));
                    }
                    });
                });
    }

    async getOrderWithFilteredItems(orderUuid: string, productId: number): Promise<{ order: Order, items: OrderItem[] }> {
        const sPath = `/Orders(OrderUuid=guid'${orderUuid}',IsActiveEntity=false)`;
        
        const oUrlParameters = {
                $select: "TotalAmount",
                $expand: "to_Items",
                "to_Items/$filter": `ProductId eq '${productId}'`,
                "to_Items/$select": "ItemId,ProductId,GrossAmount,Quantity,CreatedAt",
                "to_Items/$orderby": "CreatedAt asc",
                "to_Items/$top": "1"
            };

        return new Promise((resolve, reject) => {
            this.oModel.read(sPath, {
                urlParameters: oUrlParameters,
                success: (oData: any) => {
                    const order = new Order({
                        TotalAmount: oData.TotalAmount
                    });
                    
                    const items = oData.to_Items.results.map((item: OrderItem) => 
                        new OrderItem(item)
                    );
                    
                    resolve({ order, items });
                },
                error: (oError: any) => {
                    reject(this.handleODataError(oError));
                }
            });
        });
    }

    private handleODataError(oError: any): ODataRequestError {
        let message = "Erreur inconnue";
        let statusCode: number | undefined;

        try {
            statusCode = Number(oError.statusCode);
            if (oError.responseText) {
                const oResponse = JSON.parse(oError.responseText);
                message = oResponse?.error?.message?.value || message;
            }
        } catch (e) {
            message = oError.message || "Erreur lors du parsing";
        }

        return new ODataRequestError(message, statusCode);
    }

    async getOrderId(orderUuid : string) : Promise<Order[]>{
        return []
    }
}