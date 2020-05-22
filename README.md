##Nao mudar o nome do lambda, verificar isso#
##Aws Configure##


# Amplify Cross Account Using CodePipeline
 
This project was generated with:
 - [Angular CLI](https://github.com/angular/angular-cli) version 7.3.9.
 - [Amplify CLI](https://github.com/aws-amplify/amplify-cli) version 4.20.0.

The frontend is using Angular with amplify angular UI and themes. 

The backend is using Amplify with the following services:
- S3 as Storage.
- Cognito with custom confirmation link to register and confirm a new user (Lambda Trigger + S3VerificationBucket).
- S3 for hosting Angular Application.
  
Furthermore, it`s using cross account simulating two AWS accounts: developer and production.
- Developer AWS Account is related to dev/test branches.
- Production AWS Account is related to master branch.

## Diagram - Big Picture

![Alt Text](img/AmplifyBigPicture.png)

## What to do first to run this application

1. Install all the necessary tools:
   - Install [Node.JS](https://nodejs.org/en/download/).
   - Install [NPM](https://www.npmjs.com/get-npm).
   - Install [Amplify CLI](https://docs.amplify.aws/cli/start/install).
   - Install [AWS CLI](https://docs.aws.amazon.com/pt_br/cli/latest/userguide/cli-chap-install.html).

2. Fork|clone this repository.
    - For just development server, clone it.
    - For the CI/CD process, fork it.


## Setup AWS Profile

Create 2 IAM Users - one for developer AWS Account and another for Production AWS Account.

1. Run `amplify configure`.
2. Once you’re signed in, Amplify CLI will ask you to create an IAM user.
3. Create a user with `AdministratorAccess` to your account to provision AWS resources for you like AppSync, Cognito etc.
4. Once the user is created, Amplify CLI will ask you to provide the accessKeyId and the secretAccessKey to connect Amplify CLI with your newly created IAM user.

## Diagram - Amplify Environment
![Amplify Environment](img/AmplifyEnvironment.png)

In the next steps, we are going to create all the amplify resources from the diagram above for each branch.

### Creating Amplify Environment - Development

1. Run `npm install` to install all the packages needed.
2. Run `git checkout -b dev` to create the dev branch.
3. Run `amplify init` and specify a name for the new Amplify Dev Environment.
    - Amplify is going to request for an AWS Profile. (Choose the dev AWS profile or create a new one).
    ![Amplify00](img/amplify00.png)
    - In this example, `awsvscommit` profile references to Developer Account.

4. Run `amplify add auth` to add auth service. In order to use custom lambda trigger with cognito, follow the steps below:
    ![Amplify02](img/amplify02.png)

5. Run `amplify add storage` to add s3 storage.
![Amplify03](img/amplify03.png)
    - Choose `Content (Images, audio, video, etc.)`.
    - Provide a friendly name for your resource.
    - Provide a bucket name for your resource.
    - Grant permissions for your bucket.
    - Define if you want yo use lamda trigger for S3.
    

6. Run `amplify add hosting` to add hosting.
![Amplify04](img/amplify04.png)
    - Choose `Amazon CloudFront and S3`.
    - Choose `DEV (S3 only with HTTP)`.
    - Create a hosting bucket name.
    - Choose the index location file of your app.
    - Choose the error location file of your app.

7. Run `amplify status` to see all the amplify resources status.
    ![Amplify05](img/amplify05.png)

8. Run `amplify push` to push all the resources to the cloud.

9.  Go to lambda service in AWS Console, choose the lambda with suffix name `CustomMessage`.
    - Change lambda CustomMessage handler name to `verification-link.handler` and save it.
    ![Amplify10](img/amplify10.png)

10. Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

If it runs OK, the screen below should appear in your browser:
![Amplify15](img/amplify15.png)

11. Create a user, using the angular UI created by Amplify.
    - Check your email and confirm by clicking the url created by lambda.
    ![Amplify25](img/amplify25.png)
    - Make sure your bucket have the right access.

### Creating Amplify Environment - Test 

1. Run `git checkout -b test` to create test branch.
2. Run `git merge dev` to merge dev branch to test.
3. Run `amplify init` and use a new environment.
    - Enter a name of the new amplify environment
    - Amplify is going to request for an AWS Profile. - (Choose the developer AWS profile or create a new one).
    - Since it was merged with dev branch, amplify is going just to request:
        - Configure a Lambda Trigger for Cognito - (Answer `Y`).
        - Choose `Custom Message` option and press `Space` and `Enter`.
        - Choose `Send Account Confirmation Link With Redirect`. 
        - Enter your URL for your website.
        - Enter the subject for your custom account confirmation email.
        - Enter the body text for your custom account confirmation email.
4. Run `amplify push` to push all the resources to the cloud.
5. Go to lambda service in AWS Console, choose the lambda with suffix name `CustomMessage`.
    - Change lambda CustomMessage handler name to `verification-link.handler` and save it.
6. Run `amplify publish` to create the angular build and push to s3.
7. A link is going to the published. Click on it.
    - If it runs with success, the screen below should appear in your browser:
8. Create a user, using the angular UI created by Amplify.
    - Check your email and confirm by clicking the url created by lambda.
    - Make sure your bucket have the right access.

### Creating Amplify Environment - Production 

1. Change your branch to master and merge the dev branch.
    - Run `git checkout master`.
    - Run `git merge test`.
2. Run `amplify init` and use a new environment.
    - Enter a name of the new amplify environment - (I choose `prod`).
    - Amplify is going to request for an AWS Profile. - (Choose the Production AWS profile or create a new one).
        - In this example, `victor-from-dan-account-not-isengard` references to Production Account.
    - Since it was merged with test branch, amplify is going just to request:
        - Configure a Lambda Trigger for Cognito - (Answer `Y`).
        - Choose `Custom Message` option and press `Space` and `Enter`.
        - Choose `Send Account Confirmation Link With Redirect`. 
        - Enter your URL for your website.
        - Enter the subject for your custom account confirmation email.
        - Enter the body text for your custom account confirmation email.
        ![Amplify02](img/amplify02.png)
3. Run `amplify push` to push all the resources to the cloud.
4. Go to lambda service in AWS Console, choose the lambda with suffix name `CustomMessage`.
    - Change lambda CustomMessage handler name to `verification-link.handler` and save it.
    ![Amplify15](img/amplify10.png)
5. Run `amplify publish` to create the angular build and push to s3.
6. A link is going to the published. Click on it.
    - If it runs with success, the screen below should appear in your browser:
    ![Amplify35](img/amplify35.png)

7. Create a user, using the angular UI created by Amplify.
    - Check your email and confirm by clicking the url created by lambda.
    - Make sure your bucket have the right access.

## Diagram - Cross Account & CD
![AmplifyCrossAcc](img/AmplifyCrossAcc.png)

The next steps, it`s about the creation of the pipeline for continuous delivery and cross account setup.

### Pushing Golden Image to ECR 

1. Create a repository in the ECR.        
2. Inside the repository, click `view push commands` and follow the guideline.
3. Use this Dockerfile as reference to build and push your image.
4. Inside the repository, click `Permissions`, `Edit policy JSON` and add the code below to grant CodeDeploy the right permissions.

```
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Sid": "CodeDeploy",
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      },
      "Action": [
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchCheckLayerAvailability"
      ]
    }
  ]
}
```

### Creating SSM Parameter Store Keys/Values

**For developer/test environment:**

1. Store your IAM Access of your amplify profile using SSM Parameter Store via AWS CLI OR AWS Console.
    - Command using CLI with SecureString: `aws ssm put-parameter --name "someCoolName" --type "SecureString" --value "Password123$"`
    - Do not forget to use `SecureString` to leverage best security practices.
2. Store your Amplify Environment name for development.
    - You can always check your amplify env name with `amplify env list`

3. Edit buildspec-dev.yml | env > parameter-store with your keys created.
```
env:
  parameter-store:
    ACCESS_KEY: "someCoolName"
    SECRET_KEY: "someGreatName"
    ENV_AMPLIFY: "AmplifyEnvNameForDevExample"
```

4. Edit your buildspec-dev.yml referencing your environment variables from SSM.

**For production environment:**

1. Store AWS account ID from your Account in Production Enviroment using SSM Parameter Store via AWS CLI OR AWS Console.
    - Command using CLI with SecureString: `aws ssm put-parameter --name "someCoolName" --type "SecureString" --value "Password123$"`
    - Do not forget to use `SecureString` to leverage best security practices.
2. Store your Amplify Environment name for production.
    - You can always check your amplify env name with `amplify env list`
3. Edit buildspec-prod.yml | env > parameter-store with your keys created.
```
env:
  parameter-store:
    AMPLIFY_ACCOUNT_NUMBER_PROD: "AmplifyAccountNumberProd"
    ENV: "AmplifyEnvNameForProdExample"
```

4. Edit your buildspec-prod.yml referencing your environment variables from SSM.

### Creating build with CodeBuild with ECR 

1. Create three CodeBuild projects using your repository:
    - Development - Referencing dev branch.
    - Test - referencing test branch.
    - Production - Referencing master branch.
2. In each environment - Use Custom Image with Linux as `Environment type` and the image created at ECR.
    ![Amplify30](img/amplify30.png)
3. In buildspec configuration:
    - Use the buildspec-dev.yml for Amplify Development Environment.
    - Use the buildspec-test.yml for Amplify Test Environment.
    - Use the buildspec-prod.yml for Amplify Production Environment.
4. Grant the right permissions for both CodeBuild roles have access to SSM.

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ssm:Describe*",
                "ssm:Get*",
                "ssm:List*"
            ],
            "Resource": "*"
        }
    ]
}
```

5. Start the **development** build for testing purposes. 

If it runs with success, now it is time to create the production build.

### Cross Account Role - Configuring the production build permissions

1. In Production Account via AWS Console.
    - Create a role with the right permissions to allow amplify create resources.
2. Grant trust relationship using Dev account ID.
    - Inside the role created.
    - Click `Trust relationship`.
    - Click `Edit trust relationship`.
    - Use Dev AWS Account ID in the code below.
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::<AccountIDFromDevAcc>:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {}
    }
  ]
}
```

