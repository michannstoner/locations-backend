import { LocationStack } from "./LocationStack";
import { App } from 'aws-cdk-lib';

const app = new App();
const locationStack = new LocationStack(app, 'Locations', {
  stackName: 'Locations'
})