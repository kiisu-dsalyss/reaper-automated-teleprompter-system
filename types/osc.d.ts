// types/osc.d.ts
declare module 'osc' {
    type OscType = number | string | object | boolean;
  
    interface Options {
      metadata?: boolean;
      unpackSingleArgs?: boolean;
    }
  
    class Message {
      address: string;
      args: OscType[];
      constructor(address: string, ...args: OscType[]);
    }
  
    class Client {
      constructor(address: string, port: number, options?: Options);
      send(message: Message, callback?: (error?: Error) => void): void;
      close(): void;
    }
  
    class Server {
      constructor(port: number, address: string, callback?: () => void);
      on(event: 'message', callback: (message: Message) => void): void;
      close(): void;
    }
  }
  