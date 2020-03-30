import { Component, OnInit } from '@angular/core';
import { Auth } from 'aws-amplify';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-user-authentication',
  templateUrl: './user-authentication.component.html',
  styleUrls: ['./user-authentication.component.css']
})

export class UserAuthenticationComponent implements OnInit {
  public signInForm: FormGroup;
  success: boolean
  signstatus: string = 'signin'
  toVerifyEmail: boolean = false;
  userName: string;
  loading = false;

  constructor(private route: Router, private fb: FormBuilder) { }

  ngOnInit() {
    const email = new FormControl();
    const password = new FormControl();

    this.signInForm = new FormGroup({
      email: email,
      password: password,
    })
  }

  onSignUpHandle(value: any) {
    console.log(value)
    const email = value.email, password = value.password;
    Auth.signUp(email, password).then(_ => {
      this.success = true;
    }).catch(console.log);
  }

  onSignIn() {
    this.signstatus = 'signin';
  }

  singUpToAWS(email: HTMLInputElement, contactNo: HTMLInputElement, username: HTMLInputElement, password: HTMLInputElement) {

    this.userName = username.value;

    const user = {
      username: username.value,
      password: password.value,
      attributes: {
        email: email.value,          // optional
        phone_number: contactNo.value,   // optional - E.164 number convention
        // other custom attributes 
      }
    }


    Auth.signUp(user)
      .then(data => {
        console.log(data);
        this.toVerifyEmail = true;
        this.signstatus = "";
      })
      .catch(err => console.log(err));

    // Auth.resendSignUp(username).then(() => {
    //     console.log('code resent successfully');
    // }).catch(e => {
    //     console.log(e);
    // });

  }

  onVerify(verifycode: HTMLInputElement) {
    // After retrieving the confirmation code from the user
    Auth.confirmSignUp(this.userName, verifycode.value, {
      // Optional. Force user confirmation irrespective of existing alias. By default set to True.
      forceAliasCreation: true
    }).then(data => {
      console.log(data)
      this.toVerifyEmail = false;
      this.signstatus = 'signin'
    })
      .catch(err => console.log(err));
  }

  signInToAWS(value: any) {
    this.loading = true;
    const authInfo = {
      username: value.email,
      password: value.password
    }

    Auth.signIn(authInfo).then(user => {
      this.route.navigate(['/dashboard'])
    })
      .catch(err => console.log(err));

  }


}