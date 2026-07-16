const http = require('http');

const data = JSON.stringify({
  context: {
    role: "staff",
    timestamp: "2026-07-16T12:00:00Z"
  }
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/ai/crowd',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let responseData = '';
  res.on('data', d => {
    responseData += d;
  });
  res.on('end', () => {
    console.log(responseData);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
