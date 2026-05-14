import { TestBed } from '@angular/core/testing';

import { ServicioPruebaService } from '../servicios/servicio-prueba.service';

describe('ServicioPruebaService', () => {
  let service: ServicioPruebaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicioPruebaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
