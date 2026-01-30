import { Link } from 'react-router-dom';

export const NotFoundPage = (): JSX.Element => {
  return (
    <div className="container">
      <h1>Not found</h1>
      <Link to="/">Go home</Link>
    </div>
  );
};
