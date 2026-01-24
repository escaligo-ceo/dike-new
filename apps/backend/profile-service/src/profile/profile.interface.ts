import { Profile } from "@dike/common";

export interface IUpdateProfileResult {
  created: boolean;
	success: boolean;
  userProfile: Profile;
}
