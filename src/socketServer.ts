import {EventEmitter} from 'events';
import {MyEventEmitter} from './myEventEmitter';
import * as net from 'net';
import * as chalk from 'chalk';
import {Response} from './dataType';
import {NotesManager} from './notesManager';

/**
 * Clase que hereda de EventEmitter que gestionará el envío de respuestas
 * desde el servidor al cliente
 */
export class EventEmitterServer extends EventEmitter {
  private _port: number;
  private _res: Response = {
    user: '',
    state: 0,
    type: 'list',
  };

  constructor(port?: number) {
    super();
    this._port = port || 30605;
    const note = new NotesManager();
    const server = net.createServer((socket) => {
      console.log(chalk.green('Connection established'));
      const socketController = new MyEventEmitter(socket);
      socketController.on('message', (message) => {
        const petition = message;
        console.log(chalk.green(`Received petition.`));
        switch (petition.type) {
          case 'add':
            console.log(chalk.green(`Adding note...`));
            this._res = note.addNote(petition.user, petition.title, petition.body, petition.color);
            break;
          case 'read':
            console.log(chalk.green(`Reading note...`));
            this._res = note.readNote(petition.user, petition.title);
            break;
          case 'list':
            console.log(chalk.green(`Listing notes...`));
            this._res = note.listNotes(petition.user);
            break;
          case 'remove':
            console.log(chalk.green(`Removing note...`));
            this._res = note.removeNote(petition.user, petition.title);
            break;
          case 'edit':
            console.log(chalk.green(`Editing note...`));
            this._res = note.editNote(petition.user, petition.title, petition.body, petition.color);
            break;
          default:
            console.log(chalk.red.inverse(`Unknown petition.`));
            this._res.state = 0;
            this._res.error = 'Unknown petition.';
            break;
        }
        socket.write(JSON.stringify(this._res) + '\n', (err) => {
          if (err) {
            console.log(chalk.red.inverse('Error: ' + err));
          } else {
            console.log(chalk.green('Response sent'));
          }
        });
        socket.on('close', () => {
          console.log(chalk.green('Connection closed'));
        });
      });
    });
    server.listen(this._port, () => {
      console.log(chalk.green(`Server listening on port ${this._port}.`));
    });
  }
}

new EventEmitterServer(30605);