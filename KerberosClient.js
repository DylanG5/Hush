const { Client } = require('node-krb5');

class KerberosClient {
  constructor() {
    this.kerberosClient = new Client();
  }

  async authenticate(username, password) {
    try {
      // Authenticate user with Kerberos server
      const ticket = await this.kerberosClient.getPasswordGrant(username, password);
      return ticket;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  async requestServiceTicket(serviceName, tgt) {
    try {
      // Request service ticket from Kerberos server
      const serviceTicket = await this.kerberosClient.getServiceTicket(tgt, serviceName);
      return serviceTicket;
    } catch (error) {
      console.error('Service ticket request error:', error);
      throw error;
    }
  }
}

export default KerberosClient;
