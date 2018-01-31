import { GraphQLConnector } from 'graphql-rest-helpers';

// see connector.ts in XKCD or Numbers sources 
// for how to setup a Connector class
export default class MockConnector extends GraphQLConnector {
  constructor() {
    super();
  }
}