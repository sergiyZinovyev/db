import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlahtyComponent } from './plahty.component';

describe('PlahtyComponent', () => {
  let component: PlahtyComponent;
  let fixture: ComponentFixture<PlahtyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlahtyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlahtyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
