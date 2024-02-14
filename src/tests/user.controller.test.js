require('dotenv').config();
const request = require('supertest')

const baseURL = 'http://localhost:' + process.env.PORT

test('user creates account with valid information provided and no photo', async() => {
    const newUser = {
        first_name: 'stan',
        last_name: 'desu',
        email: 'standesu@email.com',
        password: '0123456789abcdef',
        number: '0917 123 4567'
    }
    const res = await request(baseURL).post('/api/createUser').send(newUser);
});