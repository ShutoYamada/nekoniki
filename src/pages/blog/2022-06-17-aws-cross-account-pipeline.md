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

最終的に出来上がるのは以下のような構成のリソース群です。

![aws_cross_account_cicd](/img/aws_cross_account_cicd.png "aws_cross_account_cicd")

意図としては、ソース管理は親となるアカウントで一元管理したいけど、パイプラインを含めて環境依存のリソースは全て、子となる環境アカウント側で持ちたいため、このような構成を目指しています。

## 環境アカウント側でパイプラインの構築に必要なリソースを定義(Stack1)
まずは実際にパイプラインが動く環境側で、`IAM`ロール等のリソースを作成していきます。
CICDが参照する`CodeCommit`のリポジトリがあるアカウント側のIDを取得しておきましょう。

### CodePipeline用のロールを作成

`CodePipeline`用のサービスロールを作成します。
このロールが後で作成する、親アカウント側の`CodeCommit`を操作するロールを`AssumeRole`するため、ポリシー内で親アカウントのIDを指定して宣言しています。

<details><summary>createCodePipelineRole</summary><div>

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

</div></details>

### CodeBuild用のロールを作成

`CodeBuild用のロールを作成`用のサービスロールを作成します。
このロールは特にクロスアカウント固有の設定もなく、`CodeBuild`を動かす上で必要な権限を宣言しています。

<details><summary>createCodeBuildRole</summary><div>

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

</div></details>

### Artifactリソースの作成

続いて`CodePipeline`中で各アクションがソースのやりとりに使用する`Artifact`リソースを作成します。
特に`CodeCommit`のロールは親のアカウント側にあるので、そちらからも参照できるように`S3`のバケットポリシーを設定し、かつ暗号化をするため`KMS`の`Key`を用いています。

#### KMS Key

<details><summary>createArtifactKey</summary><div>

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

</div></details>

#### S3バケット

<details><summary>createArtifactBucket</summary><div>

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

</div></details>

### 上記を使用するStackを作る
ここまでのリソースを作成するためにスタックにまとめます。
パラメータとしては親アカウントのIDを渡してあげる必要があります。

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
今度は親アカウント側で`CodeCommit`を触れる権限+先ほど作成した環境アカウント側の`Artifact`リソースを触れる権限を持ったロールを作成します。
このロールが2つのアカウントを跨いでリソースをやりとりすることで、クロスアカウントのパイプラインを実現しています。
そのため、記述は簡素ですが要となるロールです。

### CodeCommitの操作+環境アカウントのリソースの操作権限を持つロールを作成

<details><summary>createCodeCommitAccessRole</summary><div>

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

</div></details>

### スタック
先ほどの`createCodeCommitAccessRole`を呼び出すロールです。
`Stack1`で作成したリソースの情報を渡しています。

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


## 環境アカウント側でパイプラインを構築(Stack3)
最後に実際にパイプラインを環境アカウント側で構築します。
基本的に今までのスタックで作成したリソースを指定して`CodePipeline`を構築するだけですが、パラメータ多いため長いコードになっています。

### CI/CDのリソースを作成

<details><summary>createPipeline</summary><div>

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
    // 対象ブランチ
    targetBranch: string;
    // ArtifactバケットARN
    artifactBucketArn: string;
    // Artifact暗号鍵ARN
    artifactEncryptKeyArn: string;
    // ソースリポジトリARN
    sourceRepositoryArn: string;
    // CodeCommitのRole ARN
    codeCommitAccessRoleArn: string;
    // CodeBuildのRole ARN
    codeBuildServiceRoleArn: string;
    // CodePipelineのRole ARN
    codePipelineServiceRoleArn: string;
    // 出力先バケット ARN
    exportBucketArn: string;
}

/**
 * CI/CD構築
 */
const createPipeline = (stack: cdk.Stack, {
    targetBranch,
    artifactBucketArn,
    artifactEncryptKeyArn,
    sourceRepositoryArn,
    codeCommitAccessRoleArn,
    codeBuildServiceRoleArn,
    codePipelineServiceRoleArn,
    exportBucketArn,
}: Props) => {    

     // ソースコードのリポジトリを取得
    const repository = codecommit.Repository.fromRepositoryArn(stack, `SourceRepository`, sourceRepositoryArn);
    // CodeCommit用のロールを取得
    const codeCommitRole = iam.Role.fromRoleArn(stack, 'CodeCommitRole', codeCommitAccessRoleArn, {
        mutable: false
    });
    // CodeBuildのサービスロールを取得
    const codeBuildRole = iam.Role.fromRoleArn(stack, 'CodeBuildRole', codeBuildServiceRoleArn);
    // CodePipelineのサービスロールを取得
    const codePipelineRole = iam.Role.fromRoleArn(stack, 'CodePipelineRole', codePipelineServiceRoleArn);
    // Artifactバケットの鍵を取得
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
                                // 何かCodeBuildの環境変数があれば
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
}

```

</div></details>

### スタック
`createPipeline`を呼び出すためにスタック化しています。

```ts
export class Stack3 extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const TARGET_BRANCH = "master";
    const SOURCE_REPOSITORY_ARN = "XXXXXXXXXXX";
    const ARTIFACT_BUCKET_ARN = "XXXXXXXXXXX";
    const ARTIFACT_ENCRYPT_KEY_ARN = "XXXXXXXXXXX";
    const CODE_COMMIT_ACCESS_ROLE_ARN = "XXXXXXXXXXX";
    const CODE_BUILD_SERVICE_ROLE_ARN = "XXXXXXXXXXX";
    const CODE_PIPELINE_SERVICE_ROLE_ARN = "XXXXXXXXXXX";
    const EXPORT_BUCKET_ARN = "XXXXXXXXXXX";

    createPipeline(this, {
        targetBranch: TARGET_BRANCH,
        artifactBucketArn: ARTIFACT_BUCKET_ARN,
        artifactEncryptKeyArn: ARTIFACT_ENCRYPT_KEY_ARN,
        sourceRepositoryArn: SOURCE_REPOSITORY_ARN,
        codeCommitAccessRoleArn: CODE_COMMIT_ACCESS_ROLE_ARN,
        codeBuildServiceRoleArn: CODE_BUILD_SERVICE_ROLE_ARN,
        codePipelineServiceRoleArn: CODE_PIPELINE_SERVICE_ROLE_ARN,
        exportBucketArn: EXPORT_BUCKET_ARN,
    });
  }
}
```

これでクロスアカウントのパイプラインの構築ができました。
出来上がった構成図をあらためて載せておきます。
![aws_cross_account_cicd](/img/aws_cross_account_cicd.png "aws_cross_account_cicd")

## まとめ
今回はクラメソさんの記事を参考に、クロスアカウントでCI/CDを構築するのをCDKを用いて行いました。
あとは環境アカウントを何個も作って「開発環境」「検証環境」といった具合に、それぞれの環境でCI/CDを組み上げることで、互いの環境に影響を及ぼさないようなCI/CDを構築することができます。

おそらく、人によってはデプロイ先が`S3`でなく`ECS`や`EC2`だったりするケースもあると思うので、その際はこの記事をベースにいくらか改良が必要になります。

今回の内容が役立ちましたら幸いです。


## 参考
- [DevelopersIO | CodePipelineでアカウントをまたいだパイプラインを作成してみる](https://t.co/R0umZSRJlZ)