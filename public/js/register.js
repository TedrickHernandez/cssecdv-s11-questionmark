document.addEventListener('DOMContentLoaded', (e) => {
    const json = document.getElementById('userJSON')
    document.getElementById('userJSON').addEventListener('change', function() {
        const fileInput = this.files[0];
        const formData = new FormData();
        console.log(formData);
        formData.append('userJSON', fileInput);

        // fetch('/register', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: formData
        // })
        // .then(response => response.url)
        // .then(url => window.location = url)
    });
    document.getElementById('regbtn').addEventListener('click', function(e) {
        console.log('form submit');
        e.preventDefault(); // Prevent the default form submission

        // Create a FormData object to collect form data
        const formData = new FormData(document.getElementById('reg'));
        if (json) {
            console.log('json found');
        } else {
            formData.delete('userJSON')
        }

        // Send the form data to the server
        fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: formData
        })
        .then(response => response.url)
        .then(url => window.location = url)
        .catch(error => {
            console.error('Error:', error);
            // Handle any network errors or exceptions
        });
    });

})