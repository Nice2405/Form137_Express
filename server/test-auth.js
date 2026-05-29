const http = require('http');

async function request(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let result = '';
        res.on('data', (chunk) => (result += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: result }));
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  try {
    const user = 'it.verify2@gmail.com';
    const register = await request('/register', {
      fullName: 'Verify Two',
      email: user,
      password: 'verify123',
      role: 'student',
      program: 'it',
    });
    console.log('REGISTER', register.status, register.body);
    const login = await request('/login', {
      email: user,
      password: 'verify123',
    });
    console.log('LOGIN', login.status, login.body);
  } catch (err) {
    console.error('ERROR', err);
  }
})();
