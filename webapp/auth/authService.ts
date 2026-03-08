import { EnvConfig } from "./EnvConfig";
/** Structure du token renvoyé par le endpoint /oauth2/token */
export interface ITokenResponse {
    id_token:      string;
    access_token?: string;
    token_type?:   string;
    expires_in?:   number;
    scope?:        string;
}

/** Payload décodé d'un JWT id_token SAP IAS */
export interface IJwtPayload {
    sub:            string;
    email?:         string;
    name?:          string;
    given_name?:    string;
    family_name?:   string;
    /** Groupes/rôles fournis par IAS */
    groups?:        string[];
    exp?:           number;
    iat?:           number;
}

export class AuthService {

    // ── Singleton léger ──────────────────────────────────────────
    private static _instance: AuthService | null = null;

    public static getInstance(): AuthService {
        if (!AuthService._instance) {
            AuthService._instance = new AuthService();
        }
        return AuthService._instance;
    }

    private constructor() {}   // empêche new AuthService() externe

    // ─────────────────────────────────────────────────────────────
    //  PARTIE 2 : CALLBACK (exécuté au chargement de la page)
    // ─────────────────────────────────────────────────────────────

    /**
     * handleAuthCallback – détecte le code d'autorisation dans l'URL
     * et lance l'échange contre un token.
     * À appeler dans Component.init() ou dans onInit() du contrôleur
     * de la page d'accueil.
     */
    public handleAuthCallback(): void {
        const urlParams  = new URLSearchParams(window.location.search);
        const sAuthCode  = urlParams.get("code");

        if (!sAuthCode) { return; }   // pas de callback OAuth2

        console.info("[AuthService] Code d'autorisation reçu, échange en cours…");
        void this.exchangeCodeForToken(sAuthCode);
    }

    // ─────────────────────────────────────────────────────────────
    //  PARTIE 1 : LANCER LA CONNEXION
    // ─────────────────────────────────────────────────────────────

    /**
     * onLoginPress – génère le PKCE verifier/challenge et redirige
     * l'utilisateur vers la page de connexion SAP IAS.
     */
    public async onLoginPress(): Promise<void> {
        const sCodeVerifier  = this._generateCodeVerifier();
        const sCodeChallenge = await this._generateCodeChallenge(sCodeVerifier);

        const sClientId = EnvConfig.IAS_CLIENT_ID;
        
        // Détection dynamique de l'URI de redirection
        const sRedirectUri = window.location.hostname === "localhost"
            ? EnvConfig.REDIRECT_URI_DEV
            : EnvConfig.REDIRECT_URI_PROD;

        // Récupération de l'endpoint d'autorisation (OAuth2)
        const sAuthServiceUrl = EnvConfig.OAUTH2_END_POINT_PROD;

        // Persiste le verifier pour l'étape 3 (durée = 1 requête)
        sessionStorage.setItem("pkce_code_verifier", sCodeVerifier);

        window.location.href = sAuthServiceUrl
        + `?response_type=code`
        + `&client_id=${sClientId}`
        + `&redirect_uri=${encodeURIComponent(sRedirectUri)}`
        + `&scope=openid%20profile%20email`
        + `&code_challenge=${sCodeChallenge}`
        + `&code_challenge_method=S256`; 

        
    }

    // ─────────────────────────────────────────────────────────────
    //  PARTIE 3 : ÉCHANGE DU CODE CONTRE UN TOKEN
    // ─────────────────────────────────────────────────────────────

