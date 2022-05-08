import * as net from 'net';
import {MyEventEmitter} from './myEventEmitter';

import * as yargs from 'yargs';
import * as chalk from 'chalk';
import {Request} from './dataType';

function printColor(color:string, body:string):void {
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

const client = net.connect({port: 30605}); // default port
const socket = new MyEventEmitter(client);

let req:Request = {
  user: '',
  title: '',
  body: '',
  color: '',
  type: 'list',
};


export function checkColor(color:string):string {
  const colors: string[] = ['red', 'green', 'blue', 'yellow'];
  let finalColor:string = '';
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
      let finalColor:string = ' ';
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

client.write(JSON.stringify(req) + '\n', (err) => {
  if (err) {
    console.log(chalk.red.inverse('Error: ' + err));
  } else {
    console.log(chalk.green('Request sent'));
  };
});

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


socket.on('close', () => {
  console.log(chalk.red.inverse('Connection closed'));
});

client.on('error', (err) => {
  console.log(chalk.red.inverse('Error: ' + err));
});

client.on('close', () => {
  console.log(chalk.red.inverse('Connection closed'));
});