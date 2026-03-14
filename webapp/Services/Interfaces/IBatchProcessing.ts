
// DTO request
export interface IOrderItem {
    ProductId: number;
    ProductName: string;
    Quantity: string;
    Price: number;
    Currency: string;
}

//DTO response
export interface IBatchResult {
    success: boolean;
    totalOrder: number;
    currency: string;
    newItems: any[];
    Status: boolean;
}


// Contrat pour la construction des requêtes batch
export interface IBatchRequestBuilder {
    addCreate(path: string, payload: object, groupId: string): void;
    addFunctionCall(path: string, method: string, urlParameters: object, groupId: string): void;
    addRead(path: string, urlParameters: object, groupId: string): void;
    submitBatch(groupId: string): Promise<any[]>;
}

// Contrat pour le parsing des réponses batch
export interface IBatchResponseParser {
    parseDeleteResponse(responses: any[]): IBatchResult;
    parseAddResponse(responses: any[]): IBatchResult;
}

// Contrat pour la construction des URLs OData
export interface IPathBuilder {
    buildOrderPath(orderUuid: string): string;
    buildItemsPath(orderUuid: string): string;
}

// Contrat pour la construction des paramètres de requête
export interface IQueryParameterBuilder {
    buildOrderParams():Record<string, string> ;
    buildItemParams(filter: number): Record<string, string> ;
}