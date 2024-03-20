require('dotenv').config();
const request = require('supertest')

const baseURL = 'https://localhost:443'

test('user opens website with no directory should be redirected to /home', async () => {
    const res = await request(baseURL).get('/').trustLocalhost(true);
    expect(res.statusCode).toBe(302)
    expect(res.redirect).toBe(true);
    expect(res.headers['location']).toBe('/home')
})

test('user opens admin panel but should be redirected to /home', async () => {
    const res = await request(baseURL).get('/admin').trustLocalhost(true);
    expect(res.statusCode).toBe(302)
    expect(res.redirect).toBe(true);
    expect(res.headers['location']).toBe('/')
})