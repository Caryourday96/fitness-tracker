const port = Number(process.env.PORT || 3030);

import('./server.js').then(({ server }) => {
  server.listen(port, () => console.log(`Fitness tracker listening on port ${port}`));
}).catch((error) => {
  console.error('Unable to start the fitness tracker server.', error);
  process.exitCode = 1;
});
