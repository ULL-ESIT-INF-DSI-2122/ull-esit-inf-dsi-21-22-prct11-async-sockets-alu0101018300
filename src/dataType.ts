export type NotesType = {
  title: string;
  color: string;
  body: string;
}

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


export type Request = {
  user: string;
  title?: string;
  body?: string;
  color?: string;
  type: 'add' | 'read' | 'edit' | 'remove' | 'list';
}