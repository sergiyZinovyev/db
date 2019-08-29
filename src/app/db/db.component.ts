import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-db',
  templateUrl: './db.component.html',
  styleUrls: ['./db.component.css']
})
export class DbComponent implements OnInit {

  dashboard: boolean = true;
  visitors: boolean = false;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  getVisitors(){
    this.dashboard = false;
    this.visitors = true;
    //this.router.navigate(['db/visitors']);
  }

  getDashboars(){
    this.dashboard = true;
    this.visitors = false;
    //this.router.navigate(['db/visitors']);
  }


}
