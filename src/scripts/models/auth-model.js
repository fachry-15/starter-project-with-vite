import { loginUser } from '../data/api';

class AuthModel {
  static async login(email, password) {
    const result = await loginUser({ email, password });
    if (!result.success) throw new Error(result.message);
    
    // Pindahkan logika penyimpanan data ke dalam Model
    localStorage.setItem('authToken', result.data.token);
    localStorage.setItem('userData', JSON.stringify({
      userId: result.data.userId,
      name: result.data.name,
      email: email
    }));

    return result.data;
  }
}

export default AuthModel;