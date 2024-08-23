import User from '../models/User';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  if (event.node.req.method === 'POST') {
    const body = await readBody(event);
    
    const user = await User.findOne({ where: { name: body.name } });
    if (!user) {
      return { success: false, message: 'Пользователь не найден' };
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Неверный пароль' };
    }

    return { success: true, user: { id: user.id, name: user.name } };
  }
});