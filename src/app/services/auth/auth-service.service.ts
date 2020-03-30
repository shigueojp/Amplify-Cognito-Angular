import { Injectable } from '@angular/core';
import { Auth } from "aws-amplify";

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  constructor() { }

  isUserAuthenticated() {
    Auth.currentAuthenticatedUser().then()
  }
}
