import { EnvConfig } from "./EnvConfig";

export interface ITokenResponse {
    id_token:      string;
    access_token?: string;
    token_type?:   string;
    expires_in?:   number;
    scope?:        string;
}

export interface IJwtPayload {
    sub:            string;
    email?:         string;
    name?:          string;
    given_name?:    string;
    family_name?:   string;
    // Groups and roles provided by IAS
    groups?:        string[];
    exp?:           number;
    iat?:           number;
}

export class AuthService {

    // Singleton — only one instance of AuthService is allowed
    private static _instance: AuthService | null = null;

    // Returns the existing instance or creates it on first call
    public static getInstance(): AuthService {
        if (!AuthService._instance) {
            AuthService._instance = new AuthService();
        }
        return AuthService._instance;
    }

    // Private constructor prevents direct instantiation from outside
    private constructor() {}

    // Reads the authorization code from the URL and starts the token exchange
    public handleAuthCallback(): void {
        const urlParams = new URLSearchParams(window.location.search);
        const sAuthCode = urlParams.get("code");

        if (!sAuthCode) { return; }

        void this.exchangeCodeForToken(sAuthCode);
    }

    // Builds the PKCE authorization URL and redirects the user to the IAS login page
    public async onLoginPress(): Promise<void> {
        const sCodeVerifier  = this._generateCodeVerifier();
        const sCodeChallenge = await this._generateCodeChallenge(sCodeVerifier);

        const sClientId = EnvConfig.IAS_CLIENT_ID;

        // Detect the correct redirect URI based on the current environment
        const sRedirectUri = window.location.hostname === "localhost"
            ? EnvConfig.REDIRECT_URI_DEV
            : EnvConfig.REDIRECT_URI_PROD;

        // Retrieve the OAuth2 authorization endpoint
        const sAuthServiceUrl = EnvConfig.OAUTH2_END_POINT_PROD;

        // Store the verifier in session — it is consumed once during token exchange
        sessionStorage.setItem("pkce_code_verifier", sCodeVerifier);

        window.location.href = sAuthServiceUrl
            + `?response_type=code`
            + `&client_id=${sClientId}`
            + `&redirect_uri=${encodeURIComponent(sRedirectUri)}`
            + `&scope=openid%20profile%20email`
            + `&code_challenge=${sCodeChallenge}`
            + `&code_challenge_method=S256`;
    }

    // Exchanges the authorization code for an id_token using PKCE
    public async exchangeCodeForToken(code: string): Promise<void> {
        const sCodeVerifier = sessionStorage.getItem("pkce_code_verifier");

        const sClientId = EnvConfig.IAS_CLIENT_ID;

        // Detect the correct redirect URI based on the current environment
        const sRedirectUri = window.location.hostname === "localhost"
            ? EnvConfig.REDIRECT_URI_DEV
            : EnvConfig.REDIRECT_URI_PROD;

        // Retrieve the OAuth2 token endpoint
        const sTokenServiceUrl = EnvConfig.TOKEN_END_POINT_PROD;

        // Abort if the verifier is missing — the session may have expired or been cleared
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

            // Remove the verifier — it is single-use only
            sessionStorage.removeItem("pkce_code_verifier");
            
            // Clean the URL and redirect to the admin dashboar
        
            window.history.replaceState({}, "", window.location.pathname);
            window.location.replace(sRedirectUri + "#/DashboardAdmin");
            

        } catch (error: unknown) {
            console.error("[AuthService] ❌ Erreur lors de l'échange du token :", error);
        }
    }

    // Returns true if a valid and non-expired token is found in storage
    public isAuthenticated(): boolean {
        const sToken = this._getStoredToken();
        if (!sToken) { return false; }

        try {
            const payload = this.decodeJwt(sToken);
            if (!payload.exp) { return true; }   // No expiry claim — treat as valid
            return Date.now() < payload.exp * 1000;
        } catch {
            return false;
        }
    }

    // Decodes the JWT payload without verifying the signature (client-side only)
    public decodeJwt(token: string): IJwtPayload {
        const parts = token.split(".");
        if (parts.length < 2) {
            throw new Error("[AuthService] Token JWT invalide (format attendu : x.y.z)");
        }
        // Convert Base64url encoding to standard Base64 before decoding
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const json   = decodeURIComponent(
            atob(base64)
                .split("")
                .map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                .join("")
        );
        return JSON.parse(json) as IJwtPayload;
    }

    // Returns the stored token or null if no session exists
    public getToken(): string | null {
        return this._getStoredToken();
    }

    // Not yet implemented
    public logout(): void {
        console.info("[AuthService] Session terminée.");
    }

    // Generates a cryptographically random PKCE code verifier
    private _generateCodeVerifier(): string {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g,  "");
    }

    // Hashes the code verifier with SHA-256 to produce the PKCE code challenge
    private async _generateCodeChallenge(verifier: string): Promise<string> {
        const encoder = new TextEncoder();
        const data    = encoder.encode(verifier);
        const digest  = await crypto.subtle.digest("SHA-256", data);

        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g,  "");
    }

    // Persists the token in both sessionStorage and localStorage
    private _storeToken(idToken: string): void {
        sessionStorage.setItem("user_token", idToken);
        localStorage.setItem("user_token",   idToken);
    }

    // Reads the token from sessionStorage first, then falls back to localStorage
    private _getStoredToken(): string | null {
        return sessionStorage.getItem("user_token") ??
               localStorage.getItem("user_token");
    }
}