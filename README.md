# Practica 11

En esta práctica tendrá que partir de la implementación de la aplicación de procesamiento de notas de texto que llevó a cabo en la Práctica 9 para escribir un servidor y un cliente haciendo uso de los sockets proporcionados por el módulo net de Node.js.

Las operaciones que podrá solicitar el cliente al servidor deberán ser las mismas que ya implementó durante la Práctica 9, esto es, añadir, modificar, eliminar, listar y leer notas de un usuario concreto. Un usuario interactuará con el cliente de la aplicación, exclusivamente, a través de la línea de comandos. Al mismo tiempo, en el servidor, las notas se almacenarán como ficheros JSON en el sistema de ficheros y siguiendo la misma estructura de directorios utilizada durante la Práctica 9.

## Desarrollo

Cabe destacar que todos los métodos relacionados con el procesamiento de notas ya está desarrollado, únicamente, se ha cambiado lo que retornan los métodos, por lo que únicamente comentaremos el código nuevo.

### Tipos de Datos

Como bien indicó el enunciado en el apartado de recomendaciones para el desarrollo se han creado tres tipos de datos
que se van a utilizar en el desarrollo de la práctica:

``` typescript
/**
 * Tipo de datos para las notas
 */
export type NotesType = {
  title: string;
  color: string;
  body: string;
}

/**
 * Tipo de datos para la respuesta del servidor
 */
export type Response = {
  state: number;
  title?: string;
  user?: string;
  body?: string;
  color?: string;
  error?: string;
  type: 'add' | 'read' | 'edit' | 'remove' | 'list';
  notes?: NotesType[];
}

/**
 * Tipo de datos para las peticiones del cliente
 */
export type Request = {
  user: string;
  title?: string;
  body?: string;
  color?: string;
  type: 'add' | 'read' | 'edit' | 'remove' | 'list';
}
```

En primer lugar, aparece el NotesType, el cual indica como va a ser una nota y de que atributos constará, los cuales
son título, contenido y color. Estos elementos van a usarse para desarrollar las funciones más adelante.

Seguidamente, se puede identificar el tipo de datos Response, el cual se relaciona directamente con las respuestas
que se van a enviar. Las mismas tienen como atributos obligatorios el estado, relacionado con si ha ido bien o no
el método y el tipo, el cual indica que tipo de operación realizaremos y unos cuantos optativos, como son título, color, etc. los cuales solo van a hacer falta en función de la operación que queramos realizar.

Finalmente, identificamos el tipo de datos Request, el cual se usará para realizar petiiones, los cuales tienen
como atributo obligatorio user y type, puesto que se usan en todos los comandos y optativos title, body y color.

### MyEventEmitter

``` typescript
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
```

Se ha creado la clase MyEventEmitter, la cual hereda de EventEmitter, para ser capaz de gestionar el envío
de mensajes grandes dentro de una aplicación cliente servidor. Esto se hace dividiendo el mensaje en trozos y
enviándolo para que se pueda recibir de la manera deseada.

### NotesManager

