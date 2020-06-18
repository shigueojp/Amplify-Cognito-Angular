#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { CdkStack } from '../lib/cdk-stack';
import { RoleCreationProdAccStack } from '../lib/cdk-stack-role-creation-prod';
import { config } from '../config/githubConfig';
import { crossAccConfig } from '../config/crossAccConfig'

const app = new cdk.App();
new CdkStack(app, 'CdkStackCICD', config);
new RoleCreationProdAccStack(app, 'CdkStackRole', crossAccConfig);
