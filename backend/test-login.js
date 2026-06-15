const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:4000/api/v1/auth/login', {
      email: 'admin@prebite.com',
      password: 'admin123'
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}

testLogin();
