export interface IFindContactsFilters {
  createdBy?: string;
  assignedTo?: string;
  search?: string; // ricerca per nome, cognome o email
  page?: number; // numero pagina per paginazione
  limit?: number; // dimensione pagina
  deleted?: boolean; // includi contatti eliminati
}