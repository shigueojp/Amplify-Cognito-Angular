#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { CdkStack } from '../lib/cdk-stack';
import { config } from '../config/githubConfig';

const app = new cdk.App();
new CdkStack(app, 'CdkStack', config);
