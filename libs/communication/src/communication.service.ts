import {
  AppLogger,
  BaseUrl,
  DikeConfigService,
  EnvNotFoundException,
  HttpErrorHandler,
  HttpServiceException,
  OriginDto,
} from "@dike/common";
import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { RawAxiosRequestHeaders } from "axios";
import { firstValueFrom } from "rxjs";
import { ResponseDto } from "./communication.dto";

@Injectable()
export abstract class BaseHttpService {
  protected readonly serviceParams: BaseUrl;
  private readonly errorHandler: HttpErrorHandler;

  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly serviceUrl: string
  ) {
    this.errorHandler = new HttpErrorHandler(this.logger);
    this.logger = new AppLogger(BaseHttpService.name);
    this.serviceParams = new BaseUrl(this.serviceUrl);
  }

  protected get baseUrl(): string {
    return this.serviceParams.baseUrl();
  }

  protected buildHeaders(
    { originIp, originUserAgent }: OriginDto,
    token?: string,
    extra?: RawAxiosRequestHeaders
  ): RawAxiosRequestHeaders {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-forwarded-for": originIp,
      "user-agent": originUserAgent,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(extra || {}),
    };
  }

  async get(
    url: string,
    originDto: OriginDto,
    headers: RawAxiosRequestHeaders = {}
  ): Promise<ResponseDto> {
    const requestUrl = `${this.baseUrl}${url}`;
    try {
      const res = await firstValueFrom(
        this.httpService.get(requestUrl, {
          headers: this.buildHeaders(
            originDto,
            originDto.authorization,
            headers
          ),
        })
      );
      if (!res) {
        this.logger.error("Response is undefined");
        throw new EnvNotFoundException("Response is undefined");
      }
      const { config, request, ...resSafe } = res;
      const cleanedResponse = { ...resSafe, url: requestUrl };

      return cleanedResponse;
    } catch (error) {
      if (error instanceof HttpServiceException) {
        throw error;
      }

      const status =
        error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error?.response?.data?.message || error?.message || "Request failed";

      this.logger.error(
        `GET error - status: ${status}, url: ${requestUrl}, message: ${message}`
      );
      throw new HttpServiceException({
        service: BaseHttpService.name,
        method: "GET",
        url: requestUrl,
        status,
        message,
        data: error?.response?.data,
      });
    }
  }

  async post(
    url: string,
    data: any,
    originDto: OriginDto,
    headers: RawAxiosRequestHeaders = {}
  ): Promise<ResponseDto> {
    const requestUrl = `${this.baseUrl}${url}`;
    try {
      const res = await firstValueFrom(
        this.httpService.post(requestUrl, data, {
          headers: this.buildHeaders(
            originDto,
            originDto.authorization,
            headers
          ),
        })
      );
      if (!res) {
        this.logger.error("Response is undefined");
        throw new Error("Response is undefined");
      }
      const { config, request, ...resSafe } = res;
      const cleanedResponse = { ...resSafe, url: requestUrl };

      return cleanedResponse;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const status =
        error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error?.response?.data?.message || error?.message || "Request failed";

      this.logger.error(
        `POST error - status: ${status}, url: ${requestUrl}, message: ${message}`
      );
      throw new HttpException(message, status);
    }
  }

  async patch(
    url: string,
    data: any,
    originDto: OriginDto,
    headers: RawAxiosRequestHeaders = {}
  ): Promise<ResponseDto> {
    const requestUrl = `${this.baseUrl}${url}`;
    try {
      const res = await firstValueFrom(
        this.httpService.patch(requestUrl, data, {
          headers: this.buildHeaders(
            originDto,
            originDto.authorization,
            headers
          ),
        })
      );
      if (!res) {
        this.logger.error("Response is undefined");
        throw new EnvNotFoundException("Response is undefined");
      }
      const { config, request, ...resSafe } = res;
      const cleanedResponse = { ...resSafe, url: requestUrl };

      return cleanedResponse;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const status =
        error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error?.response?.data?.message || error?.message || "Request failed";

      this.logger.error(
        `PATCH error - status: ${status}, url: ${requestUrl}, message: ${message}`
      );
      throw new HttpException(message, status);
    }
  }

  async put(
    url: string,
    data: any,
    originDto: OriginDto,
    headers: RawAxiosRequestHeaders = {}
  ): Promise<ResponseDto> {
    const requestUrl = `${this.baseUrl}${url}`;
    try {
      const res = await firstValueFrom(
        this.httpService.put(requestUrl, data, {
          headers: this.buildHeaders(
            originDto,
            originDto.authorization,
            headers
          ),
        })
      );
      if (!res) {
        this.logger.error("Response is undefined");
        throw new EnvNotFoundException("Response is undefined");
      }
      const { config, request, ...resSafe } = res;
      const cleanedResponse = { ...resSafe, url: requestUrl };

      return cleanedResponse;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const status =
        error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error?.response?.data?.message || error?.message || "Request failed";

      this.logger.error(
        `PUT error - status: ${status}, url: ${requestUrl}, message: ${message}`
      );
      throw new HttpException(message, status);
    }
  }

  async delete(
    url: string,
    originDto: OriginDto,
    headers: RawAxiosRequestHeaders = {}
  ): Promise<ResponseDto> {
    const requestUrl = `${this.baseUrl}${url}`;
    try {
      const res = await firstValueFrom(
        this.httpService.delete(requestUrl, {
          headers: this.buildHeaders(
            originDto,
            originDto.authorization,
            headers
          ),
        })
      );
      if (!res) {
        this.logger.error("Response is undefined");
        throw new Error("Response is undefined");
      }
      const { config, request, ...resSafe } = res;
      const cleanedResponse = { ...resSafe, url: requestUrl };

      return cleanedResponse;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const status =
        error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error?.response?.data?.message || error?.message || "Request failed";

      this.logger.error(
        `DELETE error - status: ${status}, url: ${requestUrl}, message: ${message}`
      );
      throw new HttpException(message, status);
    }
  }
}
