import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppLogger } from '../app/logger.js';
import { HttpServiceExceptionFilter } from '../filters/http-service-exception.filter.js';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useFactory: (logger: AppLogger) => new HttpServiceExceptionFilter(logger),
      inject: [AppLogger],
    },
  ],
})
export class GlobalFiltersModule {}

// Oppure per registrarlo nell'AppModule esistente:
// 
// @Module({
//   imports: [
//     // ... altri imports
//   ],
//   providers: [
//     // ... altri providers
//     {
//       provide: APP_FILTER,
//       useFactory: (logger: AppLogger) => new HttpServiceExceptionFilter(logger),
//       inject: [AppLogger],
//     },
//   ],
// })
// export class AppModule {}
