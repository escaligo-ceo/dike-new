import { Actions } from "../app/actions.js";
import { OnboardingStep } from "./onboarding.enum.js";

export interface IOnboardingResponse {
  userId: string;                     // id dell'utente (un utente può avere al più un solo onboarding)
  currentStep: OnboardingStep | null; // step corrente, null se non iniziato
  nextStep: OnboardingStep | null;    // passo successivo
  requiredFields?: string[];          // campi mancanti o richiesti
  action: Actions;                    // START | CONTINUE | RETRY | NONE
  reason?: string | null;             // opzionale, per FAILED o RETRY
  completedSteps?: OnboardingStep[];  // opzionale, lista di step completati
  missingFields?: string[];           // opzionale, lista di campi mancanti
}
