import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisexhibComponent } from './visexhib.component';

describe('VisexhibComponent', () => {
  let component: VisexhibComponent;
  let fixture: ComponentFixture<VisexhibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisexhibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisexhibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
