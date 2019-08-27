import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ServerService } from '../shared/server.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  constructor(
    private router: Router,
    private server: ServerService
  ) { }


  loginUser(user, cb) {
    localStorage.setItem('login', 'false');
    localStorage.setItem('user', '');
    localStorage.setItem('id', '');
    localStorage.setItem('access rights', '');
    //this.errorMessage = ''; 
    let get=this.server.post(user, "db/users").subscribe(data =>{
      console.log("data login_user: ", data);
      if(data[0].login == 'true' && data[0].password == 'true'){
        localStorage.setItem('login', 'true');
        localStorage.setItem('user', user.login);
        localStorage.setItem('password', user.password);
        localStorage.setItem('id', data[1].id);
        localStorage.setItem('access rights', data[1].accessRights);
        this.router.navigate(['db/visitors']);
      }
      else if(data[0].login == 'true' && data[0].password == 'false'){
        console.log('wrong pwd');
        localStorage.setItem('login', 'false');
        cb('неправельний пароль'); 
      }
      else{
        console.log('wrong login');
        localStorage.setItem('login', 'false');
        cb('неправельний логін');
      }

      console.log("unsubscribe")
      return get.unsubscribe();
    });

  }


  // loginUser(user) {
  //   localStorage.setItem('login', 'false');
  //   localStorage.setItem('user', '');
  //   localStorage.setItem('id', '');
  //   localStorage.setItem('access rights', '');
  //   this.errorMessage = ''; 
  //   let get=this.server.post(user, "db/users").subscribe(data =>{
  //     console.log("data login_user: ", data);
  //     if(data[0].login == 'true' && data[0].password == 'true'){
  //       localStorage.setItem('login', 'true');
  //       localStorage.setItem('user', user.login);
  //       localStorage.setItem('id', data[1].id);
  //       localStorage.setItem('access rights', data[1].accessRights);
  //       this.router.navigate(['db/visitors']);
  //     }
  //     else if(data[0].login == 'true' && data[0].password == 'false'){
  //       console.log('wrong pwd');
  //       localStorage.setItem('login', 'false');
  //       this.errorMessage = 'неправельний пароль'; 
  //     }
  //     else{
  //       console.log('wrong login');
  //       localStorage.setItem('login', 'false');
  //       this.errorMessage = 'неправельний логін';
  //     }

  //     console.log("unsubscribe")
  //     return get.unsubscribe();
  //   });

  // }
}


