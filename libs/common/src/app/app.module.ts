import { Global, Module } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DikeConfigService } from "./load-env-value.js";

@Global()
@Module({
  providers: [DikeConfigService, Reflector],
  exports: [DikeConfigService, Reflector],
})
export class DikeModule {}
