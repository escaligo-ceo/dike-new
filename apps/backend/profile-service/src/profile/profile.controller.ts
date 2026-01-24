import {
  Analytics,
  AppLogger,
  CurrentUser,
  DikeConfigService,
  inspect,
  Profile,
} from "@dike/common";
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
  FindOrCreateProfileRequest,
  FindOrCreateProfileResponse,
  InternalFindOrCreateProfileRequest,
} from "@dike/contracts";
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Version,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { diskStorage } from "multer";
import { extname } from "path";
import { ProfileService } from "./profile.service";

@ApiTags("profiles")
@Controller("profiles")
@UseGuards(JwtAuthGuard)
export class ProfileController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    private readonly profileService: ProfileService,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
  ) {
    super(new AppLogger(ProfileController.name), configService, userFactory);
  }

  /**
   * Endpoint to retrieve a user profile by user JWT token.
   * @returns A promise that resolves to the user profile data.
   */
  @Post("find-or-create")
  @Version("1")
  @Audit(AuditCategory.PROFILE, AuditAction.CREATE)
  @ApiOperation({ summary: "Recupera o crea un profilo utente" })
  async findOrCreate(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() body: FindOrCreateProfileRequest,
    @Req() req,
  ): Promise<FindOrCreateProfileResponse> {
    this.logRequest(req, `findOrCreate called with: ${inspect(body)}`);
    return this.profileService.findOrCreate(loggedUser, body);
  }

  /**
   * Endpoint interno per recuperare o creare un profilo utente, accettando direttamente il payload utente.
   * Da usare per chiamate interne tra microservizi.
   */
  @Post("internal/find-or-create")
  @Version("1")
  @Audit(AuditCategory.PROFILE, AuditAction.CREATE)
  @ApiOperation({
    summary: "[INTERNAL] Recupera o crea un profilo utente (payload diretto)",
  })
  async internalFindOrCreate(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() body: InternalFindOrCreateProfileRequest,
    @Req() req,
  ): Promise<FindOrCreateProfileResponse> {
    this.logRequest(
      req,
      `[INTERNAL] internalFindOrCreate called with: ${inspect(body.profileData)}`,
    );
    return this.profileService.internalFindOrCreate(loggedUser);
  }

  /**
   * Endpoint to create a user profile.
   * @returns {Promise<Profile>} A promise that resolves to the created profile data.
   */
  @Post(":userId")
  @Version("1")
  @Audit(AuditCategory.PROFILE, AuditAction.CREATE)
  @ApiOperation({ summary: "Crea un profilo utente" })
  @ApiParam({
    name: "userId",
    description: "ID dell'utente per cui creare il profilo",
  })
  async createProfile(
    @Param("userId") userId: string,
    @CurrentUser() loggedUser: LoggedUser,
    @Body() dto: Partial<Profile>,
    @Req() req,
  ): Promise<Profile> {
    this.logRequest(req, `createProfile: ${userId}`);
    const { id, ...data } = dto;
    // Ensure fullName is undefined if null, to match UpdateProfileDto type
    const safeData = {
      ...data,
      fullName: data.fullName === null ? undefined : data.fullName,
    };
    return this.profileService.updateProfileByUserId(loggedUser, userId, {
      profileData: safeData,
    });
  }

  @Patch(":userId")
  @Version("1")
  @Audit(AuditCategory.PROFILE, AuditAction.UPDATE)
  @ApiOperation({ summary: "Aggiorna un profilo utente" })
  @ApiParam({
    name: "userId",
    description: "ID dell'utente per cui aggiornare il profilo",
  })
  async updateProfile(
    @Param("userId") userId: string,
    @CurrentUser() loggedUser: LoggedUser,
    @Body() profileData: Partial<Profile>,
    @Req() req,
  ): Promise<Profile> {
    this.logRequest(req, `updateProfile: ${userId}`);
    // const { defaultRedirectUrl, lastCompletedOnBoardingStep } = profileData;
    // Ensure fullName is undefined if null, to match UpdateProfileDto type
    const safeData = {
      ...profileData,
      userId: undefined,
      // ...data,
      // fullName: data.fullName === null ? undefined : data.fullName,
      // defaultRedirectUrl,
      // lastCompletedOnBoardingStep,
    };
    return this.profileService.updateProfileByUserId(
      loggedUser,
      userId ?? loggedUser.id,
      { profileData: safeData },
    );
  }

  @Post("avatar")
  @Version("1")
  @Audit(AuditCategory.PROFILE, AuditAction.UPLOAD_AVATAR)
  @ApiOperation({ summary: "Carica avatar utente" })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads/avatars",
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `user-${req.body.userId}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new Error("Only jpg/jpeg/png files are allowed"), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser() loggedUser: LoggedUser,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    this.logRequest(req, `Uploading avatar`);
    return this.profileService.uploadAvatar(loggedUser, file);
  }

  @Get(":userId")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Recupera il profilo utente tramite userId" })
  @ApiParam({
    name: "userId",
    description: "ID dell'utente di cui recuperare il profilo",
  })
  async findByUserId(
    @Param("userId") userId: string,
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ): Promise<Profile | null> {
    this.logRequest(req, `findByUserId: ${userId}`);
    return this.profileService.findByUserId(loggedUser);
  }

  @Get("internal/:userId")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Recupera il profilo utente tramite userId" })
  @ApiParam({
    name: "userId",
    description: "ID dell'utente di cui recuperare il profilo",
  })
  async internalFindByUserId(
    @Param("userId") userId: string,
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ): Promise<Profile | null> {
    this.logRequest(req, `internalFindByUserId: ${userId}`);
    return this.profileService.internalFindByUserId(loggedUser);
  }

  @Get("profile/settings")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Recupera le impostazioni del profilo utente" })
  async getProfileSettings(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ): Promise<any> {
    this.logRequest(req, `getProfileSettings`);
    return this.profileService.getProfileSettings(loggedUser);
  }

  @Put("profile/settings")
  @Version("1")
  @Audit(AuditCategory.PROFILE, AuditAction.UPDATE)
  @ApiOperation({ summary: "Aggiorna le impostazioni del profilo utente" })
  async updateProfileSettings(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() settingsData: any,
    @Req() req,
  ): Promise<any> {
    this.logRequest(req, `updateProfileSettings`);
    return this.profileService.updateProfileSettings(loggedUser, settingsData);
  }

  @Put("profile/settings/visibility")
  @Version("1")
  @Audit(AuditCategory.PROFILE, AuditAction.UPDATE)
  @ApiOperation({ summary: "Aggiorna le impostazioni del profilo utente" })
  async updateProfileVisibilitySettings(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() settingsData: any,
    @Req() req,
  ): Promise<any> {
    this.logRequest(req, `updateProfileVisibilitySettings`);
    return this.profileService.updateProfileSettings(loggedUser, settingsData);
  }
}
