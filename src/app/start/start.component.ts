import { Component, OnInit } from '@angular/core';
import { ServerService } from '../shared/server.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit {

  constructor(
    private server: ServerService,
    private router: Router
  ) { }

  ngOnInit() {
    console.log('window.location: ',window.location);

    this.server.setFrontURL(window.location);
    this.getCurrURL()
  }

  getCurrURL(){
    console.log(this.server.frontURL);
    console.log(this.server.frontURL.searchParams.get('exhib'));
    if (this.server.frontURL.searchParams.get('exhib') == null){ 
      return this.router.navigate(['auth']);
    }
    else{
      return this.router.navigate(['user/login']); 
    }
  }

  
}
