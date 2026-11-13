import { App } from 'aws-cdk-lib';
import { InventrixStack } from '../lib/inventrix-stack.js';

const app = new App();
new InventrixStack(app, 'Inventrix', { env: { region: 'us-east-1' } });
