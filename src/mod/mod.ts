import { Document, Schema, model, connect } from 'mongoose';

connect('mongodb://127.0.0.1:27017/users', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
}).then(() => {
  console.log('Connected to the database');
}).catch(() => {
  console.log('Something went wrong when conecting to the database');
});

interface UserInterface extends Document {
  name: string,
  surnames: string,
  age: number,
  email: string,
  password: string
}

const UserSchema = new Schema<UserInterface>({
  name: {
    type: String,
    required: true,
  },
  surnames: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = model<UserInterface>('Note', UserSchema);

const user = new User({
  name: 'Adrian',
  surnames: 'Ramos',
  age: 23,
  email: 'email@edu.es',
  password: 'psswd'
});

const test = new User({
  name: 'Prueba',
  surnames: 'Mod',
  age: 1,
  email: 'prueba@edu.es',
  password: 'test'
});

user.save().then((result) => {
  console.log(result);
}).catch((error) => {
  console.log(error);
});

test.save().then((result) => {
  console.log(result);
}).catch((error) => {
  console.log(error);
});

const filter = user.email?{email: user.email}:{};
User.find(filter).then((result) => {
  console.log('Se ha encontrado al menos un usuario con este email:');
  console.log(result);
}).catch((error) => {
  console.log(error);
});

