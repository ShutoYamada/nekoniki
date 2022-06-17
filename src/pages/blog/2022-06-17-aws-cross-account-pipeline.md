---
templateKey: blog-post
url: 20220617_aws-cross-account-pipeline
title: 【AWS】CDKでクロスアカウントのパイプラインを構築する
date: 2022-06-17T19:00:00.000Z
description: |-
  今回はクロスアカウントのCodePipeline構成をCDKで構築したいと思います。
featuredpost: false
featuredimage: /img/aws-logo.png
tags:
  - aws
  - cdk
  - iam
  - codepipeline
  - codecommit
---


## 前提
下地として、クラスメソッドさんの下記記事を参考にしています。

- [DevelopersIO | CodePipelineでアカウントをまたいだパイプラインを作成してみる](https://t.co/R0umZSRJlZ)

## 環境アカウント側でパイプラインの構築に必要なリソースを定義(Stack1)

### CodePipeline用のロールを作成

```ts
import {Stack, CfnOutput} from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

/**
 * CodePipelineのサービスロール作成
 * @param sourceAccountId CodeCommitのリポジトリを所有しているアカウントID
 */
const createCodePipelineRole = (stack: Stack, sourceAccountId: string): iam.Role => {
    const role = new iam.Role(stack, `CodePipelineServiceRole`, {
        roleName: '<ロール名>',
        // CodePipelineからAssumeRoleされる
        assumedBy: new iam.ServicePrincipal('codepipeline.amazonaws.com'),
        inlinePolicies: {
            thing: new iam.PolicyDocument({
                statements: [
                    // CodeCommitリポジトリを保有しているアカウントのロールにAssumeRoleを行う権限
                    new iam.PolicyStatement({
                        sid: 'AssumeRolePolicy',
                        actions: ['sts:AssumeRole'],
                        resources: [`arn:aws:iam::${sourceAccountId}:role/*`],
                    }),
                    new iam.PolicyStatement({
                        sid: 'S3Policy',
                        actions: [
                            's3:PutObject',
                            's3:GetObject',
                            's3:GetObjectVersion',
                            's3:GetBucketVersioning'
                        ],
                        resources: ['*']                        
                    }),
                    new iam.PolicyStatement({
                        sid: 'CodeBuildPolicy',
                        actions: [
                            'codebuild:BatchGetBuilds',
                            'codebuild:StartBuild'
                        ],
                        resources: ['*']
                    }),
                ],
            }),
        }
    });
    new CfnOutput(stack, 'CodePipelineServiceRoleArn', {
        value: role.roleArn,
    });
    return role;
}
```

### CodeBuild用のロールを作成

```ts
import {Stack, CfnOutput} from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

/**
 * CodeBuildのサービスロール作成
 */
const createCodeBuildRole = (stack: Stack): iam.Role => {
    const role = new iam.Role(stack, `CodeBuildServiceRole`, {
        roleName: '<ロール名>',
        assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
        inlinePolicies: {
            thing: new iam.PolicyDocument({
                statements: [
                    new iam.PolicyStatement({
                        sid: 'CloudWatchLogsPolicy',
                        actions: [
                            "logs:CreateLogGroup",
                            "logs:CreateLogStream",
                            "logs:PutLogEvents"
                        ],
                        resources: [`*`],
                    }),
                    new iam.PolicyStatement({
                        sid: 'S3ObjectPolicy',
                        actions: [
                            "s3:PutObject",
                            "s3:GetObject",
                            "s3:GetObjectVersion"
                        ],
                        resources: [`*`],
                    }),
                ],
            }),
        }
    });
    new CfnOutput(stack, 'CodeBuildServiceRoleArn', {
        value: role.roleArn,
    });
    return role;
}
```

### Artifactリソースの作成

#### KMS Key

```ts
import {Stack} from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';

/**
 * アーティファクト用のKMS Keyを作成
 */
const createArtifactKey = (stack: Stack, sourceAccountId: string, codePipelineServiceRole: iam.Role, codeBuildServiceRole: iam.Role) => {
    // 環境アカウントからの操作権限
    cryptKey.addToResourcePolicy(new iam.PolicyStatement({
        sid: 'Enable IAM User Permissions',
        effect: iam.Effect.ALLOW,
        principals: [
            new iam.ArnPrincipal(
                `arn:aws:iam::${Stack.of(stack).account}:root`,
            )
        ],
        actions: ['kms:*'],
        resources: ['*']
    }));

    // CI/CDの各ステージ + 親アカウントからの操作権限
    cryptKey.addToResourcePolicy(new iam.PolicyStatement({
        sid: 'Allow use of the key',
        effect: iam.Effect.ALLOW,
        principals: [
            new iam.ArnPrincipal(codePipelineServiceRole.roleArn),
            new iam.ArnPrincipal(codeBuildServiceRole.roleArn),
            new iam.ArnPrincipal(`arn:aws:iam::${sourceAccountId}:root`)
        ],
        actions: [
            "kms:Encrypt",
            "kms:Decrypt",
            "kms:ReEncrypt*",
            "kms:GenerateDataKey*",
            "kms:DescribeKey"
        ],
        resources: ['*']
    }));
    cryptKey.addToResourcePolicy(new iam.PolicyStatement({
        sid: 'Allow attachment of persistent resources',
        effect: iam.Effect.ALLOW,
        principals: [
            new iam.ArnPrincipal(codePipelineServiceRole.roleArn),
            new iam.ArnPrincipal(codeBuildServiceRole.roleArn),
            new iam.ArnPrincipal(`arn:aws:iam::${sourceAccountId}:root`)
        ],
        actions: [
            "kms:CreateGrant",
            "kms:ListGrants",
            "kms:RevokeGrant"
        ],
        resources: ['*'],
        conditions: {
            Bool: {
                'kms:GrantIsForAWSResource': true
            }
        }
    }));
    new CfnOutput(stack, `ArtifactCryptKeyArn`, {
        value: cryptKey.keyArn,
    });

    return cryptKey;
}
```

#### S3バケット

```ts
import {Stack} from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';

/**
 * アーティファクト用のS3バケットを作成
 */
const createArtifactBucket = (stack: Stack, sourceAccountId: string, cryptKey: kms.Key) => {
    // CodePipelineで使用するアーティファクト用バケットを作成sakusei
    const artifactBucket = new s3.Bucket(stack, `BuildArtifactBucket`, {
        bucketName: `<バケット名>`,
        encryption: s3.BucketEncryption.KMS,
        encryptionKey: cryptKey
    });

    artifactBucket.addToResourcePolicy(new iam.PolicyStatement({
        sid: 'DenyUnEncryptedObjectUploads',
        effect: iam.Effect.DENY,
        principals: [new iam.StarPrincipal()],
        actions: ['s3:PutObject'],
        resources: [`arn:aws:s3:::${artifactBucket.bucketName}/*`],
        conditions: {
            StringNotEquals: {
                's3:x-amz-server-side-encryption': 'aws:kms'
            }
        }
    }));
    artifactBucket.addToResourcePolicy(new iam.PolicyStatement({
        sid: 'DenyInsecureConnections',
        effect: iam.Effect.DENY,
        principals: [new iam.StarPrincipal()],
        actions: ['s3:*'],
        resources: [`arn:aws:s3:::${artifactBucket.bucketName}/*`],
        conditions: {
            Bool: {
                'aws:SecureTransport': false
            }
        }
    }));
    artifactBucket.addToResourcePolicy(new iam.PolicyStatement({
        sid: 'CrossAccountS3GetPutPolicy',
        effect: iam.Effect.ALLOW,
        principals: [new iam.ArnPrincipal(`arn:aws:iam::${sourceAccountId}:root`)],
        actions: [
            's3:Get*',
            's3:Put*'
        ],
        resources: [`arn:aws:s3:::${artifactBucket.bucketName}/*`],
    }));
    artifactBucket.addToResourcePolicy(new iam.PolicyStatement({
        sid: 'CrossAccountS3ListPolicy',
        effect: iam.Effect.ALLOW,
        principals: [new iam.ArnPrincipal(`arn:aws:iam::${sourceAccountId}:root`)],
        actions: ['s3:ListBucket'],
        resources: [`arn:aws:s3:::${artifactBucket.bucketName}`],
    }));
    new CfnOutput(stack, `ArtifactBucketArn`, {
        value: artifactBucket.bucketArn
    });
}
```

### 上記を使用するStackを作る

```ts
export class Stack1 extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const SOURCE_ACCOUNT_ID = "XXXXXXXXXXX";

    const codePipelineServiceRole = createCodePipelineRole(this, SOURCE_ACCOUNT_ID);
    const codeBuildServiceRole = createCodeBuildRole(this)
    const artifactEncryptKey = createArtifactKey(this, SOURCE_ACCOUNT_ID, codePipelineServiceRole, codeBuildServiceRole);
    const artifactBucket = createArtifactBucket(this, SOURCE_ACCOUNT_ID, artifactEncryptKey);
  }
}
```

## 親アカウント側でCodeCommitと環境アカウントのArtifactを触れるロールを定義(Stack2)

### CodeCommitの操作+環境アカウントのリソースの操作権限を持つロールを作成

```ts
import {Stack, CfnOutput} from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

