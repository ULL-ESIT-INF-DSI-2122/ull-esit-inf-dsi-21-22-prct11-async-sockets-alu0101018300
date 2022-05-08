import {EventEmitter} from 'events';
import {MyEventEmitter} from './myEventEmitter';
import * as net from 'net';
import chalk from 'chalk';
import {Response} from './dataType';
import {NotesManager} from './notesManager';

export class EventEmitterServer extends EventEmitter {
  private _port: number;
  private _res: Response = {
    user: '',
    state: 0,
    type: 'list',
  };

  constructor(port?:number) {
    super();
    this._port = port || 60305;
    const note: NotesManager = new NotesManager();
    const server = net.createServer((socket) => {
      console.log(chalk.green.inverse('Connection Established'));
      const serverSocket = new MyEventEmitter(socket);
      serverSocket.on('data', (data) => {
        const petition = data;
        console.log(chalk.green(`Received petition.`));
        switch (petition.type) {
          case 'add':
            console.log(chalk.green(`Adding new note...`));
            this._res = note.addNote(petition.user, petition.title, petition.body, petition.color);
            break;
          case 'read':
            console.log(chalk.green(`Reading a note...`));
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
          case 'modify':
            console.log(chalk.green(`Editing note...`));
            this._res = note.editNote(petition.user, petition.title, petition.body, petition.color);
            break;
          default:
            console.log(chalk.red.inverse(`Unknown Petition`));
            this._res.state = 0;
            this._res.err = 'Unknown petition.';
            break;
        }
        socket.write(JSON.stringify(this._res) + '\n', (err) => {
          if (err) {
            console.log(chalk.red.inverse('Error: ' + err));
          } else {
            console.log(chalk.green('Data Sent'));
          }
        });
        socket.on('close', () => {
          console.log(chalk.green.inverse('Connection Closed'));
        });
      });
    });
    server.listen(this._port, () => {
      console.log(chalk.green(`Server listening on port: ${this._port}.`));
    });
  }
}

new EventEmitterServer(60305);