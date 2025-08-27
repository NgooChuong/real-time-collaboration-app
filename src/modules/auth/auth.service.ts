type AuthUser = { id: string; email: string };

const fakeUsers: Record<string, AuthUser & { password: string }> = {};

export const authService = {
  async login(email: string, password: string) {
    const user = Object.values(fakeUsers).find((u) => u.email === email && u.password === password);
    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }
    return { success: true, user: { id: user.id, email: user.email }, token: 'fake-jwt-token' };
  },
  async register(email: string, password: string) {
    const exists = Object.values(fakeUsers).some((u) => u.email === email);
    if (exists) {
      return { success: false, message: 'Email already in use' };
    }
    const id = Math.random().toString(36).slice(2);
    fakeUsers[id] = { id, email, password };
    return { success: true, user: { id, email } };
  },
};

export default authService;


