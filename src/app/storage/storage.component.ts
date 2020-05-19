import { Component } from "@angular/core";
import { AmplifyService } from 'aws-amplify-angular';
import Amplify, { Storage } from 'aws-amplify';
import { Auth } from 'aws-amplify';
import { User } from '../User';
import { Router } from '@angular/router';

@Component({
    selector: 'storage-component',
    templateUrl: 'storage.component.html',
    styleUrls: ['storage.component.css']
})

export class StorageComponent {
    user = new User('', '', '', '', '', '');
    userId: string;
    userName: string;
    imagePath: string;
    showPhoto: boolean;
    userCreated: boolean;
    email: any;
    route: Router;
    isUpdated: boolean = false;
    constructor(private amplifyService: AmplifyService, route: Router) {
        this.amplifyService = amplifyService
        this.route = route
    }

    fileToUpload: File;
    handleFileInput(files: FileList) {
        this.fileToUpload = files.item(0);
        Storage.put('test.pdf', this.fileToUpload, { level: 'private' })
            .then(result => console.log(result)) // {key: "test.txt"}
            .catch(err => console.log(err));
    }

    ngOnInit() {
        this.showPhoto = false;
        Auth.currentAuthenticatedUser({
            bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
        }).then(async (user) => {
            console.log(user)
            this.userName = user.username;
            this.userId = user.attributes.sub;
            this.email = user.attributes.email;
            let result: any = await Storage.get(`${this.userId}.json`, { level: 'private', download: true });
            if (!result) {
                this.userCreated = false;
                this.user = new User(
                    ``,
                    ``,
                    ``,
                    ``,
                    ``,
                    ``
                )
            } else {
                result = result.Body;
                this.userCreated = true;
                this.showPhoto = !!result.image;
                this.user = new User(
                    this.userId,
                    result.username,
                    result.firstName,
                    result.lastName,
                    result.bio,
                    result.image
                )

                console.log(this.user)
            }
        }).catch(err => console.log(err));
    }

    getType(): string {
        return this.userCreated ? 'UpdateUser' : 'CreateUser';
    }

    async onImageUploaded(e) {
        this.user.imageUrl = e.key;
        this.showPhoto = true;
    }

    onAlbumImageSelected(event) {
        window.open(event, '_blank');
    }

    async updateProfile() {
        console.log(this.user)
        const user = {
            id: this.userId,
            username: this.user.firstName + '_' + this.user.lastName,
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            bio: this.user.bio,
            image: this.user.imageUrl
        }

        Storage.put(`${this.userId}.json`, user, { level: 'private' })
            .then(result => {
                this.isUpdated = true;
            }) // {key: "test.txt"}
            .catch(err => console.log(err));
    }
}