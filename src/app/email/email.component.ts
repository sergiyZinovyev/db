import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { ServerService } from '../shared/server.service';
import { ModulesService } from '../shared/modules.service';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.css']
})
export class EmailComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private server: ServerService,
    private module: ModulesService
  ) { }

  attachmentsArray: {filename, path}[] = [];

  emailForm = this.fb.group({
    to: ['', [Validators.required]],
    from: ['send@galexpo.lviv.ua', [Validators.required]],
    subject: ['', [Validators.required]],
    attachments: ['', []],
    message: ['', []]
  })

  ngOnInit() {
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

  //отримати дані з файлу та повернути у вигляді DataURL  
  getDataFile(file){
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      if (!file){
        console.error("file not selected!");
        reject(reader.error.code);
      }
      reader.onload = () => {
          var contents = reader.result;
          //console.log("Вміст файла: \n" + contents);
          resolve(contents) ;
      };
      reader.onerror = () => {
          console.error("File could not be read!");
          reject(reader.error.code);
      };
    })
  }

  //додати файл до листа
  addFile(id){
    let file = this.module.getFile(id);
    this.getDataFile(file).then(
      data => {
        this.attachmentsArray.push({filename: file.name, path: data});
        //console.log('subscribe data: ', data);
        return this.emailForm.patchValue({attachments: this.attachmentsArray});
      },
      error => {
        alert("Rejected: " + error); // error - аргумент reject
      }
    )
  }

}
