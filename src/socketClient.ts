import * as net from 'net';
import {MyEventEmitter} from './myEventEmitter';

import * as yargs from 'yargs';
import chalk from 'chalk';
import {Request} from './dataType';


function print(color: string, body: string) {
  if (color === 'red') {
    console.log(chalk.red(body));
  } 
  else if (color === 'green') {
    console.log(chalk.green(body));
  } 
  else if (color === 'blue') {
    console.log(chalk.blue(body));
  } 
  else if (color === 'yellow') {
    console.log(chalk.yellow(body));
  }
}

const client = net.connect({port: 60305}); 
const socket = new MyEventEmitter(client);

let req: Request = {
  user: '',
  title: '',
  body: '',
  color: '',
  type: 'list',
};


export function checkColor(color: string): string {
  const colors: string[] = ['red', 'green', 'blue', 'yellow'];
  let finalColor:string = '';
  for (let i: number = 0; i < colors.length; i++) {
    if (color === colors[i]) {
      finalColor = color;
      break;
    } 
    else {
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
      console.log(chalk.blue(`Adding new note...`));
      let finalColor: string = ' ';
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
    command: 'rm',
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
    command: 'ls',
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

// SENDING REQUEST TO THE SERVER


client.write(JSON.stringify(req) + '\n', (err) => {
  if (err) {
    console.log(chalk.red('Error: ' + err));
  } else {
    console.log(chalk.green('Request sent'));
  };
});

// RECEIVING RESPONSE FROM THE SERVER

socket.on('message', (data) => {
  const aux: string = JSON.stringify(data); 
  const res = JSON.parse(aux);
  if (res.state === 1) {
    if (res.type === 'add') {
      console.log(chalk.green(`Note Added`));
    }
    else if (res.type === 'read') {
      console.log(chalk.green(`Note ${res.title} Contains: `));
      print(res.color, res.body);
    } 
    else if (res.type === 'list') {
      console.log(chalk.green(`Notes: `));
      res.notes.forEach((note:any) => {
        console.log(chalk.green(`Title: ${note.title}`));
        console.log('\n');
        print(note.color, note.body);
      },
      );
    } 
    else if (res.type === 'remove') {
      console.log(chalk.green(`Note Removed`));
    }
     else if (res.type === 'edit') {
      console.log(chalk.green(`Note Modified`));
    }
  } 
  else {
    console.log(chalk.red.inverse(`Error: ${res.error}`));
  }
  client.destroy();
},
);


// CLOSING THE CONNECTION

socket.on('close', () => {
  console.log(chalk.red.inverse('Connection closed'));
});

client.on('error', (err) => {
  console.log(chalk.red.inverse('Error: ' + err));
});

client.on('close', () => {
  console.log(chalk.red.inverse('Connection closed'));
});