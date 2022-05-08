import {EventEmitter} from 'events';

export class MyEventEmitter extends EventEmitter {
  constructor(connection: EventEmitter) {
    super();
    let completeMessage: string = '';
    connection.on('data', (dataChunk) => {
      completeMessage += dataChunk;

      let limit: number = completeMessage.indexOf('\n');
      while (limit !== -1) {
        const message: string = completeMessage.substring(0, limit);
        completeMessage = completeMessage.substring(limit + 1);
        this.emit('message', JSON.parse(message));
        limit = completeMessage.indexOf('\n');
      }
    });
  }
}