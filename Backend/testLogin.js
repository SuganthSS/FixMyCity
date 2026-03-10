import axios from 'axios';

async function testAdminLogin() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@example.com',
            password: 'admin123',
        });
        console.log('Login successful:');
        console.log(JSON.stringify(res.data, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Login failed:');
        if (error.response) {
            console.error(error.response.status, error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

testAdminLogin();
