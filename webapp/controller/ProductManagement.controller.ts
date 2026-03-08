/**
 * UserManagement.controller.ts
 * ═══════════════════════════════════════════════════════════════════
 * Version TypeScript du contrôleur UserManagement.
 *
 * Gains par rapport à la version JS :
 *   ✔ Types stricts sur les modèles (IUserViewModel, INewUserForm)
 *   ✔ Union type UserRole → erreur de compilation si rôle invalide
 *   ✔ Méthodes privées clairement séparées (convention _xxx + private)
 *   ✔ Paramètres d'événements typés (sap.ui.base.Event)
 *   ✔ Null-safety explicite (strictNullChecks)
 *
 * Prérequis build :
 *   npm install && ui5 build
 *   (voir package.json et tsconfig.json à la racine)
 * ═══════════════════════════════════════════════════════════════════
 */

import Controller   from "sap/ui/core/mvc/Controller";
import JSONModel    from "sap/ui/model/json/JSONModel";
import MessageToast from "sap/m/MessageToast";
import MessageBox   from "sap/m/MessageBox";
import Button       from "sap/m/Button";
import Input        from "sap/m/Input";
import Title        from "sap/m/Title";
import Dialog       from "sap/m/Dialog";
import Event        from "sap/ui/base/Event";

import type {
    IUser,
    IUserViewModel,
    INewUserForm,
    IUserManagementModel,
    UserRole,
    ObjectStatusState
} from "../model/TypeProduct";

// ── Données mock ──────────────────────────────────────────────────
// Typage strict : chaque entrée doit respecter IUser.
// Une faute de frappe sur "role" provoque une erreur de compilation.
const MOCK_USERS: IUser[] = [
    { id: "1", name: "Alice Martin", email: "alice.martin@example.com", role: "Administrateur" },
    { id: "2", name: "Bob Dupont",   email: "bob.dupont@example.com",   role: "Gestionnaire"   },
    { id: "3", name: "Clara Petit",  email: "clara.petit@example.com",  role: "Employé"        },
    { id: "4", name: "David Leroy",  email: "david.leroy@example.com",  role: "Employé"        },
    { id: "5", name: "Eva Bernard",  email: "eva.bernard@example.com",  role: "Gestionnaire"   }
];

// ── Map rôle → ObjectStatus.state ────────────────────────────────
// Record<UserRole, ObjectStatusState> garantit que tous les rôles
// sont couverts — oubli d'un rôle = erreur de compilation.
const ROLE_STATE: Record<UserRole, ObjectStatusState> = {
    "Administrateur": "Warning",
    "Gestionnaire":   "Information",
    "Employé":        "None"
};

// ── Valeur initiale du formulaire (constante réutilisable) ────────
const EMPTY_FORM: INewUserForm = {
    name:  "",
    email: "",
    role:  "Employé"
};

/**
 * UserManagementController
 * Gère la vue UserManagement.view.xml.
 */
export default class UserManagementController extends Controller {

    // ── État interne (remplace useState) ──────────────────────────
    private _sSearchQuery: string = "";
    private _sCompanyId:   string = "general";

    // ─────────────────────────────────────────────────────────────
    //  LIFECYCLE
    // ─────────────────────────────────────────────────────────────

    public onInit(): void {
        const aUsers: IUserViewModel[] = MOCK_USERS.map(this._enrichUser);

        // Modèle typé — IUserManagementModel documente la structure
        // complète accessible depuis la vue via {um>/...}
        const oData: IUserManagementModel = {
            users:         aUsers,
            filteredUsers: [...aUsers],
            newUser:       { ...EMPTY_FORM }
        };

        const oModel = new JSONModel(oData);
        this.getView()?.setModel(oModel, "um");

        this._updateTableTitle(aUsers.length);
        this._sCompanyId = this._getCompanyIdFromUrl() ?? "general";
    }

    // ─────────────────────────────────────────────────────────────
    //  NAVIGATION
    // ─────────────────────────────────────────────────────────────

    /** Retour au tableau de bord. */
    public onNavBack(): void {
        window.location.hash = `#/dashboard/${this._sCompanyId}`;
    }

    // ─────────────────────────────────────────────────────────────
    //  RECHERCHE
    // ─────────────────────────────────────────────────────────────

    /**
     * Déclenché sur liveChange et search du SearchField.
     * Les deux paramètres couvrent les deux événements UI5.
     */
    public onSearch(oEvent: Event): void {
        const params = oEvent.getParameters() as {
            newValue?: string;
            query?:    string;
        };
        this._sSearchQuery = params.newValue ?? params.query ?? "";
        this._applyFilter();
    }

    // ─────────────────────────────────────────────────────────────
    //  DIALOG – AJOUTER UN UTILISATEUR
    // ─────────────────────────────────────────────────────────────

    public onOpenAddDialog(): void {
        const oModel = this._getModel();
        oModel?.setProperty("/newUser", { ...EMPTY_FORM });

        // Désactive le bouton tant que le formulaire est vide
        (this.byId("confirmAddBtn") as Button | undefined)?.setEnabled(false);
        (this.byId("addUserDialog") as Dialog | undefined)?.open();
    }

    public onCancelAddUser(): void {
        (this.byId("addUserDialog") as Dialog | undefined)?.close();
    }

    /** Nettoyage post-fermeture : remet les champs en état neutre. */
    public onDialogClose(): void {
        (this.byId("inputName")  as Input | undefined)?.setValueState("None");
        (this.byId("inputEmail") as Input | undefined)?.setValueState("None");
    }

