const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.PORT || 4002,
  path: '/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000,
};

const healthCheck = http.request(options, (res) => {
  if (res.statusCode === 200 || res.statusCode === 400) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

healthCheck.on('error', () => {
  process.exit(1);
});

healthCheck.write(JSON.stringify({
  query: '{ __schema { types { name } } }',
}));

healthCheck.end();