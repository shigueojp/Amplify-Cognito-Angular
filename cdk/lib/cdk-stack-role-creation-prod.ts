import * as cdk from '@aws-cdk/core';
import * as IAM from '@aws-cdk/aws-iam';
import * as S3 from '@aws-cdk/aws-s3';
import * as CLOUDFRONT from '@aws-cdk/aws-cloudfront';
import { RemovalPolicy } from '@aws-cdk/core';

export interface ConfigProps extends cdk.StackProps {
  ProdAcc: string,
  DevAcc: string,
}

export class RoleCreationProdAccStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: ConfigProps) {
    super(scope, id, props);

    // CrossAccount Role
    const role = new IAM.Role(this, 'CrossAccRole', {
      assumedBy: new IAM.AccountPrincipal(props.DevAcc),
      description: 'This is a custom role...',
      roleName: 'CrossAccountRole',
    });

    // Granting Permissions
    role.addToPolicy(new IAM.PolicyStatement({
      actions: ['*'],
      resources: ['*']
    }))

    // S3 as Hosting
    const bucketHosting = new S3.Bucket(this, 'bucketHosting', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      removalPolicy: RemovalPolicy.DESTROY,
      bucketName: 'hosting-prod-amplify-test-323232'
    })

    // Creating OAI
    const oai = new CLOUDFRONT.OriginAccessIdentity(this, 'OAI');

    // Grantind OAI Permissions to read Bucket
    bucketHosting.grantRead(oai);

    // Cloudfront pointing to S3
    const cloudfront = new CLOUDFRONT.CloudFrontWebDistribution(this, 'CloudFront', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucketHosting,
            originAccessIdentity: oai
          },
          behaviors: [
            { isDefaultBehavior: true }
          ]
        }
      ],
      errorConfigurations: [{
        errorCode: 404,
        responseCode: 200,
        responsePagePath: '/index.html'
      }]
    });
  }
}
