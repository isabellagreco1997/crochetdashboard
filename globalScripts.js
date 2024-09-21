// Listen for changes in the starting method dropdown
document.getElementById('starting-method').addEventListener('change', function () {
    var selectedValue = this.value;
    
    var amigurumiDisplay = document.getElementById('pattern');
    var crochetDisplay = document.getElementById('pattern-display');

    // Hide both displays initially
    amigurumiDisplay.style.display = 'none';
    crochetDisplay.style.display = 'none';

    // Show the appropriate display based on the selected value
    if (selectedValue === 'magic-ring') {
        amigurumiDisplay.style.display = 'block';
    } else if (selectedValue === 'custom-round') {
        crochetDisplay.style.display = 'block';
    }
});

// Text options for dynamic change
const textOptions = [
    "a bear plushie",
    "a duck plushie",
    "a vase of flowers",
    "a cozy blanket",
    "a cat plushie",
    "a cute hat",
    "a scarf",
    "a set of coasters"
  ];
  
  // Get the dynamic text element
  const dynamicTextElement = document.querySelector('.dynamic-text');
  
  // Counter to track the current text
  let currentTextIndex = 0;
  
  // Function to change text every 2 seconds
  function changeText() {
    dynamicTextElement.textContent = textOptions[currentTextIndex];
    currentTextIndex = (currentTextIndex + 1) % textOptions.length; // Cycle through the text options
  }
  
  // Call the function every 2 seconds
  setInterval(changeText, 2000);
  