/**
 * CodeCommitのアクセスロールを作成する
 * @summary CodeCommitの操作 + 環境アカウント側のS3バケットとKMSキーにアクセスするロールを作成
 */
const createCodeCommitAccessRole = (stack: Stack, envAccountId: string, sourceRepositoryArn: string, artifactBucketArn: string, artifactCryptKeyArn: string): iam.Role => {
    const role = new iam.Role(stack, `CodeCommitRole`, {
        roleName: `<ロール名>`,
        assumedBy: new iam.ArnPrincipal(`arn:aws:iam::${envAccountId}:root`),
        inlinePolicies: {
            thing: new iam.PolicyDocument({
                statements: [
                    new iam.PolicyStatement({
                        sid: 'UploadArtifactPolicy',
                        actions: [
                            "s3:PutObject",
                            "s3:PutObjectAcl"
                        ],
                        resources: [`${artifactBucketArn}/*`]                        
                    }),
                    new iam.PolicyStatement({
                        sid: 'KMSAccessPolicy',
                        actions: [
                            "kms:DescribeKey",
                            "kms:GenerateDataKey*",
                            "kms:Encrypt",
                            "kms:ReEncrypt*",
                            "kms:Decrypt"
                        ],
                        resources: [artifactCryptKeyArn]
                    }),
                    new iam.PolicyStatement({
                        sid: 'CodeCommitAccessPolicy',
                        actions: [
                            "codecommit:GetBranch",
                            "codecommit:GetCommit",
                            "codecommit:UploadArchive",
                            "codecommit:GetUploadArchiveStatus",
                            "codecommit:CancelUploadArchive",
                            "codecommit:GetRepository"
                        ],
                        resources: [sourceRepositoryArn]
                    }),
                ],
            }),
        }
    });
    new CfnOutput(this, `CodeCommitAccessRoleArn`, {
      value: codeCommitAccessRole.roleArn
    });

    return role;
}
```

### スタック

```ts
export class Stack2 extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const ENV_ACCOUNT_ID = "XXXXXXXXXXX";
    const SOURCE_REPOSITORY_ARN = "XXXXXXXXXXX";
    const ARTIFACT_BUCKET_ARN = "XXXXXXXXXXX";
    const ARTIFACT_ENCRYPT_KEY_ARN = "XXXXXXXXXXX";

    createCodeCommitAccessRole(this, SOURCE_REPOSITORY_ARN, ARTIFACT_BUCKET_ARN, ARTIFACT_ENCRYPT_KEY_ARN);
  }
}
```


## Todo...

```ts
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as actions from 'aws-cdk-lib/aws-codepipeline-actions';