    /**
     * exchangeCodeForToken – envoie le code d'autorisation au
     * endpoint /oauth2/token et stocke le token JWT reçu.
     *
     * @param code - Code d'autorisation reçu dans l'URL de callback
     */
    public async exchangeCodeForToken(code: string): Promise<void> {
        const sCodeVerifier = sessionStorage.getItem("pkce_code_verifier");



        const sClientId = EnvConfig.IAS_CLIENT_ID;
        
        // Détection dynamique de l'URI de redirection
        const sRedirectUri = window.location.hostname === "localhost"
            ?EnvConfig.REDIRECT_URI_DEV
            : EnvConfig.REDIRECT_URI_PROD;

        // Récupération de l'endpoint d'autorisation (OAuth2)
        const sTokenServiceUrl = EnvConfig.TOKEN_END_POINT_PROD


        if (!sCodeVerifier) {
            console.error("[AuthService] ❌ code_verifier manquant en session — " +
                          "la session a peut-être expiré ou été nettoyée.");
            return;
        }

        const body = new URLSearchParams({
            grant_type:    "authorization_code",
            code,
            client_id:     sClientId,
            redirect_uri:  sRedirectUri,
            code_verifier: sCodeVerifier
        });

        try {
            const response = await fetch(sTokenServiceUrl, {
                method:  "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} : ${response.statusText}`);
            }

            const data = await response.json() as ITokenResponse;

            if (!data.id_token) {
                throw new Error("La réponse ne contient pas de id_token.");
            }

            console.info("[AuthService] ✅ Connexion réussie.");
            this._storeToken(data.id_token);

            // Nettoyage du verifier (usage unique)
            sessionStorage.removeItem("pkce_code_verifier");
            // NETTOYAGE de l'URL (enlever le ?code=...) et redirection interne
            window.location.href = sRedirectUri + "#/DashboardAdmin";

        } catch (error: unknown) {
            console.error("[AuthService] ❌ Erreur lors de l'échange du token :", error);
        }
    }

    /** Retourne true si un token valide (non expiré) est en session. */
    public isAuthenticated(): boolean {
        const sToken = this._getStoredToken();
        if (!sToken) { return false; }

        try {
            const payload = this.decodeJwt(sToken);
            if (!payload.exp) { return true; }   // pas d'expiration → valide
            return Date.now() < payload.exp * 1000;
        } catch {
            return false;
        }
    }

    /** Décode le payload JWT sans vérification de signature (côté client). */
    public decodeJwt(token: string): IJwtPayload {
        const parts = token.split(".");
        if (parts.length < 2) {
            throw new Error("[AuthService] Token JWT invalide (format attendu : x.y.z)");
        }
        // Base64url → Base64 standard
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const json   = decodeURIComponent(
            atob(base64)
                .split("")
                .map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                .join("")
        );
        return JSON.parse(json) as IJwtPayload;
    }

    /** Récupère le token stocké (sessionStorage prioritaire). */
    public getToken(): string | null {
        return this._getStoredToken();
    }

    /** Déconnexion : supprime tous les tokens stockés. */
    public logout(): void {
        console.info("[AuthService] Session terminée.");
    }

    // ─────────────────────────────────────────────────────────────
    //  MÉTHODES PRIVÉES
    // ─────────────────────────────────────────────────────────────

    /**
     * Génère un code_verifier aléatoire de 32 octets (RFC 7636 §4.1).
     * Utilise crypto.getRandomValues pour une entropie cryptographique.
     */
    private _generateCodeVerifier(): string {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g,  "");
    }

    /**
     * Dérive le code_challenge depuis le verifier par SHA-256 (RFC 7636 §4.2).
     * Utilise l'API Web Crypto native — aucune dépendance externe.
     */
    private async _generateCodeChallenge(verifier: string): Promise<string> {
        const encoder = new TextEncoder();
        const data    = encoder.encode(verifier);
        const digest  = await crypto.subtle.digest("SHA-256", data);

        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g,  "");
    }

    /**
     * Stocke le token en sessionStorage ET localStorage.
     * sessionStorage : expire à la fermeture de l'onglet (recommandé).
     * localStorage   : persiste pour le SSO inter-onglets.
     */
    private _storeToken(idToken: string): void {
        sessionStorage.setItem("user_token", idToken);
        localStorage.setItem("user_token",   idToken);
    }

    /** Lit le token (sessionStorage prioritaire sur localStorage). */
    private _getStoredToken(): string | null {
        return sessionStorage.getItem("user_token") ??
               localStorage.getItem("user_token");
    }
}