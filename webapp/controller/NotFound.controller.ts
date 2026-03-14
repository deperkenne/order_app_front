import Controller from "sap/ui/core/mvc/Controller";

/**
 * NotFound Controller
 * Handles navigation actions on the 404 error page
 */
export default class NotFound extends Controller {

    // Navigate back to the previous page
    public onNavBack(): void {
        const oHistory = sap.ui.require("sap/ui/core/routing/History");
        const sPreviousHash = oHistory?.getInstance().getPreviousHash();

        if (sPreviousHash !== undefined) {
            window.history.go(-1);
        } else {
            // No history — go to home
            this.onNavHome();
        }
    }

    // Navigate to the home/dashboard route
    public onNavHome(): void {
        const oRouter = (this.getOwnerComponent() as any).getRouter();
        oRouter.navTo("RouteMain", {}, true);
    }
}