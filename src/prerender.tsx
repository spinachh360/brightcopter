import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';

// Build-time rendering starts with an empty cart and has no customer data.
// Effects and browser storage writes run only after the browser mounts the app.
export function renderRoute(pathname: string) {
  return renderToString(<StaticRouter location={pathname}><App /></StaticRouter>);
}
