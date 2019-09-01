import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from './../shared/db.service';

@Component({
  selector: 'app-db',
  templateUrl: './db.component.html',
  styleUrls: ['./db.component.css']
})
export class DbComponent implements OnInit {

  nav = this.db.navDB;
  user = localStorage.getItem('user');

  constructor(
    private router: Router,
    private db: DbService,
  ) { }

  ngOnInit() {
  }

  getItemMenu(item){
    this.db.setNavDB(item);
  }

  exit(){
    localStorage.clear();
    this.router.navigate(['auth']);
  }
  

}
