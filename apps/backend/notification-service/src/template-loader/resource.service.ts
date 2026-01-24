import { AppLogger } from "@dike/common";
import { Template } from "../entities/template.entity";
import { Resource, ResourceType } from "../entities/resource.entity";
import { NotFoundException } from "@nestjs/common";
import { LoggedUser } from "@dike/communication";

export class ResourceService {
  constructor(
    private readonly logger: AppLogger,
  ) {
    this.logger = new AppLogger(ResourceService.name);
  }

  async deleteResourcesByType(
    loggedUser: LoggedUser,
    {
      template,
      resourceType
    }: {
    template: Template;
    resourceType: ResourceType;
  }): Promise<Resource[]> {
    if (!template) {
      throw new NotFoundException('Template not provided');
    }
    const resources = await template.removeResourcesByType(resourceType);
    return resources;
  }
}