    /**
     * Validation en temps réel : active le bouton "Ajouter"
     * seulement quand nom ET email sont renseignés.
     */
    public onFormChange(): void {
        const oModel = this._getModel();
        if (!oModel) { return; }

        const oNew = oModel.getProperty("/newUser") as INewUserForm;
        const bValid: boolean = !!(oNew.name?.trim() && oNew.email?.trim());
        (this.byId("confirmAddBtn") as Button | undefined)?.setEnabled(bValid);
    }

    /** Création effective de l'utilisateur après validation. */
    public onConfirmAddUser(): void {
        const oModel = this._getModel();
        if (!oModel) { return; }

        const oNew = oModel.getProperty("/newUser") as INewUserForm;

        // Validation avec retour visuel sur les champs invalides
        const bNameOk:  boolean = !!oNew.name?.trim();
        const bEmailOk: boolean = !!oNew.email?.trim();

        (this.byId("inputName")  as Input | undefined)
            ?.setValueState(bNameOk  ? "None" : "Error");
        (this.byId("inputEmail") as Input | undefined)
            ?.setValueState(bEmailOk ? "None" : "Error");

        if (!bNameOk || !bEmailOk) { return; }

        // Construction et enrichissement du nouvel utilisateur
        const oRawUser: IUser = {
            id:    Date.now().toString(),
            name:  oNew.name.trim(),
            email: oNew.email.trim(),
            role:  oNew.role
        };
        const oUser: IUserViewModel = this._enrichUser(oRawUser);

        // Ajout à la liste et rafraîchissement du filtre
        const aUsers = (oModel.getProperty("/users") as IUserViewModel[]) ?? [];
        oModel.setProperty("/users", [...aUsers, oUser]);
        this._applyFilter();

        (this.byId("addUserDialog") as Dialog | undefined)?.close();
        MessageToast.show(`Utilisateur "${oUser.name}" ajouté.`);
    }

    // ─────────────────────────────────────────────────────────────
    //  ACTIONS SUR LIGNE
    // ─────────────────────────────────────────────────────────────

    public onDeleteUser(oEvent: Event): void {
        const oButton  = oEvent.getSource() as Button;
        const oContext = oButton.getBindingContext("um");
        if (!oContext) { return; }

        const sId:   string = oContext.getProperty("id")   as string;
        const sName: string = oContext.getProperty("name") as string;

        // Confirmation explicite avant suppression
        MessageBox.confirm(`Supprimer l'utilisateur "${sName}" ?`, {
            title: "Confirmation",
            onClose: (sAction: string | null) => {
                if (sAction === MessageBox.Action.OK) {
                    this._removeUser(sId);
                    MessageToast.show("Utilisateur supprimé.");
                }
            }
        });
    }

    public onEditUser(oEvent: Event): void {
        const oContext = (oEvent.getSource() as Button).getBindingContext("um");
        if (!oContext) { return; }
        const sName = oContext.getProperty("name") as string;
        MessageToast.show(`Modifier : ${sName}`);
    }

    // ─────────────────────────────────────────────────────────────
    //  MÉTHODES PRIVÉES
    // ─────────────────────────────────────────────────────────────

    /**
     * Filtre /users → /filteredUsers selon _sSearchQuery.
     * String spread operator garantit l'immutabilité du tableau source.
     */
    private _applyFilter(): void {
        const oModel = this._getModel();
        if (!oModel) { return; }

        const aAll    = (oModel.getProperty("/users") as IUserViewModel[]) ?? [];
        const sQuery  = this._sSearchQuery.toLowerCase().trim();

        const aFiltered: IUserViewModel[] = sQuery
            ? aAll.filter(u =>
                u.name.toLowerCase().includes(sQuery) ||
                u.email.toLowerCase().includes(sQuery)
              )
            : [...aAll];

        oModel.setProperty("/filteredUsers", aFiltered);
        this._updateTableTitle(aFiltered.length);
    }

    /** Supprime un utilisateur par id, puis ré-applique le filtre. */
    private _removeUser(sId: string): void {
        const oModel = this._getModel();
        if (!oModel) { return; }

        const aUsers = (oModel.getProperty("/users") as IUserViewModel[]) ?? [];
        oModel.setProperty("/users", aUsers.filter(u => u.id !== sId));
        this._applyFilter();
    }

    /**
     * Enrichit un IUser avec sa propriété roleState calculée.
     * Le Record<UserRole, ObjectStatusState> garantit qu'aucun rôle
     * n'est oublié (exhaustivité vérifiée à la compilation).
     */
    private _enrichUser(oUser: IUser): IUserViewModel {
        return {
            ...oUser,
            roleState: ROLE_STATE[oUser.role] ?? "None"
        };
    }

    /**
     * Raccourci typé vers le modèle "um".
     * Retourne null si le modèle n'est pas encore attaché.
     */
    private _getModel(): JSONModel | null {
        const oModel = this.getView()?.getModel("um");
        return oModel instanceof JSONModel ? oModel : null;
    }

    /** Met à jour le titre "Liste des utilisateurs (N)". */
    private _updateTableTitle(iCount: number): void {
        const oTitle = this.byId("umTableTitle") as Title | undefined;
        oTitle?.setText(`Liste des utilisateurs (${iCount})`);
    }

    /**
     * Extrait le companyId depuis le hash URL.
     * Retourne null si non trouvé.
     */
    private _getCompanyIdFromUrl(): string | null {
        const sHash = window.location.hash ?? "";
        return (sHash.match(/users\/([^/]+)/) ??
                sHash.match(/dashboard\/([^/]+)/))
            ?.[1] ?? null;
    }
}