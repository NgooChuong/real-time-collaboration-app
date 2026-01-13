import { useMutation } from '@tanstack/react-query';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AxiosError, AxiosResponse } from 'axios';
import posthog from 'posthog-js';
const login = ({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<AxiosResponse<ApiResponse<User>>> => {
  return api.post(
    '/api/auth/login',
    { username, password },
    { withCredentials: true },
  );
};

const useLogin = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  return useMutation(login, {
    onSuccess: (data) => {
      setCurrentUser(data.data.data);
      const user = data.data.data;
      posthog.identify(user.id.toString(), {
        email: user.username,
        name: user.username,
      });
      navigate('/');
    },
    onError: (err: AxiosError<{ message: string }>) => {
      throw err;
    },
  });
};

export default useLogin;
