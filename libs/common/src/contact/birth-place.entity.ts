import { IBirthPlace } from '@dike/contracts';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('birth_places')
export class BirthPlace implements IBirthPlace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 2, name: "country", comment: "ISO 3166-1 country code" }) // example: 'IT' for Italy
  country?: string;

  @Column({ type: 'varchar', length: 4, name: "cadastral_code", comment: "Codice catastale del comune" }) // example: 'H501'
  cadastralCode?: string;

  @Column({ type: 'varchar', length: 100, name: "city", comment: "Comune di nascita" })
  city?: string;

  @Column({ type: 'varchar', length: 2, name: "state", comment: "Sigla provincia" })
  state?: string;
}
