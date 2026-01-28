import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EnvNotFoundException } from "../exceptions/env-not-found.exception.js";

@Injectable()
export class DikeConfigService {
  constructor(private readonly configService: ConfigService) {}

  env(key: string, defaultValue?: string): string {
    const res = this.configService.get<string>(key);
    if (!res) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new EnvNotFoundException(key);
    }
    return res;
  }
}
