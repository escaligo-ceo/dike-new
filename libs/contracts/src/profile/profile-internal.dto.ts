import { Profile } from "@dike/common";
import { DecodedKeycloakToken } from "@dike/communication";

export interface FindOrCreateProfileRequest {
  profileData: Partial<Profile>;
}

export interface InternalFindOrCreateProfileRequest extends FindOrCreateProfileRequest{
  userPayload: DecodedKeycloakToken;
  // profileData: Partial<Profile>;
}

export type FindOrCreateProfileResponse = [Profile, boolean];
