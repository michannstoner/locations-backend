import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Code, Function as LambdaFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { join } from 'path';
import { GenericTable } from "./GenericTable";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

export class LocationStack extends Stack {
  private api = new RestApi(this, 'LocationsApi');

  private locationsTable = new GenericTable(this, {
    tableName: 'LocationsTable',
    primaryKey: 'locationId',
    createLambdaPath: 'Create',
    readLambdaPath: 'Read',
    updateLambdaPath: 'Update',
    deleteLambdaPath: 'Delete'
  });


  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const helloLambda = new LambdaFunction(this, 'helloLambda', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset(join(__dirname, '..', 'services', 'hello')),
      handler: 'hello.main'
    })

    const helloLamdaNodeJs = new NodejsFunction(this, 'helloLambdaNodeJs', {
      entry: (join(__dirname, '..', 'services', 'node-lambda', 'hello.ts')),
      handler: 'handler'
    });

    const s3ListPolicy = new PolicyStatement();
    s3ListPolicy.addActions('s3:listAllMyBuckets');
    s3ListPolicy.addResources('*');
    helloLamdaNodeJs.addToRolePolicy(s3ListPolicy);


    // Hello API Lambda Integration 
    const helloLambdaIntegration = new LambdaIntegration(helloLambda);
    const helloLambdaResource = this.api.root.addResource('hello');
    helloLambdaResource.addMethod('GET', helloLambdaIntegration);

    const locationResource = this.api.root.addResource('locations');
    locationResource.addMethod('POST', this.locationsTable.createLambdaIntegration);
    locationResource.addMethod('GET', this.locationsTable.readLambdaIntegration);
    locationResource.addMethod('PUT', this.locationsTable.updateLambdaIntegration);
    locationResource.addMethod('DELETE', this.locationsTable.deleteLambdaIntegration);
  }
}
