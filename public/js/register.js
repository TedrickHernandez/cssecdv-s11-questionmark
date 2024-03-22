document.addEventListener('DOMContentLoaded', (e) => {
    const json = document.getElementById('userJSON')
    // document.getElementById('userJSON').addEventListener('change', function() {
    //     const fileInput = this.files[0];
    //     const formData = new FormData();
    //     console.log(formData);
    //     formData.append('userJSON', fileInput);

    //     fetch('/register', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: formData
    //     })
    //     .then(response => response.url)
    //     .then(url => window.location = url)
    // });
    // document.getElementById('regbtn').addEventListener('click', function(e) {
    //     console.log('form submit');
    //     e.preventDefault(); // Prevent the default form submission

    //     // Create a FormData object to collect form data
    //     const formData = new FormData(document.getElementById('reg'));

    //     const photo = document.querySelector("#profilePhoto").files[0]

    //     const userInfo = {
    //         firstName: formData.get('firstName'),
    //         lastName: formData.get('lastName'),
    //         email: formData.get('email'),
    //         phoneNumber: formData.get('phoneNumber'),
    //         profilePhoto: photo,
    //         password: formData.get('password')
    //     }

    //     const reqOptions = {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(userInfo)
    //     }

    //     fetch('/register', reqOptions)
    //     .then(response => response.url)
    //     .then(url => window.location = url)
    // });

})