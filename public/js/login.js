document.addEventListener('DOMContentLoaded', (e) => {
    let params = (new URL(document.location)).searchParams;
    let err = params.get("e");
    if (e) {
        document.getElementById('error').innerHTML = 'Invalid credentials.'
    }
    const form = document.querySelector('#login');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('user submitted login form');

        const formData = new FormData(form);

        const userInfo = {
            email: formData.get('email'),
            password: formData.get('password')
        }

        const reqOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userInfo)
        }

        fetch('api/verifyUser', reqOptions)
        .then(response => response.url)
        .then(url => window.location = url)
    })
})