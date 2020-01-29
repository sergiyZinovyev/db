import { Component, OnInit, OnDestroy} from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { ServerService } from '../../../shared/server.service';
import { ModulesService } from '../../../shared/modules.service';
import { MailService } from '../../../shared/mail.service';
import { DbService } from '../../../shared/db.service';
import { map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { DomSanitizer, SafeResourceUrl, SafeUrl, SafeHtml} from '@angular/platform-browser';
import {IUser, IMessage, Ifiles} from '../mailInterface';
import { element } from 'protractor';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.css']
})

export class EmailComponent implements OnInit, OnDestroy{

  constructor(
    private fb: FormBuilder,
    private db: DbService,
    private server: ServerService,
    private module: ModulesService,
    private mail: MailService,
    private sanitizer: DomSanitizer, 
  ) { }

  subMessage: Subscription;
  //subSendList: Subscription; 
  htmlTextData: SafeHtml;
  
  attachmentsArray: Ifiles[] = [];
  bodyFilesArray: Ifiles[] = [];

  emailForm = this.fb.group({
    to: ['', [Validators.required]], //лише відображується в браузері
    sendList: ['', [Validators.required]], //те що реально використовується для розсилки
    from: ['send@galexpo.lviv.ua', [Validators.required]],
    subject: ['', [Validators.required]],
    attach: ['', []],
    body_files: ['', []],
    message: ['', []],
    messageID: ['', []],
    changed: [false, [Validators.required]] // визначає чи був змінений лист
  })


  ngOnInit() {
    console.log('new message is open');
    // підписуємось на розсилку
    // this.subSendList = this.mail.getCurrentSendList.pipe(
    //   map((vl: any, i) => {
    //     //console.log('Index', i);
    //     return Array.from(vl)
    //   })
    // ).subscribe((data: IUser[]) =>{
    //   //console.log('data from getCurrentSendList', data);
    //   this.emailForm.patchValue({to: data.map(el => el.email).join('; ')});  
    //   this.emailForm.patchValue({sendList: data});
    // })

    this.subMessage = this.mail.getMessage.subscribe((data: IMessage)  => {
      console.log('data from getMessage: ', data);
      this.emailForm.patchValue({subject: data.subject});
      this.emailForm.patchValue({attach: data.attachments});
      this.emailForm.patchValue({body_files: data.body_files});
      this.emailForm.patchValue({message: data.message});
      this.emailForm.patchValue({messageID: data.id});
      this.emailForm.patchValue({changed: data.changed});
      this.emailForm.patchValue({to: data.to});
      this.emailForm.patchValue({from: data.from});
      if(data.sendList){
        this.emailForm.patchValue({sendList: data.sendList.map(element => {
          return {regnum: element.regnum, email: element.email, namepovne: element.namepovne}
        })})
      }
      console.log('sendList: ',this.emailForm.get('sendList').value); 
      this.bodyFilesArray = this.getFileArrFromServer(data.body_files);
      this.attachmentsArray = this.getFileArrFromServer(data.attachments);

      if(data.message) this.htmlTextData = this.sanitizer.bypassSecurityTrustHtml(data.message);
      
    })

    this.emailForm.get('message').valueChanges.subscribe((v: string) => {
      this.htmlTextData = this.sanitizer.bypassSecurityTrustHtml(v);
      this.emailForm.patchValue({changed: true}); //позначаємо лист як змінений
    });
    this.emailForm.get('subject').valueChanges.subscribe((v: string) => {
      this.emailForm.patchValue({changed: true}); //позначаємо лист як змінений
    });
  }

  send(){
    if(this.emailForm.valid){
      let isEmail = confirm('Ви впевнені, що хочете розпочати масову розсилку?');
      if(isEmail){
        console.log('emailForm: ',this.emailForm.value);
        // надсилаємо лист;
        //this.mail.setMessage([{key: 'mailingStatus', val: 'sending'}]); //встановлюємо статус, відправка
        let get=this.server.post(this.emailForm.value, "massMaling").subscribe((data: any) =>{
          console.log("sending data: ", data);
          // перевіряємо права користувача, видаємо повідомлення, якщо немає прав 
          if(data[0] && this.server.accessIsDenied(data[0].rights)) return get.unsubscribe();
          //if(data.mailingId) this.mail.setCurrentMailing(data.mailingId);
          if(data){
            console.log("unsubscribe")
            return get.unsubscribe();
          }
        });
      }
    }
    else{
      alert("Ви не заповнили всі обов'язкові поля");
    }
  }

