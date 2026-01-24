import { BirthPlace } from "./birth-place.entity.js";
import { BirthPlaceDto } from "@dike/contracts";

export class BirthPlaceTransformer {
  static to(value: BirthPlace | null): BirthPlaceDto | null {
    if (!value) return null;
    return {
      city: value.city,
      state: value.state,
      country: value.country,
      cadastralCode: value.cadastralCode,
    };
  }

  static from (value: BirthPlaceDto | null | undefined): BirthPlace | undefined {
    if (!value) return undefined;
    const birthPlace = new BirthPlace();
    birthPlace.city = value.city;
    birthPlace.state = value.state;
    birthPlace.country = value.country;
    birthPlace.cadastralCode = value.cadastralCode;
    return birthPlace;
  }
}