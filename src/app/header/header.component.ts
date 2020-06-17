import { Component, OnInit } from '@angular/core';
import { Auth } from 'aws-amplify';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  constructor(public router: Router) { }

  logout() {
    Auth.signOut()
      .then(data => {
        console.log("You are successfully logged out");
        this.router.navigate(["/login"]);
      })
      .catch(err => console.log(err));
  }

}
