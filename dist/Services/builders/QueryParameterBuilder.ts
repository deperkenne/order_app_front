import { IQueryParameterBuilder } from "../Interfaces/IBatchProcessing"

const ORDER_SELECT_FIELDS = "TotalAmount,Currency";
const ITEM_SELECT_FIELDS  = "ItemUuid,Price,Currency,ProductId,GrossAmount,Quantity,CreatedAt";
const ITEM_ORDERBY        = "CreatedAt desc";
const ITEM_TOP            = "1";

export class ODataQueryParameterBuilder implements IQueryParameterBuilder {

    buildOrderParams(): Record<string, string>  {
        return {
            "$select": ORDER_SELECT_FIELDS
        };
    }

    buildItemParams(productId: number): Record<string, string>  {
        return {
            "$filter":  `ProductId eq '${productId}'`,
            "$select":  ITEM_SELECT_FIELDS,
            "$orderby": ITEM_ORDERBY,
            "$top":     ITEM_TOP
        };
    }
}
