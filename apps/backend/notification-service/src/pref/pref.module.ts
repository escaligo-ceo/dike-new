import { Module } from '@nestjs/common';
import { PrefService } from './pref.service';

@Module({
  providers: [PrefService]
})
export class PrefModule {}
