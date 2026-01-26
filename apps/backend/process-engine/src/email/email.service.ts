import { LoggedUser } from "@dike/communication";

export class EmailService {
  async verifyEmailToken(loggedUser: LoggedUser, token: string): Promise<void> {
    // Implementation for verifying the email token
  }

  async sendEmailVerification(loggedUser: LoggedUser): Promise<void> {
    // Implementation for sending a verification email
  }

  async startEmailVerification(loggedUser: LoggedUser): Promise<void> {
    const userId = loggedUser.id;
    const email = loggedUser.email;
    if (!email) {
      throw new Error("User email is not available");
    }
    // Logic to generate a verification token
    const token = "generated-verification-token"; // Replace with actual token generation logic

    // Logic to send the verification email
    await this.sendEmailVerification(loggedUser);
  }}