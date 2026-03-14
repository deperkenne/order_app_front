import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import UIComponent from "sap/ui/core/UIComponent";

export default class DashboardAdminController extends Controller {
    private _bMenuOpen: boolean;

    public onInit(): void {
        const token = localStorage.getItem("user_token");

      

        var oModel = new JSONModel({
            navItems: [
                { title: "Home", icon: "sap-icon://home",     link: "RouteMain",              active: false  },
                { title: "Products",   icon:"sap-icon://product" ,        link: "RouteProductManagement", active: false },
                { title: "Statistics",  icon: "sap-icon://bar-chart",  link: "stats",                  active: false },
                { title: "Reports",    icon: "sap-icon://document-text",link: "reports",                active: false }
            ]
        });

        // Bind the model to the view under the "dashboard" namespace
        this.getView()?.setModel(oModel, "dashboard");

        // Abort early if no token is present — user must log in first
        if (!token) {
            console.error("❌ Aucun token trouvé, redirection vers login...");
            return;
        }

        try {
            // Decode the JWT payload (middle segment) from Base64
            const decoded = JSON.parse(atob(token.split('.')[1]));

            // Reject the session if the token has already expired
            const now = Math.floor(Date.now() / 1000);
            if (decoded.exp && decoded.exp < now) {
                sessionStorage.removeItem("user_token");
                return;
            }

        } catch (error) {
            console.error("❌ Error token :", error);
        }
    }


    // Reads the selected nav item from the event and updates the active state
    onNavItemSelect(oEvent: any) {
        var oItem    = oEvent.getParameter("listItem");
        var oContext = oItem.getBindingContext("dashboard");
        var sLink    = oContext.getProperty("link");
        var sTitle   = oContext.getProperty("title");

        this._setActiveNavItem(sLink);
    }

    // Redirects to the root route after a short delay
    onLogout() {
        setTimeout(function () {
            window.location.hash = "#/";
        }, 800);
    }

    // Toggles the mobile menu open or closed
    onToggleMobileMenu() {
        if (this._bMenuOpen) {
            this._closeMobileMenu();
        } else {
            this._openMobileMenu();
        }
    }

    // Closes the menu when the user taps the overlay
    onOverlayPress() {
        this._closeMobileMenu();
    }

    // Not yet implemented
    onAddVehicle() {
    }

    // Not yet implemented
    onViewReservations() {
    }

    // Marks the menu as open (UI manipulation is temporarily commented out)
    _openMobileMenu() {
        this._bMenuOpen = true;
        /*
        var oSidebar = this.byId("sidebar");
        var oOverlay = this.byId("sidebarOverlay");
        var oToggle  = this.byId("menuToggleBtn");

        oSidebar.addStyleClass("sidebarOpen");
        oOverlay.setVisible(true);
        // Change l'icône hamburger → croix
        oToggle.setIcon("sap-icon://decline");

        // Bloque le scroll du body pendant que le menu est ouvert
        document.body.style.overflow = "hidden";
        */
    }

    // Marks the menu as closed and restores body scroll
    _closeMobileMenu() {
        this._bMenuOpen = false;

        // UI manipulation is temporarily commented out
        // var oSidebar = this.byId("sidebar");
        // var oOverlay = this.byId("sidebarOverlay");
        // var oToggle  = this.byId("menuToggleBtn");

        // oSidebar.removeStyleClass("sidebarOpen");
        // oOverlay.setVisible(false);
        // oToggle.setIcon("sap-icon://menu2");

        document.body.style.overflow = "";
    }

    // Finds the nav item matching the given link and navigates to its route
    _setActiveNavItem(sLink: string) {
        const ooModel   = this.getView()?.getModel("dashboard") as JSONModel;
        const aNavItems = ooModel.getProperty("/navItems");
        const oTargetItem = aNavItems.find((oItem: any) => oItem.link === sLink);
         const oRouter = UIComponent.getRouterFor(this);
        if (oTargetItem) {
            // Check if route exists before navigating
            const oRoute = oRouter.getRoute(oTargetItem.link);

            if (oRoute) {
                // Route exists — navigate normally
                oRouter.navTo(oTargetItem.link);
            } else {
                // Route exists in navItems but not in router config — redirect to 404
                console.warn(`Route "${oTargetItem.link}" not registered — redirecting to NotFound`);
                oRouter.navTo("Notfound")
            }

        } else {
            // Link not found in navItems — redirect to 404
            console.warn(`Route "${sLink}" not found — redirecting to NotFound`);
            oRouter.navTo("Notfound")
        }
    }

}