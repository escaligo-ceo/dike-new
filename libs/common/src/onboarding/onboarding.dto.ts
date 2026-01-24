import { ApiProperty } from "@nestjs/swagger";
import { Response } from "express";

export class BaseOnboardingDto {
  @ApiProperty({
    description: "Express Response object for redirection",
  })
  res: Response;
}

export class OnboardingStepDto {
  @ApiProperty({
    description: "Onboarding Step number to check",
  })
  step: number;
}

export class PostOnboardingDto extends BaseOnboardingDto {
  @ApiProperty({
    description: "Profile data to complete",
    type: Object,
    example: {
      firstName: "John",
      lastName: "Doe",
      company: "Acme Corp",
      position: "Developer",
      phone: "+1234567890",
    },
  })
  body: any;
}