  //додати файл до листа 
  addFile(id, fileArr: string){
    let file = this.module.getFile(id);
    if(!this.checkFile(file.name, this[fileArr])){ return alert(`Файл з іменем ${file.name} вже існує`)}
    this.emailForm.patchValue({changed: true}); //позначаємо лист як змінений
    let sendingData = {
      attach: [],
      body_files: [],
      messageID: this.emailForm.get('messageID').value
    }
    let folder: 'attachments' | 'body_files';
    this.module.getDataFile(file, 'readAsDataURL').then(
      data => {
        if (fileArr == 'attachmentsArray'){
          sendingData.attach.push({filename: file.name, path: data, size: file.size});
          folder = 'attachments'
        }
        else if (fileArr == 'bodyFilesArray'){
          sendingData.body_files.push({filename: file.name, path: data, size: file.size});
          folder = 'body_files'
        }
        console.log("reqData: ", sendingData);
        let get=this.server.post(sendingData, 'saveMailFile').subscribe((data:{id, attachments, body_files}) =>{
          console.log("res data: ", data);
          // перевіряємо права користувача, видаємо повідомлення, якщо немає прав 
          if(data[0] && this.server.accessIsDenied(data[0].rights)) return get.unsubscribe();
          let newLink = `${this.server.apiUrl}/img/${file.name}?path=email_files/${data.id}/${folder}`;
          //this.mail.setMessageID(data.id);
          this.emailForm.patchValue({messageID: data.id});
          let newMessage = this.replaceSrc(this.emailForm.get('message').value, file.name, newLink);
          this.emailForm.patchValue({message: newMessage});
          if (data.attachments) this.emailForm.patchValue({attach: data.attachments});
          if (data.body_files) this.emailForm.patchValue({body_files: data.body_files});
          this[fileArr].push({
            filename: file.name, 
            path: data, 
            size: file.size,
            href: newLink
          });
          // if(data.id){
          //   this.mail.setCurrentMessage(data.id);
          // }
          if(data){
            console.log("unsubscribe")
            return get.unsubscribe();
          }
        });
      },
      error => {
        alert("Rejected: " + error); // error - аргумент reject   
      }
    )
  }

  deleteFileFromMessage(index, fileArr: string){
    this[fileArr].splice(index, 1);
  }

  addHtml(id){
    let file = this.module.getFile(id);
    this.module.getDataFile(file, 'readAsText').then(
      data => {
        //this.emailForm.patchValue({changed: true}); //позначаємо лист як змінений
        let newMessage = data;
        if(this.bodyFilesArray.length > 0){
          this.bodyFilesArray.forEach(element => {
            newMessage = this.replaceSrc(newMessage, element.filename, element.href);
          });
        }
        return this.emailForm.patchValue({message: newMessage});
      },
      error => {
        alert("Rejected: " + error); // error - аргумент reject    
      }
    ).then(()=> {
      console.log('messageID: ', this.emailForm.get('messageID').value);
    })
  }

  checkFile(fileName: string, fileArr: Ifiles[]): boolean{
    if(!this.module.findOdjInArrObj(fileArr, 'filename', fileName)) {
      return true
    }
    else {
      return false
    }
  }

  saveMessage(){
    //if(this.emailForm.get('message').dirty || this.emailForm.get('subject').dirty) this.emailForm.patchValue({changed: true}); //позначаємо лист як змінений
    let sendingData = this.emailForm.value;
    console.log("sendingData: ", sendingData);
    let get=this.server.post(sendingData, 'saveMessage').subscribe((data:any) =>{
      console.log("res data: ", data);
      // перевіряємо права користувача, видаємо повідомлення, якщо немає прав 
      if(data[0] && this.server.accessIsDenied(data[0].rights)) return get.unsubscribe();
      if(data.id){
        //this.mail.setMessageID(data.id);
        //this.emailForm.patchValue({messageID: data.id});
      }
      if(data.messageID){
        this.mail.setCurrentMessage(data.messageID);
      }
      console.log("unsubscribe")
      return get.unsubscribe();
    });
  }

  replaceSrc(str: string, fileName: string, newSrc: string):string{
    if (!str) return;
    const pattern = `["'][^"']*${fileName}[^"']*["']`;
    let VRegExp = new RegExp(pattern, 'g');
    return str.replace(VRegExp, `"${newSrc}"`);
  }

  getFileArrFromServer(filesString: string): Ifiles[]{
    //console.log('filesString1: ', filesString);
    let newFile: Ifiles[] = [];
    let newObj: Ifiles;
    if(!filesString) return newFile;
    filesString.split('; ').forEach(element => {
      let linkArr = element.split('/');
      let file = linkArr.pop()
      newObj = {
        filename: file,
        path: '',
        size: '',
        href: `${this.server.apiUrl}/img/${file}?path=${linkArr.slice(-3).join('/')}`
      }
      if(newObj.filename){newFile.push(newObj)} //додаємо лише тоді коли є файли в обєкті
    });
    console.log('getFileArrFromServer: ', newFile);
    return newFile
  }

  addEmail(){
    console.log('addEmail work!');
    this.db.setNavDB('visitors');
  }

  clearEmailList(){
    this.mail.clearCurrentSendList();
  }


  ngOnDestroy(){
    console.log('new message will be closed');
    this.subMessage.unsubscribe();

    //зберігаємо зміни в обєкт Message
    let arr = [
      {key: 'subject', val: this.emailForm.get('subject').value},
      {key: 'message', val: this.emailForm.get('message').value},
      {key: 'attachments', val: this.emailForm.get('attach').value},
      {key: 'body_files', val: this.emailForm.get('body_files').value},
      {key: 'id', val: this.emailForm.get('messageID').value},
      {key: 'changed', val: this.emailForm.get('changed').value}
    ]
    this.mail.setMessage(arr);
  }

}
