export enum OnboardingStep {
  NOT_STARTED = "NOT_STARTED",
  STARTED = "STARTED",
  USER_CREATION = "USER_CREATION",
  PROFILE_CREATION = "PROFILE_CREATION",
  TENANT_CREATION = "TENANT_CREATION",
  TEAM_CREATION = "TEAM_CREATION",
  OFFICE_CREATION = "OFFICE_CREATION",
  ASSIGN_SUBSCRIPTION = "ASSIGN_SUBSCRIPTION",
  SEND_INVITATIONS = "SEND_INVITATIONS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum OnboardingCode {
  OK = 0,
  INVALID_ONBOARDING_STEP = 1,
}

export enum OnboardingPages {
  START = 1,
  STEP_1 = 1,
  STEP_2 = 2,
  USER_CREATION = 2,
  STEP_3 = 3,
  PROFILE_CREATION = 3,
  STEP_4 = 4,
  TENANT_CREATION = 4,
  STEP_5 = 5,
  SUBSCRIPTION_SELECTION = 5,
  STEP_6 = 6,
  OFFICE_CREATION = 6,
  STEP_7 = 7,
  TEAM_CREATION = 7,
  STEP_8 = 8,
  SEND_INVITATIONS = 8,
  STEP_MAX = 8,
  COMPLETED = 9,
}

export enum OnboardingStatus {
  NOT_STARTED = "NOT_STARTED",
  STARTED = "STARTED",
  USER_CREATED = "USER_CREATED",
  PROFILE_CREATED = "PROFILE_CREATED",
  TENANT_CREATED = "TENANT_CREATED",
  OFFICE_CREATED = "OFFICE_CREATED",
  TEAM_CREATED = "TEAM_CREATED",
  SUBSCRIPTION_ASSIGNED = "SUBSCRIPTION_ASSIGNED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  IN_PROGRESS = "IN_PROGRESS",
}

/**
 * Converte uno step di onboarding nella pagina corrispondente
 */
export function stepToPage(step: OnboardingStep): OnboardingPages {
  switch (step) {
    case OnboardingStep.NOT_STARTED:
    case OnboardingStep.STARTED:
      return OnboardingPages.START;
    case OnboardingStep.USER_CREATION:
      return OnboardingPages.USER_CREATION;
    case OnboardingStep.PROFILE_CREATION:
      return OnboardingPages.PROFILE_CREATION;
    case OnboardingStep.TENANT_CREATION:
      return OnboardingPages.TENANT_CREATION;
    case OnboardingStep.TEAM_CREATION:
      return OnboardingPages.TEAM_CREATION;
    case OnboardingStep.OFFICE_CREATION:
      return OnboardingPages.OFFICE_CREATION;
    case OnboardingStep.ASSIGN_SUBSCRIPTION:
      return OnboardingPages.SUBSCRIPTION_SELECTION;
    case OnboardingStep.COMPLETED:
      return OnboardingPages.COMPLETED;
    case OnboardingStep.FAILED:
      return OnboardingPages.START;
    default:
      return OnboardingPages.START;
  }
}

/**
 * Converte una pagina di onboarding nello step corrispondente
 */
export function pageToStep(page: OnboardingPages): OnboardingStep {
  switch (page) {
    case OnboardingPages.START:
    case OnboardingPages.STEP_1:
      return OnboardingStep.STARTED;
    case OnboardingPages.USER_CREATION:
    case OnboardingPages.STEP_2:
      return OnboardingStep.USER_CREATION;
    case OnboardingPages.PROFILE_CREATION:
    case OnboardingPages.STEP_3:
      return OnboardingStep.PROFILE_CREATION;
    case OnboardingPages.TENANT_CREATION:
    case OnboardingPages.STEP_4:
      return OnboardingStep.TENANT_CREATION;
    case OnboardingPages.SUBSCRIPTION_SELECTION:
    case OnboardingPages.STEP_5:
      return OnboardingStep.ASSIGN_SUBSCRIPTION;
    case OnboardingPages.OFFICE_CREATION:
    case OnboardingPages.STEP_6:
      return OnboardingStep.OFFICE_CREATION;
    case OnboardingPages.TEAM_CREATION:
    case OnboardingPages.STEP_7:
      return OnboardingStep.TEAM_CREATION;
    case OnboardingPages.SEND_INVITATIONS:
    case OnboardingPages.STEP_8:
      return OnboardingStep.SEND_INVITATIONS;
    case OnboardingPages.COMPLETED:
      return OnboardingStep.COMPLETED;
    default:
      return OnboardingStep.NOT_STARTED;
  }
}
