import { EmailVerificationToken } from "@dike/common";
import { LoginSession } from "../entities/login-session.entity";
import { WatchedPerson } from "../entities/watched-person.entity";

export const entities= [EmailVerificationToken, LoginSession, WatchedPerson];