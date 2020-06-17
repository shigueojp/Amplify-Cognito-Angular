import * as cdk from '@aws-cdk/core';
import * as S3 from '@aws-cdk/aws-s3';
import * as CodePipeline from '@aws-cdk/aws-codepipeline'
import * as CodePipelineAction from '@aws-cdk/aws-codepipeline-actions'
import * as CodeBuild from '@aws-cdk/aws-codebuild'
import * as IAM from '@aws-cdk/aws-iam'
import * as CLOUDFRONT from '@aws-cdk/aws-cloudfront'
import { RemovalPolicy } from '@aws-cdk/core';

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
      removalPolicy: RemovalPolicy.DESTROY,
    })

    // CodePipeline
    const pipeline = new CodePipeline.Pipeline(this, 'pipeline', {
      pipelineName: 'Website',
      restartExecutionOnUpdate: true
    })

    // CodePipeline artifacts
    const outputMasterSources = new CodePipeline.Artifact();
    const outputDevSources = new CodePipeline.Artifact();
    const outputDevWebsite = new CodePipeline.Artifact();
    const outputMasterWebsite = new CodePipeline.Artifact();

    // Codebuild Role
    const role = new IAM.Role(this, 'Role', {
      assumedBy: new IAM.ServicePrincipal('codebuild.amazonaws.com'),
      description: 'This is a custom role...',
    });

    // CodeBuild
    // Using DockerFile as buildImage
    const codeBuildDev = new CodeBuild.PipelineProject(this, "BuildCDK", {
      buildSpec: CodeBuild.BuildSpec.fromSourceFilename('./buildspec-dev.yml'),
      role: role.withoutPolicyUpdates(),
      environment: {
        buildImage: CodeBuild.LinuxBuildImage.AMAZON_LINUX_2
      },
    });

    const codeBuildMaster = new CodeBuild.PipelineProject(this, "CodeBuildMaster", {
      buildSpec: CodeBuild.BuildSpec.fromSourceFilename('./buildspec-prod.yml'),
      role: role.withoutPolicyUpdates(),

      // environment: {
      //   buildImage: CodeBuild.LinuxBuildImage.fromAsset(this, 'Dockerfile', {
      //     directory: path.join(__dirname, './'),
      //   }),
      // },
    });

    // Token from github
    const gitHubOAuthToken = cdk.SecretValue.secretsManager('GitHubToken', {
      jsonField: 'GitHubToken',
    });

    // Source from github dev
    pipeline.addStage({
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

    // Build Dev
    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new CodePipelineAction.CodeBuildAction({
          actionName: 'WebsiteDev',
          project: codeBuildDev,
          input: outputDevSources,
          outputs: [outputDevWebsite],
        }),
      ]
    })

    // Granting Permissions
    role.addToPolicy(new IAM.PolicyStatement({
      actions: ['*'],
      resources: ['*']
    }))

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [
        new CodePipelineAction.S3DeployAction({
          actionName: 'S3_Deploy',
          bucket: bucketHosting,
          input: outputDevWebsite,
        }),
      ]
    })

    // Cloudfront pointing to S3
    new CLOUDFRONT.CloudFrontWebDistribution(this, 'CloudFront', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucketHosting,
          },
          behaviors: [
            { isDefaultBehavior: true }
          ]
        }
      ]
    });
  }
}
