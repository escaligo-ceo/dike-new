import {
  AppLogger,
  BaseUrl,
  DikeConfigService,
  HttpErrorHandler,
  HttpServiceException,
  ICreateUserResponse,
  inspect,
  KeycloakException,
  KeycloakUserDto,
  OriginDto,
  Token,
  userIdFromToken,
} from "@dike/common";
import { HttpService } from "@nestjs/axios";
import { HttpStatus, Injectable } from "@nestjs/common";
import axios, { AxiosError, RawAxiosRequestHeaders } from "axios";
import * as jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { firstValueFrom } from "rxjs";
import { LoggedUser } from "../user/logged-user";
import { IKeycloakUser } from "./keycloak-user.interface";
import {
  DecodedKeycloakToken,
  IGetTokenResult,
  IKeycloakUserInfo,
  ITokenResponse,
  IValidateUserResponse,
} from "./keycloak.interface";

@Injectable()
export class KeycloakService {
  private readonly keycloakParams: BaseUrl;
  public dikeClientExists: boolean = false;
  private readonly errorHandler: HttpErrorHandler;
  private readonly _clientSecret: string | undefined;
  private readonly _clientId: string | undefined;
  private readonly _clientName: string | undefined;
  private readonly _realm: string | undefined;
  private readonly _clientAdminId: string | undefined;
  private readonly _adminUsername: string | undefined;
  private readonly _adminPassword: string | undefined;
  private jwksClient: jwksClient.JwksClient;

