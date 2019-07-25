import {Component, OnInit, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { Router } from '@angular/router';
import { ServerService } from '../../../shared/server.service';
import {animate, state, style, transition, trigger} from '@angular/animations';


@Component({
  selector: 'app-visitor',
  templateUrl: './visitor.component.html',
  styleUrls: ['./visitor.component.css']
})
export class VisitorComponent implements OnInit {

  @Input() element: any;

  

  constructor(
    private server: ServerService,
    private router: Router,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    console.log(this.element);
    this.loginForm = this.fb.group({
      email: [this.element.email, [Validators.email, Validators.required]],
      prizv: [this.element.prizv, [Validators.required]],
      city: [this.element.city, [Validators.required]],
      cellphone: [this.element.cellphone, [Validators.required]],
      regnum: [this.element.regnum, []],
    })
  }

  loginForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    prizv: ['', [Validators.required]],
    city: ['', [Validators.required]],
    cellphone: ['', [Validators.required]],
    regnum: ['', []],
  })

  submit(){}

}
