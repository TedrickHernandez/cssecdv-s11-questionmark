document.addEventListener('DOMContentLoaded', (e) => {
    editMode = false

    const button = document.querySelector('#editBtn');
    button.addEventListener('click', (e) => {
        console.log(editMode);
        const name = document.querySelector('#name')
        if (!editMode) {
            name.contentEditable = 'true';
            button.innerHTML = 'Save';
        } else {
            name.contentEditable = 'false';
            button.innerHTML = 'Edit Own Profile';
            const newName = {
                last_name: name.innerHTML.split(',', 2)[0].trim(),
                first_name: name.innerHTML.split(',', 2)[1].trim()
            }

            const reqOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newName)
            }

            fetch('editProfile', reqOptions)
            .then(response => response.url)
            .then(url => window.location = url)
        }
        editMode = !editMode
    })
})