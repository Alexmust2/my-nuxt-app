import User from '../models/User';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  
  if (method === 'GET') {
    const users = await User.findAll();
    return users;
  }
  
  if (method === 'POST') {
    const body = await readBody(event);
    const newUser = await User.create(body);
    return newUser;
  }
});