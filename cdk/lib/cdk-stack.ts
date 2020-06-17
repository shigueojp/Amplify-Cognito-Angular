import * as cdk from '@aws-cdk/core';
import * as S3 from '@aws-cdk/aws-s3';
import * as CodePipeline from '@aws-cdk/aws-codepipeline'
import * as CodePipelineAction from '@aws-cdk/aws-codepipeline-actions'
import * as CodeBuild from '@aws-cdk/aws-codebuild'
import * as IAM from '@aws-cdk/aws-iam'
import * as ECR from '@aws-cdk/aws-ecr'
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
import path = require('path');

export interface ConfigProps extends cdk.StackProps {
  github: {
    owner: string,
    repository: string,
  }
}

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: ConfigProps) {
    super(scope, id, props);

    // S3 as Hosting
    const bucketHosting = new S3.Bucket(this, 'bucketHosting', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
    })

    // CodePipeline
    const pipeline = new CodePipeline.Pipeline(this, 'pipeline', {
      pipelineName: 'Website',
      restartExecutionOnUpdate: true
    })

    // CodePipeline artifacts
    const outputSources = new CodePipeline.Artifact();
    const outputWebsite = new CodePipeline.Artifact();

    // Codebuild Role
    const role = new IAM.Role(this, 'Role', {
      assumedBy: new IAM.ServicePrincipal('codebuild.amazonaws.com'),
      description: 'This is a custom role...',
    });

    // CodeBuild
    // Using DockerFile as buildImage
    const codeBuild = new CodeBuild.PipelineProject(this, "LambdaBuild", {
      buildSpec: CodeBuild.BuildSpec.fromSourceFilename('./buildspec-dev.yml'),
      role: role.withoutPolicyUpdates(),

      environment: {
        buildImage: CodeBuild.LinuxBuildImage.fromAsset(this, 'Dockerfile', {
          directory: path.join(__dirname, './'),
        }),
      },
    });

    // Token from github
    const gitHubOAuthToken = cdk.SecretValue.secretsManager('GitHubToken', {
      jsonField: 'GitHubToken',
    });

    // Source from github
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new CodePipelineAction.GitHubSourceAction({
          actionName: 'Checkout',
          owner: props.github.owner,
          repo: props.github.repository,
          oauthToken: gitHubOAuthToken,
          output: outputSources,
          trigger: CodePipelineAction.GitHubTrigger.WEBHOOK,
        })
      ]
    })

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new CodePipelineAction.GitHubSourceAction({
          actionName: 'Checkout',
          owner: props.github.owner,
          repo: props.github.repository,
          oauthToken: gitHubOAuthToken,
          output: outputSources,
          trigger: CodePipelineAction.GitHubTrigger.WEBHOOK,
          branch: dev
        })
      ]
    })

    // Build
    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new CodePipelineAction.CodeBuildAction({
          actionName: 'Website',
          project: codeBuild,
          input: outputSources,
          outputs: [outputWebsite],
        })
      ]
    })

    // Granting Permissions
    role.addToPolicy(new IAM.PolicyStatement({
      actions: ['*'],
      resources: ['*']
    }))

    //  ECR PUSH
    // const asset = new DockerImageAsset(this, 'MyBuildImage', {
    //   directory: path.join(__dirname, '/')
    // });

    // const repository = new ECR.Repository(this, 'GoldeImageCDK', {

    // });


  }
}
