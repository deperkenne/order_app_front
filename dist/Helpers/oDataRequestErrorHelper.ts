export class ODataRequestErrorHelper{
    private errorInfo:any[] ;
     public customizeError(oError:any):any[]{
            let message = "Erreur inconnue";
            let statusCode; 

            try {
                statusCode = Number(oError.statusCode);
                this.errorInfo.push(statusCode)
                if (oError.responseText) {
                    const oResponse = JSON.parse(oError.responseText);
                    message = oResponse?.error?.message?.value || message;
                    this.errorInfo.push(message)
                    return this.errorInfo;
                }
            } catch (e) {
                message = oError.message;
                this.errorInfo.push(message)
                return this.errorInfo;
            }

        return [];

    }
}