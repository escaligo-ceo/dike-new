import { AppLogger, DikeJwtService, DikeModule } from "@dike/common";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { PeopleController } from "./people.controller";
import { KeycloakService } from "@dike/communication";

@Module({
  imports: [DikeModule, HttpModule],
  providers: [AppLogger, DikeJwtService, KeycloakService],
  controllers: [PeopleController],
})
export class PeopleModule {}
