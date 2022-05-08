import * as fs from 'fs';
import {Response} from './dataType';
import {NotesType} from './dataType';
import { notesManagement } from './notesManagement';

export class NotesManager implements notesManagement {
    private _path: string = '';
    private _res: Response = {
      user: '',
      state: 0,
      type: 'list',
    };
    constructor() {
    }

    private establishPath(user:string):void {
      this._path = user;
    }

    private addFolder() {
      if (!fs.existsSync(this._path)) {
        fs.mkdirSync(this._path, {recursive: true});
      }
    }

    private travelNotes(path:string) {
      const note = JSON.parse(fs.readFileSync(path, 'utf8'));
      return note;
    }

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