  constructor(
    private readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService
  ) {
    this.logger = new AppLogger(KeycloakService.name);

    const KeycloakServiceUrlStr = this.configService.env(
      "KC_BOOTSTRAP_ADMIN_URL",
      "http://localhost:8080"
    );
    this._clientSecret = this.configService.env("KC_CLIENT_SECRET", "secret");
    this._clientId = this.configService.env("KEYCLOAK_CLIENT_ID", "dike-cli");
    this._clientName = this.configService.env(
      "KEYCLOAK_CLIENT_NAME",
      "client_dike-cli"
    );
    this._realm = this.configService.env("KEYCLOAK_REALM", "master");
    this._clientAdminId = this.configService.env(
      "KEYCLOAK_ADMIN_CLIENT_ID",
      "admin-cli"
    );
    this._adminUsername = this.configService.env("KC_ADMIN_USERNAME", "admin");
    this._adminPassword = this.configService.env("KC_ADMIN_PASSWORD", "admin");

    this.logger = new AppLogger(KeycloakService.name);
    this.logger.debug(`keycloak connection url: ${KeycloakServiceUrlStr}`);
    this.keycloakParams = new BaseUrl(KeycloakServiceUrlStr);
    this.logger.debug(`baseUrl: ${this.baseUrl}`);
    this.errorHandler = new HttpErrorHandler(this.logger);

    const fetchJwksWithRetry = async (retries = 100, delayMs = 10000) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const res = await fetch(this.jwksUri);
          if (!res.ok)
            throw new Error(`HTTP url:${this.jwksUri} status:${res.status}`);
          const data = await res.text();
          // this.logger.log(
          //   `Raw JWKS response from ${jwksUri}:`,
          //   data
          // );
          return;
        } catch (err) {
          this.logger.error(
            `Error fetching JWKS ->${this.jwksUri} for debug (attempt ${attempt}/${retries}):`,
            err
          );
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          } else {
            this.logger.error(
              `Failed to fetch JWKS after ${retries} attempts.`
            );
          }
        }
      }
    };
    fetchJwksWithRetry();

    this.jwksClient = jwksClient({
      jwksUri: this.jwksUri,
      timeout: 30000,
      // fetcher: fetch, // commenta o rimuovi questa riga
    });
  }

  public get baseUrl(): string {
    return this.keycloakParams.baseUrl();
  }

  public get clientSecret(): string {
    if (!this._clientSecret) {
      throw new Error("Client secret is not defined");
    }
    return this._clientSecret;
  }

  public get clientId(): string {
    if (!this._clientId) {
      throw new Error("Client ID is not defined");
    }
    return this._clientId;
  }

  public get clientName(): string {
    if (!this._clientName) {
      throw new Error("Client name is not defined");
    }
    return this._clientName;
  }

  public get realm(): string {
    if (!this._realm) {
      throw new Error("Realm is not defined");
    }
    return this._realm;
  }

  public get clientAdminId(): string {
    if (!this._clientAdminId) {
      throw new Error("Client admin ID is not defined");
    }
    return this._clientAdminId;
  }

  public get adminUsername(): string {
    if (!this._adminUsername) {
      throw new Error("Admin username is not defined");
    }
    return this._adminUsername;
  }

  public get adminPassword(): string {
    if (!this._adminPassword) {
      throw new Error("Admin password is not defined");
    }
    return this._adminPassword;
  }

  async post(
    url: string,
    data: any,
    headers: RawAxiosRequestHeaders = {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    }
  ): Promise<any> {
    const requestUrl = `${this.baseUrl}${url}`;
    try {
      const res = await firstValueFrom(
        this.httpService.post(requestUrl, data, { headers })
      );
      if (!res) {
        this.logger.error("Response is undefined");
        throw new Error("Response is undefined");
      }
      const { config, request, ...resSafe } = res;
      const cleanedResponse = { ...resSafe, url: requestUrl };
      return cleanedResponse;
    } catch (error) {
      if (error instanceof HttpServiceException) {
        throw error;
      }
      const status =
        error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error?.response?.data?.error_description ||
        error?.response?.data?.message ||
        error?.message ||
        "Request failed";

      this.logger.error(
        `POST error - status: ${status}, url: ${requestUrl}, message: ${message}`
      );

      throw new HttpServiceException({
        service: "KeycloakService",
        method: "POST",
        url: requestUrl,
        status,
        message,
        data: error?.response?.data,
      });
    }
  }

  async delete(url: string, headers: RawAxiosRequestHeaders): Promise<any> {
    const requestUrl = `${this.baseUrl}${url}`;
    try {
      const res = await firstValueFrom(
        this.httpService.delete(requestUrl, { headers })
      );
      if (!res) {
        this.logger.error("Response is undefined");
        throw new Error("Response is undefined");
      }
      const { config, request, ...resSafe } = res;
      const cleanedResponse = { ...resSafe, url: requestUrl };

      return cleanedResponse;
    } catch (error) {
      if (error instanceof HttpServiceException) {
        throw error;
      }
      const status =
        error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error?.response?.data?.message || error?.message || "Request failed";

      this.logger.error(
        `DELETE error - status: ${status}, url: ${requestUrl}, message: ${message}`
      );

      throw new HttpServiceException({
        service: "KeycloakService",
        method: "DELETE",
        url: requestUrl,
        status,
        message,
        data: error?.response?.data,
      });
    }
  }

  async get(
    url: string,
    headers: RawAxiosRequestHeaders = {
      Accept: "application/json",
    }
  ): Promise<any> {
    const requestUrl = `${this.baseUrl}${url}`;
    try {
      const res = await firstValueFrom(
        this.httpService.get(requestUrl, { headers })
      );
      if (!res) {
        this.logger.error("Response is undefined");
        throw new Error("Response is undefined");
      }
      const { config, request, ...resSafe } = res;
      const cleanedResponse = { ...resSafe, url: requestUrl };

      return cleanedResponse;
    } catch (error) {
      if (error instanceof HttpServiceException) {
        throw error;
      }
      const status =
        error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error?.response?.data?.message || error?.message || "Request failed";

      this.logger.error(
        `GET error - status: ${status}, url: ${requestUrl}, message: ${message}`
      );

      throw new HttpServiceException({
        service: "KeycloakService",
        method: "GET",
        url: requestUrl,
        status,
        message,
        data: error?.response?.data,
      });
    }
  }

  async put(
    url: string,
    data: any,
    headers: RawAxiosRequestHeaders = {
      Accept: "application/json",
    }
  ): Promise<any> {
    const requestUrl = `${this.baseUrl}${url}`;
    try {
      const res = await firstValueFrom(
        this.httpService.put(requestUrl, data, { headers })
      );
      if (!res) {
        this.logger.error("Response is undefined");
        throw new Error("Response is undefined");
      }
      const { config, request, ...resSafe } = res;
      const cleanedResponse = { ...resSafe, url: requestUrl };

      return cleanedResponse;
    } catch (error) {
      if (error instanceof HttpServiceException) {
        throw error;
      }
      const status =
        error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error?.response?.data?.message || error?.message || "Request failed";

      this.logger.error(
        `PUT error - status: ${status}, url: ${requestUrl}, message: ${message}`
      );

      throw new HttpServiceException({
        service: "KeycloakService",
        method: "PUT",
        url: requestUrl,
        status,
        message,
        data: error?.response?.data,
      });
    }
  }

  async createDikeClient(): Promise<string> {
    if (this.dikeClientExists) return "";

    const { access_token } = await this.getAdminToken();

    // 1. ottieni un access‑token admin ------------------------------------------------------------------------------
    const adminApi = axios.create({
      baseURL: `${this.baseUrl}/admin/realms/${this.realm}`,
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // 2. vedi se il client esiste già ------------------------------------------------------------------------------
    const clients = await adminApi.get("/clients", {
      params: {
        clientId: this.clientId,
        clientName: this.clientName,
      },
    });

    const clientConfig = {
      clientId: this.clientId,
      name: this.clientName,
      protocol: "openid-connect",
      publicClient: false,
      secret: this.clientSecret, // se undefined Keycloak ne genera uno
      standardFlowEnabled: true,
      directAccessGrantsEnabled: true,
      serviceAccountsEnabled: true,
      redirectUris: ["*"],
    };

    if (clients.data.length) {
      this.dikeClientExists = true;
      const existing = clients.data[0];
      // Aggiorna le impostazioni del client se necessario
      await adminApi.put(`/clients/${existing.id}`, clientConfig);
      // ottieni il secret se confidential
      if (!existing.publicClient) {
        const secretRes = await adminApi.get(
          `/clients/${existing.id}/client-secret`
        );
        return secretRes.data.value as string;
      }
      return "";
    }

    // 3. crea il client -------------------------------------------------------------------------------------------
    this.logger.debug(`Creo il client ${this.clientId} …`);

    const createRes = await adminApi.post("/clients", clientConfig);

    const newClientId = createRes.headers.location!.split("/").pop()!; // id tecnico

    const secretRes = await adminApi.get(
      `/clients/${newClientId}/client-secret`
    );

    this.dikeClientExists = true;

    return secretRes.data.value as string;
  }

  async getToken(
    username: string,
    password: string,
    scope: string = "openid"
  ): Promise<IGetTokenResult> {
    const data = new URLSearchParams();
    data.append("grant_type", "password");
    data.append("client_id", this.clientId ?? "");
    data.append("client_secret", this.clientSecret ?? "");
    data.append("username", username);
    data.append("password", password);
    data.append("scope", scope);

    this.logger.debug("Getting user token from Keycloak");
    const url = `/realms/${this.realm}/protocol/openid-connect/token`;

    const res = await this.post(url, data.toString());
    return res.data;
  }

  /**
   * Refresh Keycloak tokens using a refresh_token.
   * Returns new access_token and refresh_token among other fields.
   */
  async refreshToken(refreshToken: string): Promise<IGetTokenResult> {
    if (!refreshToken) {
      throw new KeycloakException("refreshToken is required");
    }
    const data = new URLSearchParams();
    data.append("grant_type", "refresh_token");
    data.append("client_id", this.clientId ?? "");
    if (this.clientSecret) data.append("client_secret", this.clientSecret);
    data.append("refresh_token", refreshToken);

    const url = `/realms/${this.realm}/protocol/openid-connect/token`;
    this.logger.debug(`Refreshing token via: ${url}`);
    const res = await this.post(url, data.toString());
    this.logger.debug(`refreshToken.response: ${inspect(res.data)}`);
    return res.data as IGetTokenResult;
  }

  public async getAdminToken(): Promise<ITokenResponse> {
    this.logger.debug("Getting admin token from Keycloak");
    const url = `/realms/${this.realm}/protocol/openid-connect/token`;

    const data = new URLSearchParams();
    data.append("grant_type", "password");
    data.append("client_id", "admin-cli");
    // data.append('client_secret', this.clientSecret);
    data.append("username", this.adminUsername);
    data.append("password", this.adminPassword);

    this.logger.debug(`getAdminToken.url: ${url}`);
    this.logger.debug(`getAdminToken.data: ${data.toString()}`);
    const res = await this.post(url, data.toString());
    this.logger.debug(`getAdminToken.response: ${inspect(res.data)}`);
    return res.data;
  }

  async createUser(
    originDto: OriginDto,
    payload: KeycloakUserDto
  ): Promise<ICreateUserResponse> {
    const { access_token } = await this.getAdminToken();
    const url = `/admin/realms/${this.realm}/users`;
    const { password, email, username } = payload;
    const data = {
      username,
      email,
      enabled: true,
      credentials: [
        {
          type: "password",
          value: password,
          temporary: false,
        },
      ],
      attributes: { username },
    };
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    };
    const response = await this.post(url, data, headers);
    this.logger.debug(`createUser.response (${url}): ${inspect(response)}`);

    // Extract userId from Location header
    const { location } = response.headers;
    if (!location) {
      this.logger.error("Location header not found");
      throw new KeycloakException("Location header not found");
    }
    const userId: string = location.split("/").pop() || "";
    this.logger.debug(`userId: ${userId}`);

    return {
      userId,
      email,
      username,
    };
  }

  async validateUser(
    loggedUser: LoggedUser,
    username: string,
    password: string
  ): Promise<IValidateUserResponse> {
    // FIXKME: check this retiurned type
    const data = new URLSearchParams();
    data.append("client_id", this.clientId || "dike-cli");
    data.append("client_secret", this.clientSecret || "your-client");
    data.append("username", username);
    data.append("password", password);
    data.append("grant_type", "password");

    const url = `${this.baseUrl}/token`;
    this.logger.debug(`validateUser.url: ${url}`);
    const response = await this.post(url, data.toString());

    return response.data;
  }

  async getUsers(loggedUser: LoggedUser): Promise<IKeycloakUser[]> {
    const { access_token } = await this.getAdminToken();
    const url = `/admin/realms/${this.realm}/users`;
    this.logger.debug(`getUsers.url: ${url}`);
    const headers = {
      Authorization: `Bearer ${access_token}`,
    };
    const response = await this.get(url, headers);
    this.logger.debug(`getUsers.response (${url}): ${inspect(response)}`);
    return response.data;
  }

  async getUserById(
    loggedUser: LoggedUser,
  ): Promise<IKeycloakUser> {
    const { access_token } = await this.getAdminToken();
    const url = `/admin/realms/${this.realm}/profiles/${loggedUser.id}`;
    const headers: RawAxiosRequestHeaders = {
      Authorization: `Bearer ${access_token}`,
    };
    try {
      const response = await this.get(url, headers);
      this.logger.debug(`getUserById.response (${url}): ${inspect(response)}`);
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(`getUserById.error: ${inspect(err)}`);
      if (err.response) {
        throw new KeycloakException(
          `Failed to get user: ${err.response} -> ${inspect(err)}`
        );
      }
      throw new KeycloakException("Failed to get user");
    }
  }

  async getUserByEmail(
    loggedUser: LoggedUser,
    email: string,
    adminTokenResponse: ITokenResponse
  ): Promise<IKeycloakUser> {
    const { access_token: adminAccessToken } = adminTokenResponse;
    const url = `/admin/realms/${this.realm}/users?email=${encodeURIComponent(email)}`;
    const headers: RawAxiosRequestHeaders = {
      Authorization: `Bearer ${adminAccessToken}`,
    };
    try {
      const response = await this.get(url, headers);
      this.logger.debug(
        `getUserByEmail.response (${url}): ${inspect(response)}`
      );
      // Keycloak returns an array, we want the first match
      return response.data;
      // return response.data[0] || null; // Return null if no user found // FIXME: check this case!!
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(`getUserByEmail.error: ${inspect(err)}`);
      if (err.response) {
        throw new KeycloakException(
          `Failed to get user by email: ${err.response} -> ${inspect(err)}`
        );
      }
      throw new KeycloakException("Failed to get user by email");
    }
  }

  async deleteUser(loggedUser: LoggedUser, userId: string): Promise<void> {
    if (!userId || userId === "") {
      throw new KeycloakException("User ID is required");
    }
    const { access_token } = await this.getAdminToken();
    const url = `/admin/realms/${this.realm}/profiles/${userId}`;
    this.logger.debug(`deleteUser.url: ${url}`);
    const headers = {
      Authorization: `Bearer ${access_token}`,
    };

    const response = await this.delete(url, headers);
    this.logger.debug(`deleteUser.response (${url}): ${inspect(response)}`);
    return response.data;
  }

  async createDikeRealm(): Promise<void> {
    this.logger.debug("🏗️ Creating Dike realm...");
    const { access_token } = await this.getAdminToken();

    const headers = {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    };

    const realmConfig = {
      realm: "dike",
      enabled: true,
      displayName: "Dike Authentication Realm",
      verifyEmail: true,
      emailTheme: "base",
      registrationEmailAsUsername: true,
      registrationAllowed: true,
      resetPasswordAllowed: true,
      rememberMe: true,
    };

    const url = "/admin/realms";
    await this.post(url, realmConfig, headers);

    this.logger.log("✅ Dike realm created successfully");
  }

  /**
   * Get Keycloak user info
   * @param {Token} tokenDto - Token DTO
   * @return {Promise<IKeycloakUserInfo>} - Keycloak user info
   */
  async getUserInfo(
    loggedUser: LoggedUser
  ): Promise<IKeycloakUserInfo> {
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${loggedUser.token.accessToken}`,
    };
    const url = `/realms/${this.realm}/protocol/openid-connect/userinfo`;
    const response = await this.get(url, headers);
    // this.logger.debug(
    //   `Keycloak user info response: ${inspect(response.data)}`
    // );
    // Keycloak restituisce: sub, email, email_verified, preferred_username
    const { sub, email, email_verified, preferred_username } = response.data;
    return {
      id: sub,
      email,
      emailVerified: email_verified,
      username: preferred_username,
    };
  }

  async findUserByEmail(
    tokenDto: Token,
    email: string
  ): Promise<IKeycloakUser> {
    const adminToken = await this.getAdminToken();
    const emailParam = encodeURIComponent(email);
    const response = await this.get(
      `/admin/realms/${this.realm}/users?email=${emailParam}`,
      {
        Authorization: `Bearer ${adminToken.access_token}`,
      }
    );
    return response.data;
  }

  async saveEmailVerificationToken(verificationToken: string): Promise<void> {
    const userId = userIdFromToken(verificationToken);

    const url = `/admin/realms/${this.realm}/profiles/${userId}/email-verification`;
    const response = await this.put(url, { verificationToken }); // FIXME: remove response because it is useless after debug
    this.logger.debug(
      `saveEmailVerificationToken.response (${url}): ${inspect(response)}`
    );
  }

  /**
   * Aggiorna le informazioni di un utente in Keycloak
   * @param userId id utente Keycloak
   * @param data oggetto con i campi da aggiornare (es: { email, firstName, lastName, ... })
   */
  async setUserInfo(
    tokenDto: Token,
    userId: string,
    data: Record<string, any>
  ): Promise<void> {
    this.logger.log(`setUserInfo(${userId}, ${inspect(data)})`);
    if (!userId || userId === "") {
      this.logger.error("setUserInfo: User ID is required");
      throw new KeycloakException("User ID is required");
    }
    const { access_token } = await this.getAdminToken();
    const url = `/admin/realms/${this.realm}/profiles/${userId}`;
    const headers: RawAxiosRequestHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    };

    await this.put(url, data, headers);
    this.logger.log(`setUserInfo: info aggiornate per userId=${userId}`);
  }

  /**
   * Imposta l'email dell'utente come verificata in Keycloak
   */
  async setVerifiedEmailOf(
    tokenDto: Token,
    userId: string,
    email: string
  ): Promise<void> {
    if (!userId || userId === "") {
      throw new KeycloakException("User ID is required");
    }
    const { access_token: adminAccessToken } = await this.getAdminToken();
    const url = `/admin/realms/${this.realm}/profiles/${userId}`;
    const headers: RawAxiosRequestHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${adminAccessToken}`,
    };
    const data = {
      email,
      emailVerified: true,
    };

    await this.put(url, data, headers);
    this.logger.log(
      `setVerifiedEmailOf: emailVerified=true for userId=${userId}, email=${email}`
    );
  }

  async getUserInfoByEmail(
    tokenDto: Token,
    email: string
  ): Promise<IKeycloakUserInfo> {
    const adminToken = await this.getAdminToken();
    const emailParam = encodeURIComponent(email);
    const response = await this.get(
      `/admin/realms/${this.realm}/users?email=${emailParam}`,
      {
        Authorization: `Bearer ${adminToken.access_token}`,
      }
    );
    return response.data[0]; // FIXME: it is the first?
  }

  async getClientUUID(
    adminAccessToken: string,
    clientId: string
  ): Promise<string> {
    const url = `/admin/realms/${this.realm}/clients?clientId=${clientId}`;
    const headers: RawAxiosRequestHeaders = {
      Accept: "application/json",
      Authorization: `Bearer ${adminAccessToken}`,
    };
    const response = await this.get(url, headers);
    // this.logger.debug(
    //   `getClientId.response (${url}): ${inspect(response)}`
    // );
    if (response.data.length === 0) {
      throw new KeycloakException(`Client ${clientId} not found`);
    }
    return response.data[0].id; // ritorna l'id tecnico del client
  }

  async createMapper(
    clientId: string,
    config: Record<string, any>
  ): Promise<void> {
    const adminToken = await this.getAdminToken();
    const clientUUID = await this.getClientUUID(
      adminToken.access_token,
      clientId
    );
    const url = `/admin/realms/${this.realm}/clients/${clientUUID}/protocol-mappers/models`;
    const headers: RawAxiosRequestHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${adminToken.access_token}`,
    };
    const protocolMapperConfig = {
      // id: "", // Keycloak lo genera
      name: "dike-tenant-id-mapper",
      protocol: "openid-connect",
      protocolMapper: "oidc-usermodel-attribute-mapper",
      consentRequired: false,
      config,
    };
    await this.post(url, protocolMapperConfig, headers);
  }

  async getMappers(clientId: string): Promise<any[]> {
    const adminToken = await this.getAdminToken();
    const clientUUID = await this.getClientUUID(
      adminToken.access_token,
      clientId
    );
    const url = `/admin/realms/${this.realm}/clients/${clientUUID}/protocol-mappers/models`;
    const headers: RawAxiosRequestHeaders = {
      Accept: "application/json",
      Authorization: `Bearer ${adminToken.access_token}`,
    };
    const response = await this.get(url, headers);
    return response.data;
  }

  async updateMapper(
    clientId: string,
    mapperId: string,
    config: Record<string, any>
  ): Promise<void> {
    const adminToken = await this.getAdminToken();
    const clientUUID = await this.getClientUUID(
      adminToken.access_token,
      clientId
    );
    const url = `/admin/realms/${this.realm}/clients/${clientUUID}/protocol-mappers/models/${mapperId}`;
    const headers: RawAxiosRequestHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${adminToken.access_token}`,
    };
    const protocolMapperConfig = {
      id: mapperId,
      name: "dike-tenant-id-mapper",
      protocol: "openid-connect",
      protocolMapper: "oidc-usermodel-attribute-mapper",
      consentRequired: false,
      config,
    };
    await this.put(url, protocolMapperConfig, headers);
  }

  async getTenantId(accessToken: string): Promise<string> {
    // decose jwt token
    const decodedToken: DecodedKeycloakToken = jwt.decode(accessToken, {
      complete: true,
    }) as any;
    this.logger.debug(`Decoded token: ${inspect(decodedToken)}`);
    if (!decodedToken) {
      throw new KeycloakException("Invalid access token");
    }
    // estrai tenantId dai claim
    const tenantId = decodedToken.payload?.tenantId;
    if (!tenantId) {
      throw new KeycloakException("tenantId not found in token");
    }
    return tenantId;
  }

  /**
   * Decode a Keycloak JWT access token and return its payload.
   * Accepts either a raw token string or a `Token` DTO.
   *
   * @param {string | Token} tokenOrDto - Raw token or TokenDto
   * @return {Promise<DecodedKeycloakToken>} Decoded Keycloak token
   */
  async decode(tokenOrDto: string | Token): Promise<DecodedKeycloakToken> {
    const accessToken = typeof tokenOrDto === "string" ? tokenOrDto : tokenOrDto.accessToken;
    const decoded = jwt.decode(accessToken);
    if (!decoded) {
      console.trace("Failed to decode token:", accessToken);
      throw new KeycloakException("Invalid access token");
    }
    // jsonwebtoken.decode without `complete` returns the payload directly
    return decoded as DecodedKeycloakToken;
  }

  private get jwksUri(): string {
    return `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/certs`;
  }

  public async getKeycloakPublicKey(kid: string): Promise<string> {
    // this.logger.log("🔑 Requesting public key for kid:", kid);
    return new Promise((resolve, reject) => {
      this.jwksClient.getSigningKey(kid, (err, key) => {
        if (err) {
          // this.logger.error("❌ JWKS error:", err);
          reject(err);
        } else {
          const signingKey = key?.getPublicKey();
          // this.logger.log("✅ Public key found:", !!signingKey);
          if (signingKey) {
            resolve(signingKey);
          } else {
            reject(new Error("Unable to get public key"));
          }
        }
      });
    });
  }

  get issuer(): string {
    // return `${this.baseUrl}/realms/${this.realm}`;
    return `${this.baseUrl}/realms/master`;
  }
}
