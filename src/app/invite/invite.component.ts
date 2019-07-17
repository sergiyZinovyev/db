import { Component, OnInit, OnDestroy} from '@angular/core';
import { UserService } from '../shared/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.css']
})
export class InviteComponent implements OnInit {

  

  inviteData = this.user.getInviteData();


  email:string = this.inviteData.email;
  prizv:string = this.inviteData.prizv;
  regnum:string = this.inviteData.regnum;


  constructor(
    private user: UserService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

}