``` typescript
import * as fs from 'fs';
import {Response} from './dataType';
import {NotesType} from './dataType';
import { notesManagement } from './notesManagement';

/**
 * Clase que implementa las funcionalidades sobre las notas
 * y que retornan un tipo de datos Response
 */
export class NotesManager implements notesManagement {
    private _path: string = '';
    private _res: Response = {
      user: '',
      state: 0,
      type: 'list',
    };
    constructor() {
    }

    /**
     * Función que settea el nuevo path donde se va a trabajar
     * con las notas
     * @param user Usuario de las notas
     */
    private establishPath(user:string):void {
      this._path = user;
    }

    /**
     * Función que crea un directorio para un usuario en caso 
     * de que sea necesario
     */
    private addFolder() {
      if (!fs.existsSync(this._path)) {
        fs.mkdirSync(this._path, {recursive: true});
      }
    }

    /**
     * Función que recorre todas las notas de un usuario
     * @param path Ruta donde se alojan las notas
     */
    private travelNotes(path:string) {
      const note = JSON.parse(fs.readFileSync(path, 'utf8'));
      return note;
    }

    /**
     * Función que añade una nueva nota
     * @param user Propietario de la nota
     * @param title Título de la nota
     * @param body Contenido de la nota
     * @param color Color de la nota
     */
    public addNote(user: string, title: string, body: string, color: string): Response {
      this.establishPath(user);
      this.addFolder();
      const filepath = `${this._path}/${title}.json`;
      if (!fs.existsSync(filepath)) {
        fs.writeFileSync(this._path + '/' + title + '.json', JSON.stringify({
          title: title,
          body: body,
          color: color,
        }));
        this._res = {
          user: user,
          state: 1,
          type: 'add',
          title: title,
          body: body,
          color: color,
        };
      } else {
        this._res = {
          user: user,
          state: 0,
          type: 'add',
          title: title,
          body: body,
          color: color,
          error: 'The Note Already Exists.',
        };
      }
      return this._res;
    }

    /**
     * Función que lee el contenido de una nota
     * @param user Propietario de la nota
     * @param title Título de la nota
     */
    public readNote(user: string, title: string): Response {
      this.establishPath(user);
      const notePath: string = this._path + '/' + title + '.json';
      if (fs.existsSync(notePath)) {
        const note = this.travelNotes(notePath);
        const body = note.body;
        const color = note.color;
        this._res = {
          state: 1,
          type: 'read',
          title: title,
          body: body,
          color: color,
        };
      } else {
        this._res = {
          state: 0,
          type: 'read',
          title: title,
          error: 'The note does not exist.',
        };
      }
      return this._res;
    }

    /**
     * Función que modifica el contenido de una nota
     * @param user Propietario de la nota
     * @param title Título de la nota
     * @param body Nuevo contenido de la nota
     * @param color Nuevo color para la nota
     */
    public editNote(user: string, title: string, body: string, color: string): Response {
      this.establishPath(user);
      if (fs.existsSync(this._path + '/' + title + '.json')) {
        const note = this.travelNotes(this._path + '/' + title + '.json');
        note.body = body;
        note.color = color;
        fs.writeFileSync(this._path + '/' + title + '.json', JSON.stringify(note));
        this._res = {
          state: 1,
          type: 'edit',
          title: title,
        };
      } else {
        this._res = {
          state: 0,
          type: 'edit',
          error: 'The Note Already Exists.',
        };
      }
      return this._res;
    }

    /**
     * Función que elimina una nota
     * @param user Propietario de la nota 
     * @param title Título de la nota
     */
    public removeNote(user: string, title: string): Response {
      this.establishPath(user);
      if (fs.existsSync(this._path + '/' + title + '.json')) {
        fs.unlinkSync(this._path + '/' + title + '.json');
        this._res = {
          state: 1,
          type: 'remove',
          title: title,
        };
      } else {
        this._res = {
          state: 0,
          type: 'remove',
          title: title,
          error: 'The Note Already Exists.',
        };
      }
      return this._res;
    }

  /**
   * Función que lista todas las notas de un usuario
   * @param user Propietario de las notas que se quieren consultar
   */
  public listNotes(user: string): Response {
    const notes: NotesType[] = [];
    this.establishPath(user);
    if (fs.existsSync(this._path)) {
      const notesDir = fs.readdirSync(this._path);
      if (notesDir.length > 0) {
        for (let i: number = 0; i < notesDir.length; i++) {
          const note = this.travelNotes(this._path + '/' + notesDir[i]);
          const title = note.title;
          const color = note.color;
         notes.push({
            title: title,
            color: color,
            body: note.body,
          });
        }
        this._res = {
          state: 1,
          type: 'list',
          notes:notes,
        };
      } else {
        this._res = {
          state: 0,
          type: 'list',
          error: 'This User has NOT got notes.',
        };
      }
    } else {
      this._res = {
        state: 0,
        type: 'list',
        error: `User does NOT exists yet.`,
      };
    }
    return this._res;
  }
}
```

Esta clase es prácticamente igual a la clase realizada en la práctica 9, lo que en este caso, los métodos públicos
van a retornar un tipo de datos Response, para que al realizar la operación el servidor pueda indicar al cliente
como se han desarrollado la operación deseada como el resultado de la misma.

### SocketServer

Para que sea posible una conexión servidor cliente con sockets es necesario tener el código de ambos, en este caso 
lo hemos diferenciado en dos ficheros:

``` typescript
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
```

En este caso, simplemente se crea una clase EventEmitterServer, a la cual se le pasará un puerto donde escuchará y a su vez, la cual hereda también de EventEmitter, donde se crea un objeto MyEventEmitter para enviar la información deseada. Este recibirá una petición la cual procesará en función del tipo de comando en cuestión, para posteriormente enviar el resultado junto a un mensaje de como ha resultado el mismo, tras finalizar cierra conexión con el cliente, a pesar de que se mantiene abierto. 


### SocketClient

