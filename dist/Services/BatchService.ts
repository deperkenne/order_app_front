
import {
    IBatchResult,
    IOrderItem,
    IBatchRequestBuilder,
    IBatchResponseParser,
    IPathBuilder,
    IQueryParameterBuilder
} from "./Interfaces/IBatchProcessing";

const BATCH_GROUP_ID           = "OrderBatchGroup";
const DECREASE_QUANTITY_PATH   = "/decrease_quantity";

export class BatchServiceProcess {

    constructor(
        private readonly executor:        IBatchRequestBuilder,
        private readonly responseParser:  IBatchResponseParser,
        private readonly pathBuilder:     IPathBuilder,
        private readonly queryBuilder:    IQueryParameterBuilder
    ) {}

    async deleteProductAndRefresh(item: any, orderUuid: string): Promise<IBatchResult> {
        const orderPath = this.pathBuilder.buildOrderPath(orderUuid);
        const itemsPath = this.pathBuilder.buildItemsPath(orderUuid);

        // 1) Action : décrémente la quantité via Function Import
        this.executor.addFunctionCall(
            DECREASE_QUANTITY_PATH,
            "POST",
            { ItemUuid: item.itemUuid, IsActiveEntity: false },
            BATCH_GROUP_ID
        );

        // 2) Refresh : relecture du total commande
        this.executor.addRead(
            orderPath,
            this.queryBuilder.buildOrderParams(),
            BATCH_GROUP_ID
        );

        // 3) Refresh : relecture de l'item mis à jour
        this.executor.addRead(
            itemsPath,
            this.queryBuilder.buildItemParams(item.productId),
            BATCH_GROUP_ID
        );

        const responses = await this.executor.submitBatch(BATCH_GROUP_ID);
        return this.responseParser.parseDeleteResponse(responses);
    }

    async addProductAndRefresh(orderUuid: string, orderItem: IOrderItem): Promise<IBatchResult> {
        const orderPath = this.pathBuilder.buildOrderPath(orderUuid);
        const itemsPath = this.pathBuilder.buildItemsPath(orderUuid);

        const payload = {
            ProductId:   orderItem.ProductId,
            ProductName: orderItem.ProductName,
            Quantity:    orderItem.Quantity,
            Price:       orderItem.Price,
            Currency:    orderItem.Currency
        };

        // 1) Action : création de l'item
        this.executor.addCreate(itemsPath, payload, BATCH_GROUP_ID);

        // 2) Refresh : relecture du total commande
        this.executor.addRead(
            orderPath,
            this.queryBuilder.buildOrderParams(),
            BATCH_GROUP_ID
        );

        // 3) Refresh : relecture du nouvel item
        this.executor.addRead(
            itemsPath,
            this.queryBuilder.buildItemParams(orderItem.ProductId),
            BATCH_GROUP_ID
        );

        const responses = await this.executor.submitBatch(BATCH_GROUP_ID);
        return this.responseParser.parseAddResponse(responses);
    }
}