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
  invitePDF: BinaryType;

  constructor(
    private user: UserService,
    private server: ServerService,
    private router: Router,
  ) { }

  ngOnInit() {
    console.log('this.user.userLogData: ',this.user.userLogData);
    let get=this.server.post(this.user.userLogData, "get/regnum").subscribe(data =>{ //отримуємо нові дані з бази
      console.log("data: ", data);
      if (data == null){
        console.log("unsubscribe")
        return get.unsubscribe();
      }
      if(data[0]){
      this.user.setUserLogData(data[0]);
      this.email = data[0].email;
      this.prizv = data[0].prizv;
      this.name = data[0].name;
      this.pobatkovi = data[0].pobatkovi;
      this.regnum = data[0].regnum;
      }
      if(data){
        console.log("unsubscribe")
        return get.unsubscribe();
      }
    });
  }

  onLogin(){
    this.router.navigate(['user/login'])
  }

  onRegestration(){
    this.router.navigate(['user/registration'])
  }

  getPDF(){
    let element = document.getElementById('element-to-print');
    let opt = {
      margin:       0,
      filename:     'invite.pdf',
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    return html2pdf().set(opt).from(element).save();
  }

  sendEmail(){
    if(!this.email){
      alert('Ви не вказали електронну пошту');
      console.log('no email!')}
    else{
      let isEmail = confirm("запрошення буде відправлено на email: " + this.email);
      if(isEmail){
        console.log('sending')
        //починаємо відправку
        console.log(this.user.userLogData);
        let get=this.server.post(this.user.userLogData, "email").subscribe(data =>{ 
          console.log("sending data: ", data);
          if(data){
            console.log("unsubscribe")
            return get.unsubscribe();
          }
        });

      }
      else{ console.log('cancel')}
    }
    
  }

  test(){
    console.log(this.invitePDF);
  }

  ngOnDestroy(){
    this.user.setUserLogData("");
    
  }
}