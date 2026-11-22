export abstract class Connector {
  private connectionUrl;
  constructor(connectionUrl: string) {
    this.connectionUrl = connectionUrl;
  }
}
