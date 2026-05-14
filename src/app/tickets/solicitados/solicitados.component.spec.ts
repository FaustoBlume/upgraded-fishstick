import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitadosComponent } from './solicitados.component';

describe('SolicitadosComponent', () => {
  let component: SolicitadosComponent;
  let fixture: ComponentFixture<SolicitadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
