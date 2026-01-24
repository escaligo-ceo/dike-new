import { LoggedUser } from "../user/logged-user";


export interface IStep {
  execute(
    loggedUser: LoggedUser,
    input: any
  ): Promise<any>;
}
