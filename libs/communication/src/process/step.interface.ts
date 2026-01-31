import { LoggedUser } from "../user/logged-user";

export interface IBaseStep {
  execute(
    context: any,
    input: any
  ): Promise<any>;
}

export interface IStep extends IBaseStep{
  execute(
    loggedUser: LoggedUser,
    input: any
  ): Promise<any>;
}
