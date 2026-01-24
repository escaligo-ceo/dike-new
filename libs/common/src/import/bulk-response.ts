/**
 * Dettagli di un errore durante un'operazione bulk.
 *
 * index: posizione della riga nell'array di input
 * reason: motivo del fallimento (es. "Email già esistente")
 * row: (opzionale) payload originale utile per diagnosi
 */
export interface IBulkError<T> {
  /** Posizione della riga nell'array di input */
  index: number;
  /** Motivo del fallimento (es. "Email già esistente") */
  reason: string;
  /**
   * Payload originale della riga, utile per import-service.
   * Esempio: { firstName: string, lastName: string, [key: string]: any }
   */
  row?: T;
}

/**
 * Risposta di un'operazione bulk.
 *
 * total: numero totale di righe processate
 * created: numero di righe create con successo
 * failed: numero di righe fallite
 * errors: dettagli degli errori per le righe fallite
 */
export interface IBulkResponse<T> {
  /** Numero totale righe processate */
  total: number;
  /** Righe effettivamente salvate */
  created: number;
  /** Righe fallite durante l'importazione */
  failed: number;
  /** Dettagli degli errori */
  errors: IBulkError<T>[];
}
