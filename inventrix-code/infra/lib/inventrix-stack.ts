import path from 'path';
import { fileURLToPath } from 'url';
import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DB_NAME = 'inventrix';

export class InventrixStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ALB and the RDS subnet group both require two AZs; the workloads themselves run in the first one only.
    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        { name: 'public', subnetType: ec2.SubnetType.PUBLIC },
        { name: 'db', subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      ],
    });
    const appSubnet = vpc.publicSubnets[0];

    const db = new rds.DatabaseInstance(this, 'Db', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_17 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      availabilityZone: appSubnet.availabilityZone,
      multiAz: false,
      allocatedStorage: 20,
      storageEncrypted: true,
      databaseName: DB_NAME,
      credentials: rds.Credentials.fromGeneratedSecret('inventrix'),
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const jwtSecret = new secretsmanager.Secret(this, 'JwtSecret', {
      generateSecretString: { excludePunctuation: true, passwordLength: 64 },
    });

    const arm64Image = (dockerfile: string) =>
      ecs.ContainerImage.fromAsset(repoRoot, { file: dockerfile, platform: Platform.LINUX_ARM64 });

    // nginx (public, port 80) and the API share one task, so nginx reaches the API on localhost.
    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'App', {
      vpc,
      cpu: 256,
      memoryLimitMiB: 512,
      desiredCount: 1,
      minHealthyPercent: 100,
      circuitBreaker: { rollback: true },
      assignPublicIp: true,
      taskSubnets: { subnets: [appSubnet] },
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
      taskImageOptions: {
        image: arm64Image('packages/frontend/Dockerfile'),
        containerPort: 80,
        environment: { API_HOST: 'localhost' },
      },
    });

    service.taskDefinition.addContainer('api', {
      image: arm64Image('packages/api/Dockerfile'),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'api' }),
      environment: {
        DB_HOST: db.dbInstanceEndpointAddress,
        DB_PORT: db.dbInstanceEndpointPort,
        DB_NAME,
      },
      secrets: {
        DB_USER: ecs.Secret.fromSecretsManager(db.secret!, 'username'),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(db.secret!, 'password'),
        JWT_SECRET: ecs.Secret.fromSecretsManager(jwtSecret),
      },
      // RDS enforces TLS; no-verify skips the RDS CA check so the image needs no CA bundle.
      // The generated password excludes URL-reserved characters, so it is safe to embed unencoded.
      command: [
        'sh',
        '-c',
        'export DATABASE_URL="postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=no-verify" && exec node dist/index.js',
      ],
    });

    db.connections.allowDefaultPortFrom(service.service);

    new CfnOutput(this, 'Url', { value: `http://${service.loadBalancer.loadBalancerDnsName}` });
  }
}
