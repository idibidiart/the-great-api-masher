import * as fs from 'fs';
import Connector from './connector';
import Model from './model';
import resolvers from './resolvers';

export default {
  namespace: 'Mock',
  typeDefs: fs.readFileSync('./src/data-source-mock/schema.graphql', 'utf-8'),
  resolvers
};