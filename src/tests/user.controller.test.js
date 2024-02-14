require('dotenv').config();
const request = require('supertest')

const baseURL = 'http://localhost:' + process.env.PORT

test('user creates account with valid information provided and no photo', async () => {
    const newUser = {
        first_name: 'stan',
        last_name: 'desu',
        email: 'standesu@email.com',
        password: '0123456789abcdef',
        number: '0917 123 4567'
    }
    const createUser = await request(baseURL).post('/api/createUser').send(newUser);
    expect(createUser.statusCode).toBe(201)
});

test('user creates account with email already in use', async () => {
    const newUser1 = {
        first_name: 'stan',
        last_name: 'desu',
        email: 'desustan@email.com',
        password: '0123456789abcdef',
        number: '0917 123 4567'
    }
    const newUser2 = {
        first_name: 'stan',
        last_name: 'used',
        email: 'desustan@email.com',
        password: '01236789bcdef',
        number: '0917 123 4567'
    }
    const createUser1 = await request(baseURL).post('/api/createUser').send(newUser1);
    expect(createUser1.statusCode).toBe(201);
    const createUser2 = await request(baseURL).post('/api/createUser').send(newUser2);
    expect(createUser2.statusCode).toBe(400);
});