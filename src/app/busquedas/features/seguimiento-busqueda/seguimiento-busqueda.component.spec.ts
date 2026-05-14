import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguimientoBusquedaComponent } from './seguimiento-busqueda.component';

describe('SeguimientoBusquedaComponent', () => {
  let component: SeguimientoBusquedaComponent;
  let fixture: ComponentFixture<SeguimientoBusquedaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeguimientoBusquedaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeguimientoBusquedaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
