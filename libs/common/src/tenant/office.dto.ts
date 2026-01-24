import { AddressDto } from "@dike/contracts";
import { IOffice } from "./office.interface.js";

export class OfficeDto implements IOffice {
  id?: string;
  name?: string;
  // address?: AddressDto;
  address?: string;
  partitaIVA?: string;
  description?: string;
}