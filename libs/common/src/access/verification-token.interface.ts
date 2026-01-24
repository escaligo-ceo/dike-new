import { TokenType, VerificationError } from "./access.enum.js";

export interface IVerificationToken {
  userId: string;
  email: string;
  tokenType: TokenType;
  expiresAt: Date;
  createdAt: Date;
  isUsed: boolean;
}

export interface IExchangeTokenOptions {
  tokenType: TokenType;
  expirationMinutes?: number; // Default: 24 ore per email verification, 1 ora per password reset
}

export interface IVerificationLinkOptions extends IExchangeTokenOptions {
  userId: string;
  email: string;
  baseUrl?: string; // URL base del frontend
}

export interface IVerificationResult {
  verificationUrl: string;
  token: string;
  expiresAt: Date;
}

export interface VerificationResult {
  success: boolean;
  userId?: string;
  email?: string;
  error?: string;
  errorCode?: VerificationError;
}
