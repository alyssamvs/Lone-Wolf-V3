document.addEventListener("DOMContentLoaded", function () {
    // Select the message box
    const messageBox = document.getElementById("message");

    // Initialize Scrollama
    const scroller = scrollama();

    // Setup Scrollama with steps
    scroller
        .setup({
            step: ".step", // Elements that trigger the event
            offset: 0.5, // Trigger halfway in the viewport
            debug: false, // Set to true to visualize triggers
        })
        .onStepEnter((response) => {
            // Get the step number
            const step = response.element.dataset.step;
            
            // Update the message box based on the step
            messageBox.textContent = `Now on Step ${step}`;
            
            // Add an active class (for styling)
            response.element.classList.add("active");
        })
        .onStepExit((response) => {
            // Remove active class when the step exits
            response.element.classList.remove("active");
        });

    // Resize listener (important for responsiveness)
    window.addEventListener("resize", scroller.resize);
});