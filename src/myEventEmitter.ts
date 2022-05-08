import {EventEmitter} from 'events';

/**
 * Clase que hereda de EventEmitter para poder enviar mensajes
 * de manera parcial.
 */
export class MyEventEmitter extends EventEmitter {
  constructor(connection: EventEmitter) {
    super();
    let wholeData = '';
    connection.on('data', (dataChunk) => {
      wholeData += dataChunk;

      let limit = wholeData.indexOf('\n');
      while (limit !== -1) {
        const message = wholeData.substring(0, limit);
        wholeData = wholeData.substring(limit + 1);
        this.emit('message', JSON.parse(message));
        limit = wholeData.indexOf('\n');
      }
    });
  }
}