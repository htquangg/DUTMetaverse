import React from 'react';
import CONFIG from '@tlq/config';
// import store from '@/store';
import MainRoutes from './routes';
import { BrowserRouter as Router } from 'react-router-dom';
// import { setupInterceptor } from '@/utils/http';

export default function () {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // setupInterceptor(store);
    setMounted(true);
  }, []);

  return mounted ? (
    <Router basename={CONFIG.baseURL}>
      <MainRoutes />
    </Router>
  ) : null;
}
