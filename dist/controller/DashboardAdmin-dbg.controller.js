sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  const DashboardAdminController = Controller.extend("webapp.controller.DashboardAdminController", {
    onInit: function _onInit() {
      const token = localStorage.getItem("user_token");

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
  });
  return DashboardAdminController;
});
//# sourceMappingURL=DashboardAdmin-dbg.controller.js.map
