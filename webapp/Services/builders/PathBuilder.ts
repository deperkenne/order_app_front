import { IPathBuilder } from "../Interfaces/IBatchProcessing";

export class ODataPathBuilder implements IPathBuilder {

    buildOrderPath(orderUuid: string): string {
        return `/Orders(OrderUuid=guid'${orderUuid}',IsActiveEntity=false)`;
    }

    buildItemsPath(orderUuid: string): string {
        return `${this.buildOrderPath(orderUuid)}/to_Items`;
    }
}
