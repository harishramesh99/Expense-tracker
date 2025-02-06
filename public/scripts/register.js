document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmpassword");

    // Check if form and fields are found
    if (!form || !password || !confirmPassword) {
        console.error("Form or fields not found!");
        return;
    }

    const errorMessage = document.createElement("p");
    errorMessage.style.color = "red";
    errorMessage.style.fontSize = "0.9em";
    errorMessage.style.marginTop = "5px";
    confirmPassword.insertAdjacentElement("afterend", errorMessage);

    // Function to validate password match
    function validatePasswords() {
        if (password.value !== confirmPassword.value) {
            errorMessage.textContent = "Passwords do not match.";
            return false;
        } else {
            errorMessage.textContent = "";
            return true;
        }
    }

    // Add event listener for password matching
    confirmPassword.addEventListener("input", validatePasswords);

    // Submit the form with validation
    form.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent form from submitting immediately

        // Validate passwords before submitting the form
        if (!validatePasswords()) {
            alert("Please ensure passwords match before submitting the form.");
            return; // Stop form submission if passwords don't match
        }

        // If passwords match, allow the form to submit
        form.submit();
    });
});
