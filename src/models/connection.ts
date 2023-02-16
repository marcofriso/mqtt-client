interface ConnectionProps {
  connect: Function;
  disconnect: Function;
  connectionStatus: string;
  setUsername: Function;
  connectedUser: string;
}

interface ConnectionFormValues {
  clientId: string;
  host: string;
  port: number;
  username: string;
}

export type { ConnectionProps, ConnectionFormValues };
