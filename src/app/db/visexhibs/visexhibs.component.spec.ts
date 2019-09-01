import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisexhibsComponent } from './visexhibs.component';

describe('VisexhibsComponent', () => {
  let component: VisexhibsComponent;
  let fixture: ComponentFixture<VisexhibsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisexhibsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisexhibsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
