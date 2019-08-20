import { Component, OnInit, OnDestroy} from '@angular/core';
import { UserService } from '../shared/user.service';
import { ServerService } from '../shared/server.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import * as html2pdf from 'html2pdf.js';



@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.css']
})
export class InviteComponent implements OnInit, OnDestroy{

  //html2pdf: any;

  //myUrl = 'http://localhost:7001/img/bud.png';
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
    private sanitizer: DomSanitizer,
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

  getPDFTest(){
    let element = '<p>Збережіть це запрошення або відправте собі на електронну пошу або просто покажіть на екрані вашого смартфону</p>';
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

  getImg(){
    return `url(${this.server.frontURL.searchParams.get('exhib')}.png)`
    //return `${this.server.apiUrl}/img/${this.server.frontURL.searchParams.get('exhib')}.png`
    //return this.sanitizer.bypassSecurityTrustUrl('data:application/octet-stream;base64,' + btoa(`${this.server.apiUrl}/img/${this.server.frontURL.searchParams.get('exhib')}.png`));
  }

  test(){
      console.log(this.server.frontURL);
      console.log(this.server.frontURL.searchParams.get('exhib'));
  }

  ngOnDestroy(){
    this.user.setUserLogData("");
    
  }
}