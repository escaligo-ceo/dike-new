import { Analytics, AppLogger, CurrentUser, DikeConfigService } from "@dike/common";
import {
  Audit,
  AuditAction,
  AuditCategory,
  BaseController,
  JwtAuthGuard,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Resource, ResourceType } from "../entities/resource.entity";
import { Template } from "../entities/template.entity";
import { ResourceService } from "./resource.service";
import { TemplateLoaderService } from "./template-loader.service";

@ApiTags("templates")
@Controller("templates")
@UseGuards(JwtAuthGuard)
export class TemplateLoaderController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
    private readonly templateLoaderService: TemplateLoaderService,
    private readonly resourceService: ResourceService,
    protected readonly userFactory: UserFactory,
  ) {
    super(
      new AppLogger(TemplateLoaderController.name),
      configService,
      userFactory,
    );
  }

  @Post("find-or-create")
  @Version("1")
  @Audit(AuditCategory.TEMPLATE, AuditAction.CREATE)
  @ApiOperation({
    summary: "Set a template data",
  })
  async createemplate(
    @Req() req,
    @CurrentUser() loggedUser: LoggedUser,
    @Body() templateData: Partial<Template>,
  ): Promise<Template> {
    this.logRequest(req, `createemplate`);
    let created = false;
    let template: Template | null = null;
    const { id } = templateData;
    if (id) {
      template = await this.templateLoaderService.findById(loggedUser, id);
    }
    if (!template) {
      const entity = {
        ...templateData,
      };
      const templateInstance = this.templateRepository.create(entity);
      template = await this.templateRepository.save(templateInstance);
      created = true;
      return template;
    }

    Object.assign(template, templateData);
    await this.templateRepository.save(template);

    return template;
  }

  @Get(":templateId")
  @Version("1")
  @Analytics()
  @ApiOperation({
    summary: "Get a template by ID",
  })
  @ApiParam({
    name: "templateId",
    type: "string",
    description: "ID del template",
  })
  async getTemplate(
    @Req() req,
    @CurrentUser() loggedUser: LoggedUser,
    @Param("templateId") templateId: string,
  ): Promise<Template> {
    this.logRequest(req, `getTemplate`);
    const res = await this.templateLoaderService.findById(
      loggedUser,
      templateId,
    );
    if (!res) {
      throw new NotFoundException(`Template '${templateId}' not found`);
    }
    return res;
  }

  @Put(":templateId/resources/:resourceType")
  @Version("1")
  @Audit(AuditCategory.TEMPLATE, AuditAction.UPDATE)
  @ApiOperation({
    summary: "Update a resource to a template",
  })
  @ApiParam({
    name: "templateId",
    type: "string",
    description: "ID del template",
  })
  @ApiParam({
    name: "resourceType",
    type: "string",
    description: "Type of the resource",
  })
  async addResource(
    @Req() req,
    @CurrentUser() loggedUser: LoggedUser,
    @Param("templateId") templateId: string,
    @Param("resourceType") resourceType: ResourceType,
    @Body() resourceData: Partial<Resource>,
  ): Promise<Resource> {
    this.logRequest(req, `addResource`);
    const template = await this.templateLoaderService.findById(
      loggedUser,
      templateId,
    );
    if (!template) {
      throw new NotFoundException(`Template '${templateId}' not found`);
    }
    const resource = await this.templateLoaderService.addOrUpdateResource(
      loggedUser,
      {
        template,
        resourceType,
        resourceData,
      },
    );
    // return { message: 'Resource added successfully' };
    return resource;
  }

  @Post(":templateId/resources")
  @Version("1")
  @Audit(AuditCategory.TEMPLATE, AuditAction.CREATE)
  @ApiOperation({
    summary: "Add a resource to a template",
  })
  @ApiParam({
    name: "templateId",
    type: "string",
    description: "ID del template",
  })
  async updateTemplate(
    @Req() req,
    @CurrentUser() loggedUser: LoggedUser,
    @Param("templateId") templateId: string,
    @Body() templateData: Partial<Template>,
  ): Promise<Template> {
    this.logRequest(req, `updateTemplate`);
    const template = await this.templateLoaderService.findById(
      loggedUser,
      templateId,
    );
    if (!template) {
      throw new NotFoundException(`Template '${templateId}' not found`);
    }

    Object.assign(template, templateData);
    await this.templateLoaderService.save(template);
    return template;
  }

  @Delete(":templateId")
  @Version("1")
  @Audit(AuditCategory.TEMPLATE, AuditAction.DELETE)
  @ApiOperation({
    summary: "Delete a template by ID",
  })
  @ApiParam({
    name: "templateId",
    type: "string",
    description: "ID del template",
  })
  async deleteTemplate(
    @Req() req,
    @CurrentUser() loggedUser: LoggedUser,
    @Param("templateId") templateId: string,
  ): Promise<Template> {
    this.logRequest(req, `deleteTemplate`);
    const template = await this.templateLoaderService.deleteById(
      loggedUser,
      templateId,
    );
    if (!template) {
      throw new NotFoundException(`Template '${templateId}' not found`);
    }
    return template;
  }

  @Delete(":templateId/resources/:resourceType")
  @Version("1")
  @Audit(AuditCategory.TEMPLATE, AuditAction.DELETE)
  @ApiOperation({
    summary: "Delete resources of a specific type from a template",
  })
  async deleteResourcesByType(
    @Req() req,
    @CurrentUser() loggedUser: LoggedUser,
    @Param("templateId") templateId: string,
    @Param("resourceType") resourceType: ResourceType,
  ): Promise<Resource[]> {
    this.logRequest(req, `deleteResourcesByType`);
    const template = await this.templateLoaderService.findById(
      loggedUser,
      templateId,
    );
    if (!template) {
      throw new NotFoundException(`Template '${templateId}' not found`);
    }
    const resources = await this.resourceService.deleteResourcesByType(
      loggedUser,
      {
        template,
        resourceType,
      },
    );
    return resources;
  }
}
