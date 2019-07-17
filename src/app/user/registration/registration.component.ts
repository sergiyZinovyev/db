import { Component, OnInit, OnDestroy} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../shared/user.service';
import { ServerService } from '../../shared/server.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit, OnDestroy {

  submitButtonText: string = '';
  createText: string = "Додати новий запис та отримати запрошення";
  editText: string = "Редагувати дані та отримати запрошення";
  edit: boolean = false;
  editData

  constructor(
    private fb: FormBuilder,
    private user: UserService,
    private server: ServerService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.submitButtonText = this.createText;
    this.user.userData.subscribe({
      next: (value) => {
        this.loginForm = this.fb.group({
          email: [value[0].email, [Validators.email, Validators.required]],
          prizv: [value[0].prizv, [Validators.required]],
          city: [value[0].city, [Validators.required]],
          cellphone: [value[0].cellphone, [Validators.required]],
          regnum: [value[0].regnum, []],
        })
        this.edit = true;
        this.submitButtonText = this.editText;
        this.editData = value[0];
      }
    })
  }

  loginForm = this.fb.group({
    email: [this.user.getUserEmail(), [Validators.email, Validators.required]],
    prizv: ['', [Validators.required]],
    city: ['', [Validators.required]],
    cellphone: ['', [Validators.required]],
    regnum: ['', []],
  })

  addUser() {
    let post = this.server.post(this.loginForm.value, "create").subscribe(data =>{
      console.log("data: ", data);
      if(data){
        this.router.navigate(['invite'])
        console.log("unsubscribe")
        return post.unsubscribe();
      }
    });
  }

  editUser(){
    let post = this.server.post(this.loginForm.value, "edit").subscribe(data =>{
      console.log("data: ", data);
      if(data){
        this.router.navigate(['invite'])
        console.log("unsubscribe")
        return post.unsubscribe();
      }
    });
  }

  submit(){
    if(this.loginForm.valid){
      if(this.edit){
        this.editUser();
      }
      else{this.addUser()}
    }
  }

  invite(){
    this.router.navigate(['invite'])
  }

  get(){
    let get=this.server.get().subscribe(data =>{
      console.log("data: ", data);
      if(data){
        console.log("unsubscribe")
        return get.unsubscribe();
      }
    });
  }

  ngOnDestroy(){
    this.user.setUserEmail('');
  }

}
