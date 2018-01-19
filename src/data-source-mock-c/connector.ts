import { GraphQLConnector } from '@gramps/rest-helpers';

// see connector.ts in XKCD or Numbers sources 
// for how to setup a Connector class
export default class MockConnectorC extends GraphQLConnector {
  constructor() {
    super();
  }
}