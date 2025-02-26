import mongoose from 'mongoose';
import { userModel } from '@/models/user.model.js';
// dotenv.config({ path: path.resolve(import.meta.dirname, '..', '.env') });

async function main() {
  mongoose.connect('mongodb://127.0.0.1:5172/firefly').then(() => {
    console.log('database connected');
  });
  const data = await userModel.find();
  console.log(data);
  mongoose.disconnect().then(() => {
    console.log('database disconnected');
  });
}

// env.validate();
main();
