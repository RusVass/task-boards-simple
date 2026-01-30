import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import '../styles/globals.scss';

export const App = (): JSX.Element => {
  return <RouterProvider router={router} />;
};
