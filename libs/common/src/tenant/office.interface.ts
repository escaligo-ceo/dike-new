import { IAddress } from "@dike/contracts";

export interface  IOffice {
  id?: string
  name?: string;
  // address?: IAddress;
  address?: string;
  partitaIVA?: string;
  description?: string;
}