/**
 * types.ts – Interfaces métier de l'application
 * ═══════════════════════════════════════════════════════════════════
 * Équivalent des types TypeScript définis dans le code React :
 *   interface User { id, name, email, role }
 *
 * On enrichit avec les propriétés UI5 dérivées (roleState)
 * et on type strictement les valeurs de rôle (union type).
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Rôles possibles d'un utilisateur.
 * Remplace le string libre du React original par un union type strict.
 */
export type UserRole = "Employé" | "Gestionnaire" | "Administrateur";

/**
 * État ObjectStatus UI5 correspondant à un rôle.
 * Valeurs acceptées par sap.m.ObjectStatus.state.
 */
export type ObjectStatusState = "None" | "Success" | "Warning" | "Error" | "Information";

/**
 * Utilisateur brut (données métier).
 * Équivalent de l'interface User React.
 */
export interface IUser {
    id:    string;
    name:  string;
    email: string;
    role:  UserRole;
}

/**
 * Utilisateur enrichi pour la vue UI5.
 * Ajoute la propriété calculée roleState utilisée par ObjectStatus.
 */
export interface IUserViewModel extends IUser {
    roleState: ObjectStatusState;
}

/**
 * Formulaire de création d'un utilisateur (modale "Ajouter").
 * Équivalent du useState newUser React.
 */
export interface INewUserForm {
    name:  string;
    email: string;
    role:  UserRole;
}

/**
 * Structure complète du JSONModel "um".
 * Documente toutes les propriétés accessibles via binding.
 */
export interface IUserManagementModel {
    users:         IUserViewModel[];
    filteredUsers: IUserViewModel[];
    newUser:       INewUserForm;
}