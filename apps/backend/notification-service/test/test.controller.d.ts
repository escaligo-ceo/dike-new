import { AppLogger, DikeConfigService } from "@dike/common";
import { BaseController, UserFactory } from "@dike/communication";
import { EmailChannel } from "../src/email/email.service";
export declare class TestController extends BaseController {
    private readonly emailService;
    protected readonly logger: AppLogger;
    protected readonly configService: DikeConfigService;
    protected readonly userFactory: UserFactory;
    constructor(emailService: EmailChannel, logger: AppLogger, configService: DikeConfigService, userFactory: UserFactory);
    testTemplateLoader(req: any, originIp: string, originUserAgent: string, token: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
    }>;
}
//# sourceMappingURL=test.controller.d.ts.map