``` typescript
import * as net from 'net';
import {MyEventEmitter} from './myEventEmitter';

import * as yargs from 'yargs';
import * as chalk from 'chalk';
import {Request} from './dataType';

/**
 * Función que imprime una nota en el color correspondiente
 * @param color Color en el que se va a imprimir
 * @param body Contenido de la nota
 */
function printColor(color: string, body: string): void {
  if (color === 'red') {
    console.log(chalk.red(body));
  } else if (color === 'green') {
    console.log(chalk.green(body));
  } else if (color === 'blue') {
    console.log(chalk.blue(body));
  } else if (color === 'yellow') {
    console.log(chalk.yellow(body));
  }
}

const client = net.connect({port: 30605}); 
const socket = new MyEventEmitter(client);

let req: Request = {
  user: '',
  title: '',
  body: '',
  color: '',
  type: 'list',
};

/**
 * Función que comprueba que un color está dentro de los disponibles
 * @param color Color que queremos comprobar
 */
export function checkColor(color: string): string {
  const colors: string[] = ['red', 'green', 'blue', 'yellow'];
  let finalColor: string = '';
  for (let i: number = 0; i < colors.length; i++) {
    if (color === colors[i]) {
      finalColor = color;
      break;
    } else {
      finalColor = 'red';
    }
  }
  return finalColor;
}

/**
 * Comando para añadir una nota
 */
yargs.command({
  command: 'add',
  describe: 'Writing a new note',
  builder: {
    title: {
      describe: 'Title of the note',
      demandOption: true,
      type: 'string',
    },
    user: {
      describe: 'Property of the note',
      demandOption: true,
      type: 'string',
    },
    body: {
      describe: 'Content of the note',
      demandOption: true,
      type: 'string',
    },
    color: {
      describe: 'Color of the note',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.user === 'string' && typeof argv.title === 'string' && typeof argv.body === 'string' && typeof argv.color === 'string') {
      console.log(chalk.green(`Adding note`));
      let finalColor:string = ' ';
      finalColor = checkColor(argv.color);
      req = {
        user: argv.user,
        title: argv.title,
        body: argv.body,
        color: finalColor,
        type: 'add',
      };
    }
  },
});

/**
 * Comando para leer una nota
 */
yargs.command({
  command: 'read',
  describe: 'Read a certain note',
  builder: {
    title: {
      describe: 'Title of the note we want to read',
      demandOption: true,
      type: 'string',
    },
    user: {
      describe: 'Owner of the note',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.user === 'string' && typeof argv.title === 'string') {
      req = {
        user: argv.user,
        title: argv.title,
        type: 'read',
      };
    }
  },
});

/**
 * Comando para modificar una nota
 */
yargs.command({
  command: 'edit',
  describe: 'Modify the content of an already existing note',
  builder: {
    title: {
      describe: 'Title of the note we want to modify',
      demandOption: true,
      type: 'string',
    },
    user: {
      describe: 'Owner of the note',
      demandOption: true,
      type: 'string',
    },
    body: {
      describe: 'New content of the note',
      demandOption: true,
      type: 'string',
    },
    color: {
      describe: 'New Color for the note',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.user === 'string' && typeof argv.title === 'string' && typeof argv.body === 'string' && typeof argv.color === 'string') {
      let finalColor: string = ' ';
      finalColor = checkColor(argv.color);
      req = {
        user: argv.user,
        title: argv.title,
        body: argv.body,
        color: finalColor,
        type: 'edit',
      };
    }
  },
});

/**
 * Comando para eliminar una nota
 */
yargs.command({
  command: 'remove',
  describe: 'Delete a note by the title and the owner',
  builder: {
    title: {
      describe: 'Title of the note we want to remove',
      demandOption: true,
      type: 'string',
    },
    user: {
      describe: 'Owner of the note',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.user === 'string' && typeof argv.title === 'string') {
      req = {
        user: argv.user,
        title: argv.title,
        type: 'remove',
      };
    }
  },
});

/**
 * Comando para listar las notas de un usuario
 */
yargs.command({
  command: 'list',
  describe: 'List all the notes from a certain user',
  builder: {
    user: {
      describe: 'Owner of the notes',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.user === 'string') {
      req = {
        user: argv.user,
        type: 'list',
      };
    }
  },
});

yargs.parse();

/**
 * Envío de la respuesta en caso de error desde el servidor al cliente
 */
client.write(JSON.stringify(req) + '\n', (err) => {
  if (err) {
    console.log(chalk.red.inverse('Error: ' + err));
  } else {
    console.log(chalk.green('Request sent'));
  };
});

/**
 * Envío de la información necesaria en función del resultado del comando
 */
socket.on('message', (data) => {
  const aux = JSON.stringify(data); 
  const response = JSON.parse(aux);
  if (response.state === 1) {
    if (response.type === 'add') {
      console.log(chalk.green(`Note Added`));
    } else if (response.type === 'read') {
      console.log(chalk.green(`Content: `));
      printColor(response.color, response.body);
    } else if (response.type === 'list') {
      console.log(chalk.green(`Notes: `));
      response.notes.forEach((note:any) => {
        console.log(chalk.green(`Title: ${note.title}`));
        console.log('\n');
        printColor(note.color, note.body);
      },
      );
    } else if (response.type === 'remove') {
      console.log(chalk.green(`Note Removed`));
    } else if (response.type === 'edit') {
      console.log(chalk.green(`Note Edited`));
    }
  } else {
    console.log(chalk.red.inverse(`Error: ${response.error}`));
  }
  client.destroy(); 
},
);

/**
 * Gestión del cierre de la conexión con el cliente
 */
socket.on('close', () => {
  console.log(chalk.red.inverse('Connection closed'));
});

client.on('error', (err) => {
  console.log(chalk.red.inverse('Error: ' + err));
});

client.on('close', () => {
  console.log(chalk.red.inverse('Connection closed'));
});
```

En este caso, la parte del cliente es similar a la de la práctica 9, en cuanto al uso del yargs, el uso de chalk
y el método print. Lo que en este caso recibirá la información desde el servidor, la cual mostrará y en función del
tipo que sea pues indicará como ha sido la misma. Finalmente, se destruye la conexión, teniendo en cuenta todos los posibles fallos que se puedan generar.

## Pruebas

Todas las pruebas que comprueban el correcto funcionamiento del código se encuentran alojadas en el directorio *./tests*

