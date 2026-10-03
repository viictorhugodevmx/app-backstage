import { Test } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  it('devuelve el estado del servicio', async () => {
    const module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    try {
      const controller = module.get(AppController);

      expect(controller.getHealth()).toEqual({
        status: 'ok',
        service: 'backstage-api',
      });
    } finally {
      await module.close();
    }
  });
});
