import './server.ts';

const { default: app, startServer } = (await import('./server.ts'));

if (process.env.NODE_ENV !== 'production') {
  startServer();
}

export default app;
