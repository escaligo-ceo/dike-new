import { AxiosHeaderValue, AxiosResponseHeaders, AxiosHeaders } from "axios";

export class ResponseDto {
  data: any;
  status: number;
  statusText: string;
  headers: AxiosResponseHeaders | Partial<AxiosHeaders & {
      Server: AxiosHeaderValue;
      "Content-Type": AxiosHeaderValue;
      "Content-Length": AxiosHeaderValue;
      "Cache-Control": AxiosHeaderValue;
      "Content-Encoding": AxiosHeaderValue;
  } & {
      "set-cookie": string[];
  }>;
  url: string;
}