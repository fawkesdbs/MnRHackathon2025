import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const GoogleAuthSuccess = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard');
    }
  }, [token, navigate]);

  return <p>Signing you in with Google...</p>;
};

export default GoogleAuthSuccess;
