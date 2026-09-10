const login = async (email, password) => {
    setError(null);
    try {
      // Must be /users/login instead of /auth/login or /login
      const res = await API.post('/users/login', { email, password });
      saveAuthSession(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      // Must be /users/register
      const res = await API.post('/users/register', { name, email, password });
      saveAuthSession(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const googleLogin = async (googlePayload) => {
    setError(null);
    try {
      // Must be /users/google
      const res = await API.post('/users/google', googlePayload);
      saveAuthSession(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Google authentication failed.';
      setError(msg);
      throw new Error(msg);
    }
  };