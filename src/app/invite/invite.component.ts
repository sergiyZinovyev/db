import { Component, OnInit, OnDestroy} from '@angular/core';
import { UserService } from '../shared/user.service';
import { ServerService } from '../shared/server.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.css']
})
export class InviteComponent implements OnInit, OnDestroy {

  

  //inviteData = this.user.getInviteData();
  bcFormat = 'CODE128';

  email:string = '';
  prizv:string = '';
  regnum:string = '';


  constructor(
    private user: UserService,
    private server: ServerService,
    private router: Router,
  ) { }

  ngOnInit() {
    console.log('this.user.userLogData: ',this.user.userLogData);
    let get=this.server.post(this.user.userLogData, "get").subscribe(data =>{
      console.log("data: ", data);
      if(data[0]){
        this.user.setUserData(data);
        this.email = data[0].email;
        this.prizv = data[0].prizv;
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

  ngOnDestroy(){
    this.user.setUserLogData("");
    
  }
}