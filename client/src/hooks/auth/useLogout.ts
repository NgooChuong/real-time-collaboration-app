import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import useAxiosPrivate from '../useAxiosPrivate';
import posthog from 'posthog-js';
const useLogout = () => {
  const { setCurrentUser } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  return useMutation(() => axiosPrivate.post('/api/auth/logout'), {
    onSuccess: () => {
      posthog.reset();
      setCurrentUser(undefined);
    },
    onError: (err) => {
      console.error(err);
    },
  });
};

export default useLogout;
