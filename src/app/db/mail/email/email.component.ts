import { Component, OnInit, OnDestroy} from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { ServerService } from '../../../shared/server.service';
import { ModulesService } from '../../../shared/modules.service';
import { MailService } from '../../../shared/mail.service';
import { map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { DomSanitizer, SafeResourceUrl, SafeUrl, SafeHtml} from '@angular/platform-browser';
import {IUser, IMailig, IMessage, Ifiles} from '../mailInterface';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.css']
})

export class EmailComponent implements OnInit, OnDestroy{

  constructor(
    private fb: FormBuilder,
    private server: ServerService,
    private module: ModulesService,
    private mail: MailService,
    private sanitizer: DomSanitizer, 
  ) { }

  subMessage: Subscription;
  subSendList: Subscription;
  htmlTextData: SafeHtml;
  attachmentsArray: Ifiles[] = [];
  bodyFilesArray: Ifiles[]= [];

  emailForm = this.fb.group({
    to: ['', [Validators.required]],
    sendList: ['', [Validators.required]],
    from: ['send@galexpo.lviv.ua', [Validators.required]],
    subject: ['', [Validators.required]],
    attach: ['', []],
    body_files: ['', []],
    message: ['', []],
    messageID: [this.mail.messageID, []],
    changed: [false, [Validators.required]]
  })

  ngOnInit() {
    console.log('new message is open')
    this.subSendList = this.mail.getCurrentSendList.pipe(
      map((vl: any, i) => {
        //console.log('Index', i);
        return Array.from(vl)
      })
    ).subscribe((data: IUser[]) =>{
      //console.log('data from getCurrentSendList', data);
      this.emailForm.patchValue({to: data.map(el => el.email).join('; ')}); 
      this.emailForm.patchValue({sendList: data});
    })

    this.subMessage = this.mail.getMessage.subscribe((data: IMessage)  => {
      //console.log('data from getMessage: ', data);
      this.emailForm.patchValue({subject: data.subject});
      this.emailForm.patchValue({attach: data.attachments});
      this.emailForm.patchValue({body_files: data.body_files});
      this.emailForm.patchValue({message: data.message});
      this.emailForm.patchValue({messageID: data.id});
      this.emailForm.patchValue({changed: false}); //позначаємо лист як не змінений

      this.bodyFilesArray = this.getFileArrFromServer(data.body_files);
      this.attachmentsArray = this.getFileArrFromServer(data.attachments);
    })

    this.emailForm.get('message').valueChanges.subscribe((v: string) => {
      this.htmlTextData = this.sanitizer.bypassSecurityTrustHtml(v);
     });
  }

  send(){
    if(this.emailForm.valid){
      if(this.emailForm.get('message').dirty || this.emailForm.get('subject').dirty) this.emailForm.patchValue({changed: true}); //позначаємо лист як змінений
      //return console.log('emailForm: ',this.emailForm.value);
      let isEmail = confirm('Ви впевнені, що хочете розпочати масову розсилку?');
      if(isEmail){
        console.log('emailForm: ',this.emailForm.value);
        // надсилаємо лист
        let get=this.server.post(this.emailForm.value, "massMaling").subscribe(data =>{
          console.log("sending data: ", data);
          // перевіряємо права користувача, видаємо повідомлення, якщо немає прав 
          if(data[0] && this.server.accessIsDenied(data[0].rights)) return get.unsubscribe();
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
          this.mail.setMessageID(data.id);
          this.emailForm.patchValue({messageID: data.id});
          let newMessage = this.replaceSrc(this.emailForm.get('message').value, file.name, newLink);
          this.emailForm.patchValue({message: newMessage});
          this[fileArr].push({
            filename: file.name, 
            path: data, 
            size: file.size,
            href: newLink
          }); 
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
        this.emailForm.patchValue({changed: true}); //позначаємо лист як змінений
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
    let sendingData = this.emailForm.value;
    console.log("sendingData: ", sendingData);
    let get=this.server.post(sendingData, 'saveMessage').subscribe((data:{id}) =>{
      console.log("res data: ", data);
      // перевіряємо права користувача, видаємо повідомлення, якщо немає прав 
      if(data[0] && this.server.accessIsDenied(data[0].rights)) return get.unsubscribe();
      if(data){
        this.mail.setMessageID(data.id);
        this.emailForm.patchValue({messageID: data.id});
        
        console.log("unsubscribe")
        return get.unsubscribe();
      }
    });
  }

  replaceSrc(str: string, fileName: string, newSrc: string):string{
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
      newFile.push(newObj)
    });
    //console.log('getFileArrFromServer: ', newFile);
    return newFile
  }



  ngOnDestroy(){
    console.log('new message will be closed');
    this.subSendList.unsubscribe();
    this.subMessage.unsubscribe();
  }

}
