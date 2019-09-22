class UserService {
  public async getUsers() {
    try {
      const response = await fetch("/api/users").then(res => res.json());
      return { response };
    } catch (e) {
      return { error: e };
    }
  }

  public async getUserById(id: string) {
    const response = await fetch(`/api/users/${id}`);
    return response;
  }

  public async postUser(userData: { [k: string]: any }) {
    const response = await fetch(`/api/users`, {
      method: "POST",
      body: new URLSearchParams(userData)
    });
    return response;
  }

  public async postLogin(userData: { [k: string]: any }) {
    const response = await fetch(`/api/login`, {
      method: "POST",
      body: new URLSearchParams(userData)
    });
    return response;
  }
}

export default new UserService();
