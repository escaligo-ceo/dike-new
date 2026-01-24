export interface CreateContactFromImportDto {
  tenantId: string;
  ownerId: string;

  contact: {
    roles?: Array<'CLIENT' | 'COUNTERPART' | 'LAWYER' | 'JUDGE' | 'OTHER'>;
    firstName: string;
    middleName?: string;
    lastName: string;
    prefix?: string;
    suffix?: string;
    phoneticFirstName?: string;
    phoneticLastName?: string;
    fullName: string;
    photoUrl?: string;
    nickname?: string;
    birthday?: string;
    anniversary?: string;
    typeId?: string;
    customType?: string;
    notes?: string;
    labels?: string[];
    type: string;
    company?: {
      name: string;
      department?: string;
      title?: string;
      industry?: string;
      address?: {
        street?: string;
        city?: string;
        zip?: string;
        country?: string;
      };
    };

    phones?: Array<{
      type: 'MOBILE' | 'WORK' | 'HOME' | 'FAX' | 'IM' | 'OTHER';
      number: string;
      label?: string;
    }>;

    websites?: Array<{
      url: string;
      label?: string;
    }>;

    emails?: Array<{
      type: 'HOME' | 'WORK' | 'OTHER';
      email: string;
      label?: string;
    }>;

    addresses?: Array<{
      type: 'HOME' | 'WORK';
      street: string;
      city: string;
      zip?: string;
      country?: string;
      formatted?: string;
      label?: string;
    }>;
  };
}
