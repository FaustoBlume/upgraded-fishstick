import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateTicketComponent } from './template-ticket.component';

describe('TemplateTicketComponent', () => {
  let component: TemplateTicketComponent;
  let fixture: ComponentFixture<TemplateTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
