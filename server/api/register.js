import User from '../models/User';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  
  if (method === 'GET') {
    const users = await User.findAll();
    return users;
  }
  
  if (method === 'POST') {
    const body = await readBody(event);
    
    const existingUser = await User.findOne({ where: { name: body.name } });
    if (existingUser) {
      return { success: false, message: 'Пользователь с таким именем уже существует' };
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(body.password, saltRounds);

    const newUser = await User.create({
      name: body.name,
      password: hashedPassword
    });

    return { success: true, user: { id: newUser.id, name: newUser.name } };
  }
});