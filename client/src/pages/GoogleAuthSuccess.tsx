import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const GoogleAuthSuccess = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Authenticating...</p>
    </div>
  );
};

export default GoogleAuthSuccess;