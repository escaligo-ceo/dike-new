export interface IBirthPlace {
  country: string;        // ISO 3166-1, es. 'IT' per Italia
  cadastralCode: string;  // codice catastale del comune (obbligatorio se country = 'IT')
  city: string;   // nome del comune, per leggibilità utente
  state: string;          // sigla provincia, per leggibilità utente
}
