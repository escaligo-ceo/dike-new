import { Address, Company, Contact, ContactType, Email, Mapping, Phone, TaxIdentifier, Website } from "@dike/common";

// Import-service only needs Mapping; removing Contact avoids missing-relations errors.
export const entities = [Address, Website, Phone, Company, Contact, Email, ContactType, Mapping, TaxIdentifier];
