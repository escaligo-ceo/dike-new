import { IBirthPlace } from "./birth-place.interface.js";

export class BirthPlaceDto implements IBirthPlace {
  city?: string;
  state?: string;
  country?: string;
  cadastralCode?: string;
}
