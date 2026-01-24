import { IValidateUserResponse } from "@dike/communication";

export interface ILoginUserResponse extends IValidateUserResponse {
  success: boolean;
  status: number;
  message: string;
}

export interface IRegisterResponse {
  access_token: string;
}
