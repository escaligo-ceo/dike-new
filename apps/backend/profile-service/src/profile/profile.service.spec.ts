import {
  AppLogger,
  DbConnection,
  EnvNotFoundException,
  Profile,
  UpdateUserProfileDto,
} from "@dike/common";
import { INestApplication } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Test } from "@nestjs/testing";
import { Dialect } from "sequelize";
import { entities } from "../database/entities";
import { ProfileService } from "./profile.service";

describe("UserService", () => {
  let app: INestApplication;
  let service: ProfileService;

  const dto: UpdateUserProfileDto = {
    firstName: "John",
    lastName: "Doe",
    email: "",
    phoneNumber: "",
    piva: "system",
    avatarUrl: "",
    backgroundUrl: "",
    fullName: "Johnathan Doe",
    bio: "",
    defaultRedirectUrl: "",
    // originIp: "",
    // originUserAgent: "",
  };

  beforeAll(async () => {
    const connectionStr = process.env.PROFILE_DB_CONNECTION_STR;
    if (!connectionStr) {
      // "postgres://profile_admin:profile_password@localhost:5432/profile_db"
      throw new EnvNotFoundException("PROFILE_DB_CONNECTION_STR");
    }
    const connectionParams = new DbConnection(connectionStr);
    const moduleRef = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot({
          dialect: connectionParams.dialect as Dialect,
          host: connectionParams.host,
          port: connectionParams.port,
          username: connectionParams.username,
          password: connectionParams.password,
          database: connectionParams.dbName,

          autoLoadModels: true,
          // synchronize: true, // Set to false in production
          synchronize: false,
          logging: false, // Disable logging for tests
        }),
        SequelizeModule.forFeature(entities),
      ],
      providers: [ProfileService, AppLogger],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    service = app.get<ProfileService>(ProfileService);
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return profile for a given user ID", async () => {
    const userId = "test-user-id";
    const [userProfile, create]: FindOrCreateProfileResponse =
      await service.findOrCreate({
        userId,
        ...dto,
      });
    expect(userProfile).toBeDefined();
    // expect(userProfile.userId).toEqual(userId);
    expect(create).toBe(false);
  });

  it("should log profile initialization", async () => {
    const userId = "test-user-id-2";
    const logSpy = jest.spyOn(service["logger"], "log");
    await service.findOrCreate({
      userId,
      ...dto,
    });
    expect(logSpy).toHaveBeenCalledWith(
      `Profile for user ID ${userId} initialized successfully.`
    );
  });

  it("when loking for a user profile never requested before, it initializes the profile", async () => {
    const userId = "new-user-id-3";
    const profile: Profile | null = await service.findByUserId(userId);
    expect(profile).toBeDefined();
    // expect(profile?.userId).toEqual(userId);
  });
});
