
// document.addEventListener("DOMContentLoaded", () => {
// const form = document.querySelector("form");
// const email = document.getElementById("email");
// const password = document.getElementById("password");
// const errorMessage = document.createElement("p");
// errorMessage.style.color = "red";
// errorMessage.style.fontSize = "0.9em";
// errorMessage.style.marginTop = "5px";
// form.insertAdjacentElement("beforeend", errorMessage);

// // Email validation function
// function validateEmail() {
// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// if (!emailRegex.test(email.value)) {
//     errorMessage.textContent = "Please enter a valid email address.";
//     return false;
// } else {
//     errorMessage.textContent = "";
//     return true;
// }
// }

// // Password validation function
// function validatePassword() {
// if (password.value.trim() === "") {
//     errorMessage.textContent = "Password cannot be empty.";
//     return false;
// }
// errorMessage.textContent = "";
// return true;
// }

// // Add event listeners for real-time validation
// email.addEventListener("input", validateEmail);
// password.addEventListener("input", validatePassword);

// // Prevent form submission if validation fails
// form.addEventListener("submit", (event) => {
// const isEmailValid = validateEmail();
// const isPasswordValid = validatePassword();

// if (!isEmailValid || !isPasswordValid) {
//     event.preventDefault();
//     alert("Please fix the errors before logging in.");
// }
// });
// });
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevents default submission for debugging
        console.log("Login button clicked"); // Check if this appears in the console

        // Manually submit the form for testing
        form.submit();
    });
});
