import { loginUser } from '../data/api';

class AuthModel {
  static async login(email, password) {
    const result = await loginUser({ email, password });
    if (!result.success) throw new Error(result.message);
    return result.data;
  }
}

export default AuthModel;