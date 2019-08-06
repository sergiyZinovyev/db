import { Component, OnInit, OnDestroy} from '@angular/core';
import { UserService } from '../shared/user.service';
import { ServerService } from '../shared/server.service';
import { Router } from '@angular/router';
import * as html2pdf from 'html2pdf.js';



@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.css']
})
export class InviteComponent implements OnInit, OnDestroy{

  //html2pdf: any;
  bcFormat = 'CODE128'; //формат штрихкоду

  email:string = '';
  prizv:string = '';
  name:string = '';
  pobatkovi:string = '';
  regnum:string = '';


  constructor(
    private user: UserService,
    private server: ServerService,
    private router: Router,
    //private html2pdf: Html2pdf
  ) { }
  //"assets/js/html2pdf.bundle.js"
  // ngOnInit() {
  //   console.log('this.user.userLogData: ',this.user.userLogData);
  //   let get=this.server.post(this.user.userLogData, "get").subscribe(data =>{
  //     console.log("data: ", data);
  //     if(data[0]){
  //       this.user.setUserData(data);
  //       this.email = data[0].email;
  //       this.prizv = data[0].prizv;
  //       this.regnum = data[0].regnum;
  //     }
  //     if(data){
  //       console.log("unsubscribe")
  //       return get.unsubscribe();
  //     }
  //   });
  // }

  ngOnInit() {
    this.email = this.user.userLogData.email;
    this.prizv = this.user.userLogData.prizv;
    this.name = this.user.userLogData.name;
    this.pobatkovi = this.user.userLogData.pobatkovi;
    this.regnum = this.user.userLogData.regnum;
    //this.getTest();
  }

  onLogin(){
    this.router.navigate(['user/login'])
  }

  onRegestration(){
    this.router.navigate(['user/registration'])
  }

  getTest(){
    let element = document.getElementById('element-to-print');
    //html2pdf(element);
    let opt = {
      margin:       0,
      filename:     'invite.pdf',
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  }

  ngOnDestroy(){
    this.user.setUserLogData("");
    
  }
}