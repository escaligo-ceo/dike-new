import { AppLogger } from "@dike/common";
import { JwtAuthGuard } from "@dike/communication";
import { Controller, Get, Render, UseGuards } from "@nestjs/common";

@UseGuards(JwtAuthGuard)
@Controller("people")
export class PeopleController {
  constructor(private readonly logger: AppLogger) {
    this.logger = new AppLogger(PeopleController.name);
  }

  @Get("people")
  @Render("contact/people")
  getPeople() {
    this.logger.log("Fetching people data");
    return { message: "List of people" };
  }
}