3. In Developer Account via AWS Console.
    - Go to your codebuild and access the Production build project.
    - Go to `Build details` and click in the `Service role` link.
    - It`s going to open the IAM role associated with Production Build.
    - Attach the code below:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "sts:AssumeRole",
            "Resource": "arn:aws:iam::<AccountIdProd>:role/YourNewRoleFromProdAcc"
        }
    ]
}
```
    - Change `<AccountIdProd>` to the AWS account ID from Production User Account.
    - Change `YourNewRoleFromProdAcc` to the role name created at the beginning of this section.

4. Start the **production** build.

If everything worked well, it is time to create the Pipeline.

### Create a Pipeline using AWS CodePipeline

For **development** pipeline:

1. Go to AWS CodePipeline Service and create a pipeline.
    - Enter the pipeline name.
    - Use your source provider and access your repository.
    - Use `dev` branch
    - For build stage, use `AWS CodeBuild` and use your codebuild `developer` environment.

2. Edit this pipeline
    - Click `Edit stage` in Edit:Source.
    - Click `Add Action` Button.
    - Add the ECR Image referencing the image that was created.
    - Click `Done`.
    - Save it.

For **test** pipeline:

1. Go to AWS CodePipeline Service and create a pipeline.
    - Enter the pipeline name.
    - Use your source provider and access your repository.
    - Use `test` branch
    - For build stage, use `AWS CodeBuild` and use your codebuild `test` environment.

