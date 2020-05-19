import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

@Component({
    selector: 'app-user-authentication',
    template: `
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h1 style="color: white">Seu usuario foi registrado com sucesso!</h1>
            </div>
        </div>
    </div>
    `,
    styleUrls: ['./user-authentication.component.css']
})

export class UserRegisteredComponent {
    usernameAttributes = "email";
    confirmSignUp: boolean;
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
    user: any;

    constructor(private route: Router, private fb: FormBuilder) {

    }
}