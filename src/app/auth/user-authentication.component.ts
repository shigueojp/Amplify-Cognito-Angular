import { Component, OnInit } from '@angular/core';
import { AmplifyService } from 'aws-amplify-angular';
import { CognitoUser } from '@aws-amplify/auth';
import { Subject, Observable } from 'rxjs';
import { Hub } from 'aws-amplify';
import { Auth } from 'aws-amplify';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-authentication',
  templateUrl: './user-authentication.component.html',
  styleUrls: ['./user-authentication.component.css']
})

export class UserAuthenticationComponent implements OnInit {
  signedIn;
  user;

  private _authState: Subject<CognitoUser | any> = new Subject<CognitoUser | any>();
  authState: Observable<CognitoUser | any> = this._authState.asObservable();
  router: Router;

  constructor(private amplifyService: AmplifyService, router: Router) {
    this.amplifyService = amplifyService;
    this.router = router;
    this.amplifyService.authStateChange$
      .subscribe(authState => {
        if (authState.state === 'signedIn') {
          this.router.navigate(['/dashboard']);
        }
      });
  }

  ngOnInit(): void {
  }
}