2. Edit this pipeline
    - Click `Edit stage` in Edit:Source.
    - Click `Add Action` Button.
    - Add the ECR Image referencing the image that was created.
    - Click `Done`.
    - Save it.

For **production** pipeline:

1. Go to AWS CodePipeline Service and create a pipeline:
    - Enter the pipeline name.
    - Use your source provider and access your repository.
    - Use `master` branch.
    - For build stage, use `AWS CodeBuild` and use your codebuild `production` environment.

2. Edit this pipeline:
    - Click `Edit stage` in Edit:Source.
    - Click `Add Action` Button.
    - Add the ECR Image referencing the image that was created.
    - Click `Done`.
    - Save it.

The pipeline should have two sources.
![Amplify45](img/amplify45.png)


## Setup CloudFront for production environment

1. In your AWS Production Account, open Cloudfront Service and create `Web Distribution`.
2. Point the `Origin Domain Name` to your s3 hosting bucket.
3. Set `true` to `Restrict Bucket Access`.
4. Set `Create a New Identity` to `true`.
5. Set `Yes, Update Bucket Policy` to `Grant Read Permissions on Bucket` and save it.
6. Go to your cloudfront created and click `Error Pages`, `Create Custom Error Response`.
7. Follow the steps as the image below:
![Amplify55](img/amplify55.png)

Setup your bucket policy on your s3 bucket hosting.

1. Access your s3 bucket and edit bucket policy for:
```
{
    "Version": "2008-10-17",
    "Id": "PolicyForCloudFrontPrivateContent",
    "Statement": [
        {
            "Sid": "1",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity <yourOAIFromCloudFront>"
            },
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::yours3bucket/*",
                "arn:aws:s3:::yours3bucket"
            ]
        }
    ]
}
```

2. Open your cloudfront DNS at your browser!

## Issues

**Custom Message - ENV Variables**

- If you want to change the Environment Variables from lambda custom message authentication:
    - Change directly from console.
    ![Amplify40](img/amplify40.png)

**Returning to amplify configuration from the cloud**

For some reason, you changed amplify configuration and want to return to the same configuration in the cloud.
- To return back to the same amplify configuration as in the cloud.
    - Run `amplify pull`, it`ll return to the original state.

****


## Cleaning Up all your resources

1. Run `amplify delete` for deleting all amplify environment
2. Access Amplify Console and delete the project.
3. Delete all the s3 buckets related to amplify manually.
4. Delete all the codebuild projects.
5. Disable and delete the CloudFront Distribution.

###Destroy The Service###

## Acknowledgments

- [AWS Profile](https://docs.amplify.aws/start/getting-started/installation/q/integration/angular#option-1-watch-the-video-guide)
- [ECR with CodeBuild](https://docs.aws.amazon.com/codebuild/latest/userguide/sample-ecr.html)
- [Build specification reference for CodeBuild](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html)
- [Amplify UI Components](https://docs.amplify.aws/ui/q/framework/angular)


To be updated with latest amplify releases, always check:

- [Amplify CLI](https://github.com/aws-amplify/amplify-console)  
- [Amplify Documentation](https://docs.amplify.aws/lib/auth/start/q/platform/js)
