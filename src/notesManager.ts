import * as fs from 'fs';
import {Response} from './dataType';
// import {NotesProperties} from './dataType';
// import {notesManagement} from './notesManagement'

export class NotesManager {
  private _path: string = '';
  private _response: Response = {
    user: '',
    state: 0,
    type: 'list',
  };

  constructor() {}

  private establishPath(user: string): void {
    this._path = user;
  }

  private addFolder() {
    if (!fs.existsSync(this._path)) {
      fs.mkdirSync(this._path, {recursive: true});
    }
  }

  public addNote(user:string, title:string, body:string, color:string): Response {
    this.establishPath(user);
    this.addFolder();
    const filepath = `${this._path}/${title}.json`;
    if (!fs.existsSync(filepath)) {
      fs.writeFileSync(this._path + '/' + title + '.json', JSON.stringify({
        title: title,
        body: body,
        color: color,
      }));
      this._response = {
        user: user,
        state: 1,
        type: 'add',
        title: title,
        body: body,
        color: color,
      };
    } else {
      this._response = {
        user: user,
        state: 0,
        type: 'add',
        title: title,
        body: body,
        color: color,
        err: 'The Note Already Exists.',
      };
    }
    return this._response;
    }
}