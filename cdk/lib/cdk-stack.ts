import * as cdk from '@aws-cdk/core';
import * as S3 from '@aws-cdk/aws-s3';
import * as CodePipeline from '@aws-cdk/aws-codepipeline'
import * as CodePipelineAction from '@aws-cdk/aws-codepipeline-actions'
import * as CodeBuild from '@aws-cdk/aws-codebuild'
import * as IAM from '@aws-cdk/aws-iam'
import * as CLOUDFRONT from '@aws-cdk/aws-cloudfront'
import { RemovalPolicy } from '@aws-cdk/core';
import { BuildEnvironmentVariableType } from '@aws-cdk/aws-codebuild';


export interface ConfigProps extends cdk.StackProps {
  github: {
    owner: string,
    repository: string,
  },
  AmplifyEnvProd: string
}

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: ConfigProps) {
    super(scope, id, props);

    // S3 as Hosting
    const bucketHosting = new S3.Bucket(this, 'bucketHosting', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      removalPolicy: RemovalPolicy.DESTROY,
    })

    // CodePipeline for dev env
    const pipelineDev = new CodePipeline.Pipeline(this, 'pipelineDev', {
      pipelineName: 'WebsiteDev',
      restartExecutionOnUpdate: true
    })

    // CodePipeline for master env
    const pipelineMaster = new CodePipeline.Pipeline(this, 'pipelineMaster', {
      pipelineName: 'WebsiteMaster',
      restartExecutionOnUpdate: true
    })

    // CodePipeline artifacts
    const outputDevSources = new CodePipeline.Artifact();
    const outputDevWebsite = new CodePipeline.Artifact();

    const outputMasterSources = new CodePipeline.Artifact();
    const outputMasterWebsite = new CodePipeline.Artifact();

    // Codebuild Role
    const role = new IAM.Role(this, 'Role', {
      assumedBy: new IAM.ServicePrincipal('codebuild.amazonaws.com'),
      description: 'This is a custom role...',
    });

    // CodeBuild for DEV ENV
    const codeBuildDev = new CodeBuild.PipelineProject(this, "CodeBuildDev", {
      buildSpec: CodeBuild.BuildSpec.fromSourceFilename('./buildspec-dev.yml'),
      role: role.withoutPolicyUpdates(),
      environment: {
        buildImage: CodeBuild.LinuxBuildImage.AMAZON_LINUX_2
      },
    });

    // CodeBuild for PROD ENV
    const codeBuildMaster = new CodeBuild.PipelineProject(this, "CodeBuildMaster", {
      buildSpec: CodeBuild.BuildSpec.fromSourceFilename('./buildspec-prod.yml'),
      role: role.withoutPolicyUpdates(),
      environment: {
        buildImage: CodeBuild.LinuxBuildImage.AMAZON_LINUX_2
      },
    });

    // Token from github
    const gitHubOAuthToken = cdk.SecretValue.secretsManager('GitHubToken', {
      jsonField: 'GitHubToken',
    });

    // Source from github dev
    pipelineDev.addStage({
      stageName: 'Source',
      actions: [
        new CodePipelineAction.GitHubSourceAction({
          actionName: 'CheckoutDev',
          owner: props.github.owner,
          repo: props.github.repository,
          oauthToken: gitHubOAuthToken,
          output: outputDevSources,
          trigger: CodePipelineAction.GitHubTrigger.WEBHOOK,
          branch: "dev"
        }),
      ]
    })

    // Source gitHubMaster
    pipelineMaster.addStage({
      stageName: 'Source',
      actions: [
        new CodePipelineAction.GitHubSourceAction({
          actionName: 'CheckoutMaster',
          owner: props.github.owner,
          repo: props.github.repository,
          oauthToken: gitHubOAuthToken,
          output: outputMasterSources,
          trigger: CodePipelineAction.GitHubTrigger.WEBHOOK,
          branch: "master"
        }),
      ]
    })

    // Build Dev
    pipelineDev.addStage({
      stageName: 'Build',
      actions: [
        new CodePipelineAction.CodeBuildAction({
          actionName: 'WebsiteDev',
          project: codeBuildDev,
          input: outputDevSources,
          outputs: [outputDevWebsite],
          environmentVariables: {
            S3_BUCKET: {
              type: BuildEnvironmentVariableType.PLAINTEXT,
              value: bucketHosting.s3UrlForObject()
            }
          }
        }),
      ]
    })

    // Build Master
    pipelineMaster.addStage({
      stageName: 'Build',
      actions: [
        new CodePipelineAction.CodeBuildAction({
          actionName: 'WebsiteMaster',
          project: codeBuildMaster,
          input: outputMasterSources,
          outputs: [outputMasterWebsite],
          environmentVariables: {
            S3_BUCKET: {
              type: BuildEnvironmentVariableType.PLAINTEXT,
              value: 's3://hosting-prod-amplify-test-323232'
            },
            AmplifyEnvProd: {
              value: props.AmplifyEnvProd
            },
          }
        }),
      ]
    })

    // Granting Permissions
    role.addToPolicy(new IAM.PolicyStatement({
      actions: ['*'],
      resources: ['*']
    }))

    // // Deploy spa to s3 for DEV ENV
    pipelineDev.addStage({
      stageName: 'Deploy',
      actions: [
        new CodePipelineAction.S3DeployAction({
          actionName: 'S3_Deploy',
          bucket: bucketHosting,
          input: outputDevWebsite,
        }),
      ]
    })

    // Deploy spa to s3 for Master ENV
    // pipelineMaster.addStage({
    //   stageName: 'Deploy',
    //   actions: [
    //     new CodePipelineAction.S3DeployAction({
    //       actionName: 'S3_Deploy',
    //       bucket: bucketHosting,
    //       input: outputMasterWebsite,
    //     }),
    //   ]
    // })

    // Creating OAI for DEV ENV
    const oai = new CLOUDFRONT.OriginAccessIdentity(this, 'OAI');

    // Granting OAI Permissions to read Bucket
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
      ]
    });
  }
}
