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

  // loginFormData = {
  //   email: "",
  //   prizv: "",
  //   city: "",
  //   cellphone: ""
  // };
  
  //loginFormEmail: string = '';
  

  constructor(
    private fb: FormBuilder,
    private user: UserService,
    private server: ServerService,
  ) { }

  ngOnInit() {
    this.user.userEmail.subscribe({
      next: value => {
        console.log('email: ',value);
        this.loginForm = this.fb.group({
          email: [value, [Validators.email, Validators.required]],
          prizv: ['', [Validators.required]],
          city: ['', [Validators.required]],
          cellphone: ['', [Validators.required]],
        })
      }
    })

    this.user.userData.subscribe({
      next: (value) => {
        console.log('value:',value[0]);
        this.loginForm = this.fb.group({
          email: [value[0].email, [Validators.email, Validators.required]],
          prizv: [value[0].prizv, [Validators.required]],
          city: [value[0].city, [Validators.required]],
          cellphone: [value[0].cellphone, [Validators.required]],
        })
      }
    })
  }

  loginForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    prizv: ['', [Validators.required]],
    city: ['', [Validators.required]],
    cellphone: ['', [Validators.required]],
  })

  login() {
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