type Props = {
    prefix: string;
    targetBranch: string;
    // バケットARN
    artifactBucketArn: string;
    artifactEncryptKeyArn: string;
    // ソースリポジトリARN
    sourceRepositoryArn: string;
    // CodeCommitのRole ARN
    codeCommitAccessRoleArn: string;
     // CodeBuildのRole ARN
    codeBuildServiceRoleArn: string;
     // CodePipelineのRole ARN
    codePipelineServiceRoleArn: string;
    exportBucketArn: string;
    apiUrl: string;
    apiKey: string;
    userPoolId: string;
    userPoolClientId: string;
}

type Response = {

}

/**
 * GOFUNのCI/CD構築
 */
export default (stack: cdk.Stack, {
    prefix,
    targetBranch,
    artifactBucketArn,
    artifactEncryptKeyArn,
    sourceRepositoryArn,
    codeCommitAccessRoleArn,
    codeBuildServiceRoleArn,
    codePipelineServiceRoleArn,
    exportBucketArn,
    apiUrl,
    apiKey,
    userPoolId,
    userPoolClientId,
}: Props): Response => {    

     // ソースコードのリポジトリを取得
    const repository = codecommit.Repository.fromRepositoryArn(stack, `SourceRepository`, sourceRepositoryArn);
    const codeCommitRole = iam.Role.fromRoleArn(stack, 'CodeCommitRole', codeCommitAccessRoleArn, {
        mutable: false
    });
    const codeBuildRole = iam.Role.fromRoleArn(stack, 'CodeBuildRole', codeBuildServiceRoleArn);
    const codePipelineRole = iam.Role.fromRoleArn(stack, 'CodePipelineRole', codePipelineServiceRoleArn);
    const encryptionKey = kms.Key.fromKeyArn(stack, 'EncryptKey', artifactEncryptKeyArn);

    // CodePipelineで使用するArtifactを定義
    const sourceOutput = new codepipeline.Artifact(); // ソースファイルのアウトプット先
    const buildOutput = new codepipeline.Artifact();  // ビルド結果のアウトプット先



    // フロントエンドのソースコード用
    const frontBucket = s3.Bucket.fromBucketArn(stack, `FrontBucket`, exportBucketArn);

    const artifactBucket = s3.Bucket.fromBucketAttributes(stack, 'ArtifactBucket', {
        bucketArn: artifactBucketArn,
        encryptionKey,
    });


    // CodePipelineの設定
    const pipeline = new codepipeline.Pipeline(stack, `FrontCodePipeline`, {
        pipelineName: `FrontCodePipeline`,
        role: codePipelineRole,
        artifactBucket,
        crossAccountKeys: true,
        // パイプラインの各ステージを設定
        stages: [
            // ソース取得
            {
                stageName: 'Source',
                actions: [
                    new actions.CodeCommitSourceAction({
                        actionName: 'CodeCommit',
                        repository: repository,
                        output: sourceOutput,
                        branch: targetBranch,
                        role: codeCommitRole,                        
                    })
                ]
            },
            // ビルド
            {
                stageName: 'Build',
                actions: [
                    new actions.CodeBuildAction({
                        actionName: 'CodeBuild',
                        project: new codebuild.PipelineProject(stack, `BuildProject`, {
                            environment: {
                                buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
                            },
                            role: codeBuildRole,
                            encryptionKey,
                            environmentVariables: {
                                // API URL
                                "REACT_APP_API_BASE": {
                                    type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                                    value: apiUrl,
                                },
                                // API KEY
                                "REACT_APP_API_KEY": {
                                    type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                                    value: apiKey,
                                },
                                "REACT_APP_IS_PRODUCT": {
                                    type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                                    value: prefix === 'prod',
                                },
                                // UserPool ID
                                "REACT_APP_USER_POOLS_ID": {
                                    type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                                    value: userPoolId,
                                },
                                // UserPoolClient ID
                                "REACT_APP_USER_POOLS_WEB_CLIENT_ID": {
                                    type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                                    value: userPoolClientId,
                                }
                            }
                        }),
                        runOrder: 2,
                        input: sourceOutput,
                        outputs: [buildOutput],
                    })
                ]
            },
            // デプロイ
            {
                stageName: 'Deploy',
                actions: [
                    new actions.S3DeployAction({
                        actionName: 'S3_Deploy',
                        bucket: frontBucket,
                        input: buildOutput,
                    }),
                ],
            }
        ]
    });

    return {
        
    }
}

```


## 参考
- [DevelopersIO | CodePipelineでアカウントをまたいだパイプラインを作成してみる](https://t.co/R0umZSRJlZ)