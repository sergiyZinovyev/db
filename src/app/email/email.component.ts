import { Component, OnInit, OnDestroy} from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { ServerService } from '../shared/server.service';
import { ModulesService } from '../shared/modules.service';
import { MailService } from '../shared/mail.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface IUser {
  id?: number;
  regnum: number; 
  is_send?: string; 
  mail_list_id?: number; 
  date?: string;
  email: string;
  namepovne: string;
}

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
  ) { }

  attachmentsArray: {filename, path, size}[] = [];

  emailForm = this.fb.group({
    to: ['', [Validators.required]],
    sendList: ['', [Validators.required]],
    from: ['send@galexpo.lviv.ua', [Validators.required]],
    subject: ['', [Validators.required]],
    attachments: ['', []],
    message: ['', []]
  })

  subSendList;

  ngOnInit() {
    this.subSendList = this.mail.getCurrentSendList().pipe(
      map((vl: any, i) => {
        //console.log('Index', i);
        return Array.from(vl)
      })
    ).subscribe((data: IUser[]) =>{
      this.emailForm.patchValue({to: data.map(el => el.email).join('; ')}); 
      this.emailForm.patchValue({sendList: data});
    })
  }

  send(){
    if(this.emailForm.valid){
      let isEmail = confirm('Ви впевнені, що хочете розпочати масову розсилку?');
      if(isEmail){
        console.log('emailForm: ',this.emailForm.value);
        // надсилаємо лист
        let get=this.server.post(this.emailForm.value, "massMaling").subscribe(data =>{
          console.log("sending data: ", data);
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
  addFile(id){
    let file = this.module.getFile(id);
    this.module.getDataFile(file, 'readAsDataURL').then(
      data => {
        this.attachmentsArray.push({filename: file.name, path: data, size: file.size}); 
        //console.log('subscribe data: ', data);
        return this.emailForm.patchValue({attachments: this.attachmentsArray});
      },
      error => {
        alert("Rejected: " + error); // error - аргумент reject   
      }
    )
  }

  deleteFileFromMessage(index){
    this.attachmentsArray.splice(index, 1);
  }

  addHtml(id){
    let file = this.module.getFile(id);
    this.module.getDataFile(file, 'readAsText').then(
      data => {
        return this.emailForm.patchValue({message: data});
      },
      error => {
        alert("Rejected: " + error); // error - аргумент reject    
      }
    )
  }

  ngOnDestroy(){
    this.subSendList.unsubscribe();
  }

}
