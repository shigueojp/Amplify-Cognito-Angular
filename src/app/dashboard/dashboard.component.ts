import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Auth } from "aws-amplify";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent implements OnInit {
  user: any;

  constructor(private router: Router) { }

  ngOnInit() {
    Auth.currentAuthenticatedUser({
      bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
    }).then(user => this.user = user)
      .catch(err => console.log(err));
  }

  onLogOut() {
    Auth.signOut()
      .then(data => {
        console.log(data);
        console.log("You are successfully logged out");
        this.router.navigate(["/login"]);
      })
      .catch(err => console.log(err));
  }
}