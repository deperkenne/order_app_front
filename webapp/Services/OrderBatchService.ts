import { IOrderItemRepo } from "../Repositories/IOrder_ItemRepository";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { ODataRequestErrorHelper } from "../Helpers/oDataRequestErrorHelper";
import { ODataRequestError } from "../MyError/oDataRequestError";
import { IOrder } from "../model/IOrder";
import { IOrderItem } from "../model/IOrder_item";
import { IOrderStorageRepo } from "../Repositories/IOrderStorageRepository";
import { Zproduct } from "../model/Zproduct";

export class BatchService {

    private oDataModel: ODataModel;
    private oDataRequestErrorHelper: ODataRequestErrorHelper;

    constructor(oModel: ODataModel, oDataRequestErrorHelper: ODataRequestErrorHelper) {
        this.oDataModel = oModel;
        this.oDataRequestErrorHelper = oDataRequestErrorHelper;
        // Register the deferred batch group so all queued calls are sent together
        this.oDataModel.setDeferredGroups(["OrderBatchGroup"]);
    }

    async deleteProductAndRefresh(Item: any, OrderUuid: string): Promise<any> {
        const sPath1 = `/decrease_quantity`;
        const gId    = "OrderBatchGroup";

        const oUrlParameters = {
            groupId:        gId,
            ItemUuid:       Item.itemUuid,
            IsActiveEntity: false
        };

        //  Action: POST to the Function Import to decrement the item quantity
        this.oDataModel.callFunction(sPath1, {
            method:        "POST",
            groupId:       gId,
            urlParameters: {
                ItemUuid:       Item.itemUuid,
                IsActiveEntity: false
            }
        });

        const sPath = `/Orders(OrderUuid=guid'${OrderUuid}',IsActiveEntity=false)`;

        //  Refresh params: read only the fields needed for the order header
        const oUrlParametersOrder = {
            "$select": "TotalAmount,Currency",
        };

        //  Refresh params: read the most recently updated item matching the productId
        const oUrlParametersOrderItem = {
            "$filter":  `ProductId eq '${Item.productId}'`,
            "$select":  "ItemUuid, Price,Currency,ProductId,GrossAmount,Quantity,CreatedAt",
            "$orderby": "CreatedAt desc",
            "$top":     "1"
        };

        // Queue GET for the order header (total amount + currency)
        this.oDataModel.read(sPath, {
            groupId:       gId,
            urlParameters: oUrlParametersOrder
        });

        // Queue GET for the updated item (quantity, price, grossAmount)
        this.oDataModel.read(`${sPath}/to_Items`, {
            groupId:       gId,
            urlParameters: oUrlParametersOrderItem
        });

        // Submit all three queued requests as a single OData batch call
        return new Promise((resolve, reject) => {
            this.oDataModel.submitChanges({
                groupId: gId,
                success: (oData: any) => {
                    try {
                        console.log('Batch response:', oData);

                        // Guard: ensure the batch returned at least one response
                        if (!oData.__batchResponses || oData.__batchResponses.length < 1) {
                            throw new Error("Incomplete batch responses");
                        }

                        // Index 1 → order header GET response
                        const getResponse1  = oData.__batchResponses[1];
                        const readResponse1 = getResponse1.data || getResponse1;

                        // Index 2 → item list GET response
                        const getResponse2  = oData.__batchResponses[2];
                        const readResponse2 = getResponse2.data;

                        // Normalize the items array regardless of the response shape
                        const aAllItems = readResponse2.results || readResponse2.to_Items || [];

                        // Index 0 → POST (decrease_quantity) response
                        const postResponse = oData.__batchResponses[0];

                        const result = {
                            success:    true,
                            totalOrder: readResponse1.TotalAmount,
                            currency:   readResponse1.Currency,
                            newItems:   aAllItems,
                            postStatus: postResponse.statusCode
                        };

                        resolve(result);
                    } catch (err) {
                        console.error('Parsing error:', err);
                        reject(new Error("Failed to parse batch response data"));
                    }
                },
                error: (err: any) => {
                    // The entire batch request failed at the network or OData level
                    console.error('Batch error:', err);
                    reject(err);
                }
            });
        });
    }



    async addProductAndRefresh(orderUuid: string, orderItem: IOrderItem): Promise<any> {

        const oPayload = {
            ProductId:   orderItem.ProductId,
            ProductName: orderItem.ProductName,
            Quantity:    orderItem.Quantity,
            Price:       orderItem.Price,
            Currency:    orderItem.Currency
        };

        const sPath = `/Orders(OrderUuid=guid'${orderUuid}',IsActiveEntity=false)`;
        const gId   = "OrderBatchGroup";

        // Refresh params: read only the fields needed for the order header
        const oUrlParametersOrder = {
            "$select": "TotalAmount,Currency",
        };

        // Refresh params: read the most recently created item matching the productId
        const oUrlParametersOrderItem = {
            "$filter":  `ProductId eq '${orderItem.ProductId}'`,
            "$select":  "ItemUuid, Price,Currency,ProductId,GrossAmount,Quantity,CreatedAt",
            "$orderby": "CreatedAt desc",
            "$top":     "1"
        };

        // Action: queue the POST to create the new item under the order
        this.oDataModel.create(`${sPath}/to_Items`, oPayload, { groupId: gId });

        // Queue GET for the order header (total amount + currency)
        this.oDataModel.read(sPath, {
            groupId:       gId,
            urlParameters: oUrlParametersOrder
        });

        // Queue GET for the item list to retrieve the newly created entry
        this.oDataModel.read(`${sPath}/to_Items`, {
            groupId:       gId,
            urlParameters: oUrlParametersOrderItem
        });

        // Submit all three queued requests as a single OData batch call
        return new Promise((resolve, reject) => {
            this.oDataModel.submitChanges({
                groupId: gId,
                success: (oData: any) => {
                    try {
                        console.log('Batch response:', oData);

                        // Guard: ensure the batch returned at least one response
                        if (!oData.__batchResponses || oData.__batchResponses.length < 1) {
                            throw new Error("Incomplete batch responses");
                        }

                        
                        const getResponse1  = oData.__batchResponses[1];
                        const readResponse1 = getResponse1.data || getResponse1;

                        // Index 2 → item list GET response
                        const getResponse2  = oData.__batchResponses[2];
                        const readResponse2 = getResponse2.data;

                        // Normalize the items array regardless of the response shape
                        const aAllItems = readResponse2.results || readResponse2.to_Items || [];

                        // Index 0 → POST (create item) response
                        const postResponse = oData.__batchResponses[0];

                        const result = {
                            success:    true,
                            totalOrder: readResponse1.TotalAmount,
                            currency:   readResponse1.Currency,
                            newItems:   aAllItems,
                            postStatus: postResponse.statusCode
                        };

                        resolve(result);
                    } catch (err) {
                        console.error('Parsing error:', err);
                        reject(new Error("Failed to parse batch response data"));
                    }
                },
                error: (err: any) => {
                    // The entire batch request failed at the network or OData level
                    console.error('Batch error:', err);
                    reject(err);
                }
            });
        });
    }
}