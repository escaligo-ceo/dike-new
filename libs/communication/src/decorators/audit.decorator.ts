import { AuditAction, AuditCategory } from "../audit/audit.enum";

export function Audit(category: AuditCategory, action: AuditAction) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const ctx = { switchToHttp: () => ({ getRequest: () => args.find(a => a?.headers) }) }; 
      // In NestJS, se il decorator è sul controller, possiamo recuperare la Req
      const req = args.find(arg => arg?.headers) || (this as any).request; 
      
      const ip = req?.headers['x-forwarded-for'] || req?.ip || 'unknown';
      const ua = req?.headers['user-agent'] || 'unknown';
      const user = req?.user; // Assumendo che il Guard di Keycloak popoli req.user

      // Prepariamo i dati comuni (User, IP, Path, Payload censurato)
      const basePayload = {
        userId: req.user?.id,
        category,
        path: req.originalUrl,
        metadata: this.logger.censura(req.body),
        timestamp: new Date().toISOString()
      };

      // CASO 1: Azione Standard (es. DELETE, LOGOUT, UPDATE)
      // Non serve aspettare il risultato del controller!
      if (action !== AuditAction.CREATE) {
        this.redis.lpush('queue:audit', JSON.stringify({ ...basePayload, action }))
          .catch(err => this.logger.error("Audit Fast-Track Error", err));
        
        // Eseguiamo il controller e restituiamo subito
        return await originalMethod.apply(this, args);
      }

      // CASO 2: Azione Dinamica (Il tuo findOrCreate)
      // Qui dobbiamo aspettare per forza per essere precisi

      const result = await originalMethod.apply(this, args);

      try {
        // Qui decidiamo l'azione in base al pattern [data, created]
        let isNew = false;
        let finalAction: AuditAction = action;

        if (Array.isArray(result) && result.length >= 2 && typeof result[1] === 'boolean') {
          isNew = result[1];
          // Esempio: "USER" + "_CREATE" o "USER" + "_FIND"
          finalAction = isNew ? AuditAction.CREATE : AuditAction.FIND;
        }

        // Prepariamo il pacchetto per Redis
        const auditPayload = {
          userId: req.user?.id || 'anonymous',
          category,
          action: finalAction,
          // Usiamo la tua classe Logger per pulire l'entità (result[0] o tutto il result)
          metadata: this.logger.censura(Array.isArray(result) ? result[0] : result),
          timestamp: new Date().toISOString()
        };

        // --- 4. IL SALTO ASINCRONO (Fire and Forget) ---
        // NON usiamo 'await'. Sparamo il dato in coda e "ciao".
        // La connessione Redis (this.redis) deve essere già pronta.
        this.redis.lpush('queue:audit', JSON.stringify(auditPayload))
          .catch(err => {
            // Se Redis esplode, lo scriviamo solo nel log di sistema 
            // per non bloccare la risposta all'utente
            this.logger.error("Audit Queue Error:", err);
          });

        return result;

      } catch (auditError) {
        // Errore interno al decoratore: lo silenziamo per non rompere il controller
        // ma lo logghiamo per noi
        console.error("Critical Decorator Error:", auditError);
      }
    };
    return descriptor;
  };
}