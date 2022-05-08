import {expect} from 'chai';
import 'mocha';
import {NotesManager} from '../src/notesManager';

const testNote: NotesManager = new NotesManager();
describe('Tests NotesManager Methods', () => {
  it('There must be a class Notes', () => {
    expect(NotesManager).to.exist;
  });
  it('Add note test', () => {
    expect(testNote.addNote('Adrian', 'Prueba', 'Esto es una prueba', 'yellow').state).to.equal(1);
  });
  it('Read Note test', () => {
    expect(testNote.readNote('Adrian', 'Prueba').state).to.equal(1);
  });
  it('Edit test4 green must work', () => {
    expect(testNote.editNote('Adrian', 'Prueba', 'Esto es una modificacion', 'green').state).to.equal(1);
  });
  it('Read test6 yellow must work', () => {
    expect(testNote.listNotes('Adrian').state).to.equal(1);
  });
  it('Read test8 blue must work', () => {
    expect(testNote.removeNote('Adrian', 'Prueba').state).to.equal(1);
  });
});