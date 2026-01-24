export function Analytics(category?: string, action?: string) {
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

      this.redis.lpush('queue:audit', JSON.stringify({ ...basePayload, action }))
        .catch(err => this.logger.error("Audit Fast-Track Error", err));
      
      // Eseguiamo il controller e restituiamo subito
      return await originalMethod.apply(this, args);
    };
    return descriptor;
  };
}