import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";
import { OnboardingCode, OnboardingStatus } from "./onboarding.enum.js";

export class GetOnboardingStepResult {
  userId: string;
  onboarding: {
    step: number;
    code: OnboardingCode;
    status: OnboardingStatus;
  };
}

export class OnboardingResponse {
  @ApiProperty({
    description: 'INVALID_ONBOARDING_STEP'
  })
  error: OnboardingCode | undefined;
  
  @IsString()
  @ApiProperty({
    description: 'Devi completare prima il passo ><'
  })
  message: string;

  @IsNumber()
  @ApiProperty({
    description: 'completed step value'
  })
  currentStep: number;

  @IsString()
  @ApiProperty({
    description: 'JWT token da utilizzare per il passo successivo'
  })
  accessToken: string;

  @IsString()
  @ApiProperty({
    description: 'Refresh token da utilizzare per ottenere un nuovo access token'
  })
  refreshToken: string;
}