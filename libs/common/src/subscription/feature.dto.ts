import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { PlanKeys } from "./plan-type.enum.js";

export const FEATURE_UNAVAILABLE = undefined;
export const FEATURE_NOT_LIMITED = -1;

export class FeatureByTenantDto {
  @ApiProperty({
    description: "ID del tenant",
  })
  @IsString()
  tenantId: string;

  @ApiProperty({
    description: "Nome della feature da recuperare",
  })
  @IsString()
  featureName: string;
}

export class SubscribePlanOnTenantDto {
  @ApiProperty({
    description: "ID del tenant",
  })
  @IsString()
  tenantId: string;

  @ApiProperty({
    enum: PlanKeys,
    description: "Piano da sottoscrivere per il tenant",
  })
  planKey: PlanKeys;
}

export class FindFeatureByNameAndTenantIdDto {
  @ApiProperty({
    description: "ID del tenant",
  })
  @IsString()
  tenantId: string;

  @ApiProperty({
    description: "Nome della feature da recuperare",
  })
  @IsString()
  featureName: string;
}

export class SetPlanTypeOnTenantDto {
  @ApiProperty({
    description: "ID del tenant",
  })
  @IsString()
  tenantId: string;

  @ApiProperty({
    enum: PlanKeys,
    description: "Piano da sottoscrivere per il tenant",
  })
  @IsString()
  planKey: PlanKeys;
}

export class SubscribePlanDto {
  @ApiProperty({
    description: "The ID of the user who owns the tenant",
  })
  @IsString()
  ownerId: string;

  @ApiProperty({
    description: "The name of the subscription plan",
  })
  planName: string;
}

export class IsFeatureEnabledDto {
  @ApiProperty({
    description: "tenant Id",
  })
  @IsString()
  tenantId: string;

  @ApiProperty({
    description: "feature name",
  })
  @IsString()
  featureName: string;
}

export class SubscribePlanOnTentant {
  @ApiProperty({
    description: "tenant Id",
  })
  @IsString()
  tenantId: string;

  @ApiProperty({
    description: "plan type",
  })
  planType: PlanKeys;
}
