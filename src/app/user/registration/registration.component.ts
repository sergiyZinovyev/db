import { Component, OnInit, Injectable} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../shared/user.service';
import { ServerService } from '../../shared/server.service';



@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  edit: boolean = false;
  editData

  constructor(
    private fb: FormBuilder,
    private user: UserService,
    private server: ServerService,
  ) { }

  ngOnInit() {
    this.user.userData.subscribe({
      next: (value) => {
        this.loginForm = this.fb.group({
          email: [value[0].email, [Validators.email, Validators.required]],
          prizv: [value[0].prizv, [Validators.required]],
          city: [value[0].city, [Validators.required]],
          cellphone: [value[0].cellphone, [Validators.required]],
        })
        this.edit = true;
        this.editData = value[0];
      }
    })
  }

  loginForm = this.fb.group({
    email: [this.user.getUserEmail(), [Validators.email, Validators.required]],
    prizv: ['', [Validators.required]],
    city: ['', [Validators.required]],
    cellphone: ['', [Validators.required]],
  })

  addUser() {
    if(this.loginForm.valid){ 
      let post = this.server.create(this.loginForm.value).subscribe(data =>{
        console.log("data: ", data);
        if(data){
          console.log("unsubscribe")
          return post.unsubscribe();
        }
      });
    }
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

}
