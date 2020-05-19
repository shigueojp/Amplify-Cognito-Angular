import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Auth } from "aws-amplify";
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent implements OnInit {
  user: any;
  oldPassword
  password
  changePasswordForm: FormGroup

  constructor(private router: Router) { }

  ngOnInit() {

    Auth.currentAuthenticatedUser({
      bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
    }).then(user => {
      this.user = user
      console.log(user)
    }).catch(err => console.log(err));
  }

  onLogOut() {
    Auth.signOut()
      .then(data => {
        console.log(data);
        this.router.navigate(["/login"]);
      })
      .catch(err => console.log(err));
  }

  async changePassword(oldPassword, password) {
    const currentUser = await Auth.currentAuthenticatedUser()
    console.log(currentUser)
    console.log(password, oldPassword)
    var teste = await Auth.changePassword(
      currentUser,
      'oldPassword',
      'oldPassword')

    console.log(teste)
  }
}