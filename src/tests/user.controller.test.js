require('dotenv').config();
const request = require('supertest')

const baseURL = 'http://localhost:' + process.env.PORT

const defaultEmail = 'standesu@email.com'
const defaultPassword = 'rs'
const defaultUser = {
    firstName: 'stan',
    lastName: 'desu',
    email: defaultEmail,
    password: defaultPassword,
    phoneNumber: '0917 123 4567'
}
beforeAll(async () => {
    console.log('test');
    jest.setTimeout(100000); // change timeout to 10 seconds
});

test('user creates account with valid information provided and no photo', async () => {
    const createUser = await request(baseURL).post('/api/createUser').send(defaultUser);
    expect(createUser.statusCode).toBe(302)
});

test('user creates account with invalid email', async () => {
    const newUser = Object.assign({}, defaultUser, {});
    newUser.email = 'INVALID EMAIL';
    const createUser = await request(baseURL).post('/api/createUser').send(newUser);
    expect(createUser.statusCode).toBe(422)
});

test('user creates account with invalid number', async () => {
    const newUser = Object.assign({}, defaultUser, {});
    newUser.phoneNumber = 'INVALID NUMBER';
    const createUser = await request(baseURL).post('/api/createUser').send(newUser);
    expect(createUser.statusCode).toBe(422)
});

test('user creates account w/o photo but email already in use', async () => {
    const newUser1 = {
        firstName: 'stan',
        lastName: 'desu',
        email: 'desustan@email.com',
        password: defaultPassword,
        phoneNumber: '0917 123 4567'
    }
    const newUser2 = {
        firstName: 'stan',
        lastName: 'used',
        email: 'desustan@email.com',
        password: defaultPassword,
        phoneNumber: '0917 123 4567'
    }
    const createUser1 = await request(baseURL).post('/api/createUser').send(newUser1);
    expect(createUser1.statusCode).toBe(302);
    const createUser2 = await request(baseURL).post('/api/createUser').send(newUser2);
    expect(createUser2.statusCode).toBe(302);
}, 10000);

test('admin verifies with correct email and password', async () => {
    const verifyUser = await request(baseURL).post('/api/verifyUser').send({ email: defaultEmail, password: defaultPassword })
    .expect(302)
    .expect('Location', '/admin')
})

test('user verifies with correct email and password', async () => {
    const verifyUser = await request(baseURL).post('/api/verifyUser').send({ email: 'desustan@email.com', password: defaultPassword })
    .expect(302)
    .expect('Location', '/')
})

test('user verifies with correct email but wrong password', async () => {
    const verifyUser = await request(baseURL).post('/api/verifyUser').send({ email: defaultEmail, password: 'defaultPassword' });
    expect(verifyUser.headers.location).toBe('/login?e=1')
    expect(verifyUser.statusCode).toBe(302)
})

test('user verifies with email not in db', async () => {
    const verifyUser = await request(baseURL).post('/api/verifyUser').send({ email: 'defaultEmail@email.com', password: 'defaultPassword' });
    expect(verifyUser.headers.location).toBe('/login?e=1')
    expect(verifyUser.statusCode).toBe(302)
})