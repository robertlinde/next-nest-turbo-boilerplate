import {Module} from '@nestjs/common';
import {CryptoService} from './crypto.service.ts';

@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}
