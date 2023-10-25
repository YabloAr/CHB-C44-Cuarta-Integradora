const deleteUserButtons = document.querySelectorAll('#deleteUser')

deleteUserButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Get the product's ID from a data attribute on the button
        const userId = button.dataset.user;

        // Make a fetch request to add the product to the cart using the productId
        fetch(`http://localhost:8080/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                // Handle the response, e.g., display a success message
                console.log('Usuario borrado');
                console.log('Response is:', data);
            })
            .catch(error => {
                // Handle any errors
                console.error('Error adding product to cart:', error);
            });
    });
});



