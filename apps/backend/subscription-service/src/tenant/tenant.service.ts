import {
  AppLogger,
  inspect,
  Office,
  Plan,
  PlanKeys,
  Subscription,
} from "@dike/common";
import { AuditService, LoggedUser } from "@dike/communication";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import { PlanService } from "../plan/plan.service";

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,
    private readonly logger: AppLogger,
    private readonly auditService: AuditService,
    private readonly planService: PlanService
  ) {
    this.logger = new AppLogger(TenantService.name);
  }

  /**
   * Attiva un abbonamento a un piano per un tenant specifico chiudendo
   * eventuali abbonamenti attivi precedenti.
   * 
   * @param {LoggedUser} loggedUser - Utente autenticato che effettua l'operazione
   * @param {string} tenantId - ID del tenant a cui associare l'abbonamento
   * @param {PlanKeys} planKey - Chiave del piano da sottoscrivere
   * @returns {Promise<Subscription>} - La sottoscrizione creata
   */
  async subscribePlanOnTenant(
    loggedUser: LoggedUser,
    tenantId: string,
    planKey: PlanKeys
  ): Promise<Subscription> {
    const plan: Plan | null = await this.planService.getActivePlanByKey(
      loggedUser,
      planKey
    );
    if (!plan || plan === null) {
      throw new Error(`Active plan with key ${planKey} not found`);
    }

    // Chiudi tutti gli abbonamenti attivi precedenti per il tenant
    const activeSubscriptions = await this.subscriptionRepository.find({
      where: {
        tenantId: tenantId ?? loggedUser.tenantId,
        isActive: true
      },
    });

    if (activeSubscriptions.length > 0) {
      this.logger.log(
        `Closing ${activeSubscriptions.length} active subscription(s) for tenant ${tenantId}`
      );

      for (const subscription of activeSubscriptions) {
        subscription.disable();
        await this.subscriptionRepository.save(subscription);

        this.auditService.safeLog(
          loggedUser,
          "SUBSCRIPTION_DISABLED",
          `Closing subscription for tenant ${tenantId} with plan ${subscription.planId}`
        );
      }
    }

    const entity = {
      tenantId: tenantId ?? loggedUser.tenantId,
      planId: plan.id,
    };
    const instance = this.subscriptionRepository.create(entity);
    const subscription = await this.subscriptionRepository.save(instance);

    this.auditService.safeLog(
      loggedUser,
      "PLAN_SUBSCRIPTION",
      `Subscribing plan ${planKey} to tenant ${tenantId}`
    );

    this.logger.log(
      `Subscribed plan ${planKey} to tenant ${tenantId}: ${inspect(subscription)}`
    );
    return subscription;
  }

  async createOfficeForTenant(
    loggedUser: LoggedUser,
    tenantId: string,
    { name, address }: { name: string; address?: string }
  ): Promise<Office> {
    const entity = {
      tenantId: tenantId ?? loggedUser.tenantId,
      name,
      address,
    };
    const office: Office = this.officeRepository.create(entity);
    await this.officeRepository.save(office);

    this.auditService.safeLog(
      loggedUser,
      "OFFICE_CREATION",
      `Creating office for tenant ${tenantId}`
    );

    this.logger.log(
      `Created office for tenant ${tenantId}: ${inspect(office)}`
    );
    return office;
  }
}
