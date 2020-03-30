import { Component, OnInit } from '@angular/core';
import { Auth } from 'aws-amplify';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AmplifyService } from 'aws-amplify-angular';

@Component({
  selector: 'app-user-authentication',
  templateUrl: './user-authentication.component.html',
  styleUrls: ['./user-authentication.component.css']
})

export class UserAuthenticationComponent {
  usernameAttributes = "email";
  signUpConfig = {
    header: 'Criar Conta',
    hideAllDefaults: true,
    defaultCountryCode: '1',
    signUpFields: [
      {
        label: 'Email',
        key: 'email',
        required: true,
        displayOrder: 1,
        type: 'string',
      },
      {
        label: 'Password',
        key: 'password',
        required: true,
        displayOrder: 2,
        type: 'password'
      },
      {
        label: 'Phone Number',
        key: 'phone_number',
        required: true,
        displayOrder: 3,
        type: 'string'
      }
    ]
  }

  constructor(private route: Router, private fb: FormBuilder, private amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;

    this.amplifyService.authStateChange$
      .subscribe(authState => {
        if (authState.state === 'signedIn') {
          this.route.navigate(['/dashboard']);
        }
      });
  }
}