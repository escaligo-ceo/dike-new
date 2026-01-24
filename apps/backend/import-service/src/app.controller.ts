import { IPingResponse } from "@dike/common";
import { Controller, Get, Header, Version, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Version(VERSION_NEUTRAL)
  @ApiOperation({ summary: "ping" })
  @ApiOkResponse({
    description: "Il servizio è attivo",
  })
  @Header("Content-Type", "application/json")
  ping(): IPingResponse {
    return this.appService.ping();
  }
}
