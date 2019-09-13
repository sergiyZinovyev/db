import { Component, OnInit, OnDestroy} from '@angular/core';
import { UserService } from '../shared/user.service';
import { ServerService } from '../shared/server.service';
import { DbvisexService } from '../shared/dbvisex.service';
import { DbService} from '../shared/db.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import * as html2pdf from 'html2pdf.js';
import { timeoutWith } from 'rxjs/operators';



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
    private dbsisex: DbvisexService,
    private db: DbService,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.dbsisex.addVisEx();
    if(this.server.frontURL.searchParams.has('exhibreg')){
      //this.db.setNavDB('visexhib');
      this.router.navigate(['db']);
    }

    console.log('this.user.userLogData: ',this.user.userLogData);
    let get=this.server.post(this.user.userLogData, "get").subscribe(data =>{ //отримуємо нові дані з бази
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

  getPDFAndSend(){
    let element = document.getElementById('element-to-print'); 
    let opt = {
      margin:       0,
      filename:     'invite.pdf',
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    return html2pdf().set(opt).from(element).outputPdf('datauristring').then(data => {
      //console.log('PDFdata: ',data); 
      //this.invitePDF = data;
      this.sendEmail(data);
    });
  }
 
  // saveBlobAsPDF() {
  //   var msg=this.invitePDF;
  //   var blob = new File([msg], "hello2.pdf", {"type": "application/octet-stream"});
  //   var a: any = document.createElement("a");
  //   a.href = URL.createObjectURL(blob);
  
  //   window.location.href=a;
  // }  

  sendEmail(myData){
    if(!this.email){
      alert('Ви не вказали електронну пошту');
      console.log('no email!')}
    else{
      let isEmail = confirm("запрошення буде відправлено на email: " + this.email);
      if(isEmail){
        console.log('sending')
        //починаємо відправку
        //console.log('this.user.userLogData1: ', this.user.userLogData);
        let data = this.user.userLogData;
        data.file = myData;
        console.log('this.user.userLogData2: ', data);
        let get=this.server.post(data, "email").subscribe(data =>{
        //let get=this.server.post(data, "email").subscribe(data =>{ 
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
    return `../../img/${this.server.frontURL.searchParams.get('idex')}.png`
    //return `${this.server.apiUrl}/img/${this.server.frontURL.searchParams.get('exhib')}.png`
    //return this.sanitizer.bypassSecurityTrustUrl('data:application/octet-stream;base64,' + btoa(`${this.server.apiUrl}/img/${this.server.frontURL.searchParams.get('exhib')}.png`));
  }

  // test(){
  //     console.log(this.server.frontURL);
  //     console.log(this.server.frontURL.searchParams.get('exhib'));
  // }

  ngOnDestroy(){
    this.user.setUserLogData("");
    
  }
}