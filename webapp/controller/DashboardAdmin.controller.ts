import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import UIComponent from "sap/ui/core/UIComponent";
export default class DashboardAdminController extends Controller {
    private _bMenuOpen: boolean;

    public onInit(): void {
        const token = localStorage.getItem("user_token");
      
        var COMPANIES = {
            general:     { id: "general",     name: "General Express",    initials: "GE", accent: "Accent1" },
            tresor:      { id: "tresor",      name: "Trésor Transport",   initials: "TT", accent: "Accent2" },
            buca:        { id: "buca",        name: "Buca Voyage",        initials: "BV", accent: "Accent3" },
            global:      { id: "global",      name: "Global Express",     initials: "GX", accent: "Accent4" },
            centrale:    { id: "centrale",    name: "Centrale Voyage",    initials: "CV", accent: "Accent5" },
            touristique: { id: "touristique", name: "Touristique Express", initials: "TE", accent: "Accent6" }
        };
        

        // État local pour le menu mobile (remplace useState(false))
        this._bMenuOpen = false;

        // Récupère le companyId depuis l'URL (ex: #/dashboard/general)
        // Par défaut "general" si non renseigné
        var oCompany   =  COMPANIES["general"];

         // Construction du modèle de vue complet
        var oModel = new JSONModel({
            company: oCompany,
            // ── Items de navigation (sidebarItems en React) ──
            // La propriété "active" pilote la sélection initiale
            // et le style CSS via sapMLIBSelected.
            navItems: [
                { title: "Tableau de bord", icon: "sap-icon://home",                   link: "dashboard",    active: true  },
                { title: "Utilisateurs",    icon: "sap-icon://group",                  link: "RouteProductManagement",        active: false },
                { title: "Voyages",         icon: "sap-icon://bus-public-transport",   link: "trips",        active: false },
                { title: "Véhicules",       icon: "sap-icon://car-rental",             link: "vehicles",     active: false },
                { title: "Agences",         icon: "sap-icon://building",               link: "agencies",     active: false },
                { title: "Statistiques",    icon: "sap-icon://bar-chart",              link: "stats",        active: false },
                { title: "Réservations",    icon: "sap-icon://calendar",              link: "reservations", active: false },
                { title: "Finances",        icon: "sap-icon://money-bills",            link: "finance",      active: false },
                { title: "Rapports",        icon: "sap-icon://document-text",          link: "reports",      active: false }
            ]
        });

        
        // Enregistre le modèle sous le nom "dashboard" :
        // accessible depuis la vue via {dashboard>/property}
        this.getView()?.setModel(oModel, "dashboard");

        // ✅ Vérification que le token existe
        if (!token) {
            console.error("❌ Aucun token trouvé, redirection vers login...");
            return;
        }

        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            console.log("Token complet :", JSON.stringify(decoded, null, 2));

            // ✅ Vérifier si le token est expiré
            const now = Math.floor(Date.now() / 1000);
            if (decoded.exp && decoded.exp < now) {
                console.error("❌ Token expiré !");
                sessionStorage.removeItem("user_token");
               
                return;
            }

        } catch (error) {
            console.error("❌ Erreur décodage token :", error);
            
        }

        
    }


    onNavItemSelect(oEvent:any){
          
            var oItem    = oEvent.getParameter("listItem");
            var oContext = oItem.getBindingContext("dashboard");
            var sLink    = oContext.getProperty("link");
            var sTitle   = oContext.getProperty("title");

            // Met à jour le modèle pour refléter l'item actif
            this._setActiveNavItem(sLink);
    }


    onLogout (){        
            // Exemple de redirection : window.location.hash = "#/";
            setTimeout(function () {
                window.location.hash = "#/";
            }, 800);
    }

    onToggleMobileMenu() {
            if (this._bMenuOpen) {
                this._closeMobileMenu();
            } else {
                this._openMobileMenu();
            }
    }

    onOverlayPress () {
            this._closeMobileMenu();
    }

    onAddVehicle () {
           
    }

    onViewReservations() {
           
    }

     _openMobileMenu () {
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

    _closeMobileMenu () {
        this._bMenuOpen = false;
     
       // var oSidebar = this.byId("sidebar");
       // var oOverlay = this.byId("sidebarOverlay");
       // var oToggle  = this.byId("menuToggleBtn");

      //  oSidebar.removeStyleClass("sidebarOpen");
       // oOverlay.setVisible(false);
        // Restaure l'icône hamburger
       // oToggle.setIcon("sap-icon://menu2");

        document.body.style.overflow = "";
    }

    _setActiveNavItem (sLink:string) {
            const ooModel = this.getView()?.getModel("dashboard")as JSONModel;
            const aNavItems = ooModel.getProperty("/navItems");
            const oTargetItem = aNavItems.find((oItem: any) => oItem.link === sLink);

        if (oTargetItem) {
            const oRouter = UIComponent.getRouterFor(this);  
            oRouter.navTo(oTargetItem.link);     
           
        } else {
            console.warn("Aucun produit correspondant trouvé.");
        }
    }

    _getCompanyIdFromUrl () {
            var sHash  = window.location.hash || "";
            // Pattern: #/dashboard/{companyId}
            var aMatch = sHash.match(/dashboard\/([^/]+)/);
            return aMatch ? aMatch[1] : null;
    }

    _onResize (oEvent: any) {
            var iWidth = oEvent.size.width;
            if (iWidth >= 1024 && this._bMenuOpen) {
                this._closeMobileMenu();
            }
    }

}