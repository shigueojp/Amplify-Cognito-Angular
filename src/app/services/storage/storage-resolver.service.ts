// import { Injectable } from "@angular/core";
// import { Resolve } from '@angular/router';
// import { Storage } from 'aws-amplify';
// import { Subject } from 'rxjs';

// @Injectable()

// export class StorageResolverService implements Resolve {
//     resolve() {
//         return this.getStorage()
//     }

//     getStorage(file, conf) {
//         let subject = new Subject();
//         subject.next(Storage.get(file, conf))
//         subject.complete();

//         return subject
//     }
// }