import { Profile, SubscriptionResponse, Tenant, Token } from "@dike/common";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ApiGatewayService } from "../api-gateway.service";

@Injectable()
export class LoggedUser {
  profile!: Profile;
  tenant!: Tenant;
  private _initialized = false;
  private loading = false;

  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly emailVerified: boolean,
    private readonly _tokenDto: Token,
    private readonly apiGatewayService: ApiGatewayService,
  ) {}

  async initialize(): Promise<void> {
    this.loading = true;
    this.profile = await this.getProfile();
    this.tenant = await this.getTenant();
    this._initialized = true;
  }

  get initialized(): boolean {
    return this._initialized;
  }

  getToken(): Token {
    return this._tokenDto;
  }

  get token(): Token {
    return this._tokenDto;
  }

  get refreshToken(): string | undefined {
    return this._tokenDto?.refreshToken;
  }

  get tenantId(): string {
    if (!this.initialized) {
      throw new Error("User not initialized");
    }
    if (this.profile.tenantId === null) {
      throw new Error("Tenant ID is null in profile");
    }
    return this.profile.tenantId;
  }

  async getProfile(): Promise<Profile> {
    if (!this.initialized && !this.loading) {
      await this.initialize();
    }
    const profile = await this.apiGatewayService.getProfileByUserId(
      this,
      this.id
    );
    if (!profile) {
      console.trace(`Profile not found for user: ${this.id}`);
      throw new NotFoundException("Profile not found for current user");
    }
    this.profile = profile;
    return profile;
  }

  async getTenant(): Promise<Tenant> {
    if (!this.initialized && !this.loading) {
      await this.initialize();
    }
    const tenantId = this.profile?.tenantId;
    if (!tenantId) {
      console.trace(`Tenant ID not found in profile for user: ${this.id}`);
      throw new NotFoundException("Tenant ID not found for current user");
    }
    const tenant = await this.apiGatewayService.findTenantById(
      this,
      this.tenantId
    );
    if (!tenant) {
      console.trace(`Tenant not found for user: ${this.id}, tenantId: ${this.tenantId}`);
      throw new NotFoundException("Tenant not found for current user");
    }
    this.tenant = tenant;
    return tenant;
  }

  async getSubscription(): Promise<SubscriptionResponse> {
    if (!this.initialized && !this.loading) {
      await this.initialize();
    }
    if (!this.tenantId) {
      console.trace(`Tenant ID not found for user: ${this.id}`);
      throw new NotFoundException("Tenant ID not found for current user");
    }
    return this.apiGatewayService.getSubscriptionByTenant(
      this,
      this.tenantId
    );
  }

  async dashboardData(): Promise<{
    contacts: number;
    invoices: number;
    matters: number;
    documents: number;
  }> {
    return {
      contacts: await this.apiGatewayService.getContactCount(this),
      invoices: await this.apiGatewayService.getInvoiceCount(this),
      matters: await this.apiGatewayService.getMattersCount(this),
      documents: await this.apiGatewayService.getDocumentsCount(this),
    };
  }
}
