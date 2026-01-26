"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TestController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestController = void 0;
const common_1 = require("@dike/common");
const communication_1 = require("@dike/communication");
const common_2 = require("@nestjs/common");
const email_service_1 = require("../src/email/email.service");
let TestController = TestController_1 = class TestController extends communication_1.BaseController {
    constructor(emailService, logger, configService, userFactory) {
        super(new common_1.AppLogger(TestController_1.name), configService, userFactory);
        this.emailService = emailService;
        this.logger = logger;
        this.configService = configService;
        this.userFactory = userFactory;
    }
    async testTemplateLoader(req, originIp, originUserAgent, token) {
        this.logRequest(req, `testTemplateLoader called with originIp: ${originIp}, originUserAgent: ${originUserAgent}`);
        const loggedUser = this.userFactory.fromToken(req.decodedKeycloakToken, originIp, originUserAgent, token);
        this.logger.log("🧪 Endpoint di test per TemplateLoader chiamato");
        try {
            await this.emailService.testTemplateLoader(loggedUser);
            this.logger.log("✅ Test TemplateLoader completato con successo");
            return {
                success: true,
                message: "TemplateLoader test completed successfully",
            };
        }
        catch (error) {
            this.logger.error("❌ Test TemplateLoader fallito:", error.message);
            return {
                success: false,
                message: "TemplateLoader test failed",
                error: error.message,
            };
        }
    }
};
exports.TestController = TestController;
__decorate([
    (0, common_2.Get)("template-loader"),
    __param(0, (0, common_2.Req)()),
    __param(1, (0, common_1.OriginIp)()),
    __param(2, (0, common_1.OriginUserAgent)()),
    __param(3, (0, common_1.AuthorizationBearer)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], TestController.prototype, "testTemplateLoader", null);
exports.TestController = TestController = TestController_1 = __decorate([
    (0, common_2.Controller)("test"),
    __metadata("design:paramtypes", [email_service_1.EmailChannel,
        common_1.AppLogger,
        common_1.DikeConfigService,
        communication_1.UserFactory])
], TestController);
//# sourceMappingURL=test.controller.js.map