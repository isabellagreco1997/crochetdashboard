let currentRound = 1;
let pattern = [];
let totalStitches = 0;
let isChainStarted = false;
let increaseInterval = 0;
let initialStitches = 6; // Will be set when starting the magic ring

const startMagicRingButton = document.getElementById('start-magic-ring');
const decreaseButton = document.getElementById('add-decrease');
const increaseButton = document.getElementById('add-increase');
const repeatButton = document.getElementById('repeat-round');

// Function to get the selected stitch from the dropdown
function getSelectedStitch(dropdownId) {
  const stitchDropdown = document.getElementById(dropdownId);
  return stitchDropdown.options[stitchDropdown.selectedIndex].value;  // Return the selected stitch abbreviation
}

// Load the saved pattern from localStorage when the page loads
window.addEventListener('load', () => {
  const savedPattern = localStorage.getItem('crochetPattern');
  const savedCurrentRound = localStorage.getItem('currentRound');
  const savedTotalStitches = localStorage.getItem('totalStitches');
  const savedStartingMethod = localStorage.getItem('startingMethod');
  const savedIncreaseInterval = localStorage.getItem('increaseInterval');
  const savedInitialStitches = localStorage.getItem('initialStitches');

  if (savedPattern) {
    pattern = JSON.parse(savedPattern);
    currentRound = savedCurrentRound ? parseInt(savedCurrentRound) : 1;
    totalStitches = savedTotalStitches ? parseInt(savedTotalStitches) : 0;
    increaseInterval = savedIncreaseInterval ? parseInt(savedIncreaseInterval) : 0;
    initialStitches = savedInitialStitches ? parseInt(savedInitialStitches) : 6;
    updatePatternDisplay();
  }

  // Set the starting method if saved
  if (savedStartingMethod) {
    document.getElementById('starting-method').value = savedStartingMethod;
    document.getElementById('starting-method').dispatchEvent(new Event('change'));
  }

  // Disable the magic ring button if already started
  if (pattern.some(p => p.includes("Magic ring"))) {
    startMagicRingButton.disabled = true;
    startMagicRingButton.classList.add('disabled');
  }

  // Disable the chain button if already started
  if (pattern.some(p => p.includes("Chain"))) {
    isChainStarted = true;
    document.getElementById('start-chain').disabled = true;
    document.getElementById('start-chain').classList.add('disabled');
  }

  // Update button states
  updateButtonStates();
});

// Event listener for the starting method selection
document.getElementById('starting-method').addEventListener('change', function() {
  const selectedMethod = this.value;
  localStorage.setItem('startingMethod', selectedMethod);

  // Hide all controls
  document.getElementById('magic-ring-controls').style.display = 'none';
  document.getElementById('chain-controls').style.display = 'none';
  document.getElementById('custom-round-controls').style.display = 'none';

  // Show the selected controls
  if (selectedMethod === 'magic-ring') {
    document.getElementById('magic-ring-controls').style.display = 'block';
  } else if (selectedMethod === 'chain') {
    document.getElementById('chain-controls').style.display = 'block';
  } else if (selectedMethod === 'custom-round') {
    document.getElementById('custom-round-controls').style.display = 'block';
  }
});

// -------------- Magic Ring Controls --------------

startMagicRingButton.addEventListener('click', () => {
  const magicRingStitches = parseInt(document.getElementById('magic-ring-input').value);
  totalStitches = magicRingStitches;
  initialStitches = magicRingStitches; // Set initial stitches for future increases
  increaseInterval = 0; // Reset increase interval
  const startPattern = `Round 1: Magic ring with ${magicRingStitches} stitches. (${totalStitches} sts)`;
  pattern.push(startPattern);
  currentRound++;

  // Disable the magic ring button and add disabled class for visual cue
  startMagicRingButton.disabled = true;
  startMagicRingButton.classList.add('disabled');

  savePattern(); // Save the pattern to localStorage
  updatePatternDisplay();

  updateButtonStates();
});

document.getElementById('add-increase').addEventListener('click', () => {
  if (totalStitches < 1) {
    alert("Cannot increase stitches because total stitches are less than 1.");
    return;
  }

  const selectedStitch = getSelectedStitch('crochet-stitch');  // Get the selected stitch

  let patternText = '';
  if (increaseInterval === 0) {
    // First increase round after magic ring
    patternText = `Round ${currentRound}: INC in each stitch around. (${totalStitches + initialStitches} sts)`;
  } else {
    // Subsequent increase rounds
    patternText = `Round ${currentRound}: *1 ${selectedStitch} in each of next ${increaseInterval} sts, INC in next st*, repeat around. (${totalStitches + initialStitches} sts)`;
  }

  totalStitches += initialStitches; // Increase total stitches by initialStitches
  increaseInterval++; // Increase the interval between increases
  pattern.push(patternText);
  currentRound++;

  savePattern();
  updatePatternDisplay();

  updateButtonStates();
});

decreaseButton.addEventListener('click', () => {
  const selectedStitch = getSelectedStitch('crochet-stitch');  // Get the selected stitch
  if (totalStitches > initialStitches) {
    increaseInterval--; // Decrease the interval between decreases
    if (increaseInterval < 0) increaseInterval = 0;

    totalStitches -= initialStitches; // Decrease total stitches by initialStitches

    let patternText = '';
    if (increaseInterval === 0) {
      patternText = `Round ${currentRound}: DEC in each stitch around. (${totalStitches} sts)`;
    } else {
      patternText = `Round ${currentRound}: *1 ${selectedStitch} in each of next ${increaseInterval} sts, dec over next 2 sts*, repeat around. (${totalStitches} sts)`;
    }

    pattern.push(patternText);
    currentRound++;

    savePattern();
    updatePatternDisplay();

    updateButtonStates();
  }
});

document.getElementById('repeat-round').addEventListener('click', () => {
  if (totalStitches <= 0) {
    alert("Cannot repeat round because total stitches are less than or equal to 0.");
    return;
  }
  const selectedStitch = getSelectedStitch('crochet-stitch');  // Get the selected stitch
  const repeatPattern = `Round ${currentRound}: 1 ${selectedStitch} in each stitch. (${totalStitches} sts)`;
  pattern.push(repeatPattern);
  currentRound++;

  savePattern(); // Save the pattern to localStorage
  updatePatternDisplay();
});

document.getElementById('delete-last-round').addEventListener('click', () => {
  if (pattern.length > 0) {
    const lastEntry = pattern.pop();
    currentRound--;

    // Adjust totalStitches and increaseInterval if necessary
    if (lastEntry.includes('INC in each stitch around')) {
      totalStitches -= initialStitches;
      increaseInterval = Math.max(0, increaseInterval - 1);
    } else if (lastEntry.includes('INC in next st')) {
      totalStitches -= initialStitches;
      increaseInterval = Math.max(0, increaseInterval - 1);
    } else if (lastEntry.includes('DEC in each stitch around')) {
      totalStitches += initialStitches;
      increaseInterval++;
    } else if (lastEntry.includes('DEC over next 2 sts')) {
      totalStitches += initialStitches;
      increaseInterval++;
    } else if (lastEntry.includes('(') && lastEntry.includes('sts)')) {
      // Extract total stitches from the last entry if possible
      const matches = lastEntry.match(/\((\d+)\s*sts\)/);
      if (matches && matches[1]) {
        totalStitches = parseInt(matches[1]);
      }
    }

    savePattern();
    updatePatternDisplay();

    updateButtonStates();
  }
});

document.getElementById('fasten-off').addEventListener('click', () => {
  const fastenOffPattern = "Fasten off and leave a long tail.";
  pattern.push(fastenOffPattern);

  savePattern(); // Save the pattern to localStorage
  updatePatternDisplay();
});

document.getElementById('clear-pattern').addEventListener('click', () => {
  if (confirm("Are you sure you want to clear the entire pattern?")) {
    pattern = [];
    currentRound = 1;
    totalStitches = 0;
    increaseInterval = 0;
    initialStitches = 6;

    // Re-enable the magic ring button and reset its style
    startMagicRingButton.disabled = false;
    startMagicRingButton.classList.remove('disabled');

    savePattern(); // Save the cleared pattern to localStorage
    updatePatternDisplay();

    updateButtonStates();
  }
});

document.getElementById('add-yarn-color').addEventListener('click', () => {
  const yarnColor = document.getElementById('yarn-color').value;
  let colorPattern = yarnColor.startsWith("Color") ? `With ${yarnColor}.` : `With ${yarnColor} yarn.`;
  pattern.push(colorPattern);
  savePattern();
  updatePatternDisplay();
});

// Add custom round in Magic Ring
document.getElementById('add-magic-ring-custom').addEventListener('click', () => {
  const customInstruction = document.getElementById('magic-ring-custom-instruction').value.trim();
  const customTotalStitches = parseInt(document.getElementById('magic-ring-custom-total-stitches').value);

  if (customInstruction && customTotalStitches > 0) {
    pattern.push(`Round ${currentRound}: ${customInstruction} (${customTotalStitches} sts)`);
    currentRound++;
    totalStitches = customTotalStitches;

    document.getElementById('magic-ring-custom-instruction').value = '';
    document.getElementById('magic-ring-custom-total-stitches').value = '';

    // Re-enable the buttons now that total stitches are specified
    updateButtonStates();

    savePattern();
    updatePatternDisplay();
  } else {
    alert("Please enter a custom instruction and specify the total stitches after this round.");
  }
});

// Disable buttons when typing in custom instruction
document.getElementById('magic-ring-custom-instruction').addEventListener('input', () => {
  const customInstruction = document.getElementById('magic-ring-custom-instruction').value.trim();

  if (customInstruction.length > 0) {
    // Disable Increase, Decrease, and Repeat buttons
    increaseButton.disabled = true;
    increaseButton.classList.add('disabled');

    decreaseButton.disabled = true;
    decreaseButton.classList.add('disabled');

    repeatButton.disabled = true;
    repeatButton.classList.add('disabled');
  } else {
    // Re-enable buttons based on totalStitches
    updateButtonStates();
  }
});

// -------------- Chain Controls --------------

document.getElementById('start-chain').addEventListener('click', () => {
  const chainLength = document.getElementById('chain-length').value;
  const startPattern = `Chain ${chainLength}.`;
  pattern.push(startPattern);
  totalStitches = parseInt(chainLength);
  isChainStarted = true;

  // Disable the chain button
  document.getElementById('start-chain').disabled = true;
  document.getElementById('start-chain').classList.add('disabled');

  savePattern();
  updatePatternDisplay();
});

document.getElementById('add-chain-instruction').addEventListener('click', () => {
  const customInstruction = document.getElementById('chain-custom-instruction').value.trim();
  if (customInstruction) {
    pattern.push(customInstruction);
    currentRound++;
    document.getElementById('chain-custom-instruction').value = '';

    savePattern();
    updatePatternDisplay();
  }
});

document.getElementById('delete-last-row-chain').addEventListener('click', () => {
  if (pattern.length > 0) {
    pattern.pop();
    currentRound = Math.max(1, currentRound - 1);
    savePattern();
    updatePatternDisplay();
  }
});

document.getElementById('fasten-off-chain').addEventListener('click', () => {
  const fastenOffPattern = "Fasten off and weave in ends.";
  pattern.push(fastenOffPattern);

  savePattern();
  updatePatternDisplay();
});

document.getElementById('clear-pattern-chain').addEventListener('click', () => {
  if (confirm("Are you sure you want to clear the entire pattern?")) {
    pattern = [];
    currentRound = 1;
    totalStitches = 0;
    isChainStarted = false;

    // Re-enable the chain button
    document.getElementById('start-chain').disabled = false;
    document.getElementById('start-chain').classList.remove('disabled');

    savePattern();
    updatePatternDisplay();
  }
});

document.getElementById('add-yarn-color-chain').addEventListener('click', () => {
  const yarnColor = document.getElementById('yarn-color-chain').value;
  let colorPattern = yarnColor.startsWith("Color") ? `With ${yarnColor}.` : `With ${yarnColor} yarn.`;
  pattern.push(colorPattern);
  savePattern();
  updatePatternDisplay();
});

// -------------- Custom Round Builder Controls --------------

document.getElementById('add-custom-round').addEventListener('click', () => {
  const customInstruction = document.getElementById('custom-round-input').value.trim();
  if (customInstruction) {
    pattern.push(customInstruction);
    currentRound++;
    document.getElementById('custom-round-input').value = '';

    savePattern();
    updatePatternDisplay();
  }
});

document.getElementById('delete-last-custom').addEventListener('click', () => {
  if (pattern.length > 0) {
    pattern.pop();
    currentRound = Math.max(1, currentRound - 1);
    savePattern();
    updatePatternDisplay();
  }
});

document.getElementById('clear-pattern-custom').addEventListener('click', () => {
  if (confirm("Are you sure you want to clear the entire pattern?")) {
    pattern = [];
    currentRound = 1;
    totalStitches = 0;

    savePattern();
    updatePatternDisplay();
  }
});

document.getElementById('add-yarn-color-custom').addEventListener('click', () => {
  const yarnColor = document.getElementById('yarn-color-custom').value;
  let colorPattern = yarnColor.startsWith("Color") ? `With ${yarnColor}.` : `With ${yarnColor} yarn.`;
  pattern.push(colorPattern);
  savePattern();
  updatePatternDisplay();
});

// -------------- Common Functions --------------

function updateButtonStates() {
  // Disable Increase button if totalStitches < 1
  if (totalStitches < 1) {
    increaseButton.disabled = true;
    increaseButton.classList.add('disabled');
  } else {
    increaseButton.disabled = false;
    increaseButton.classList.remove('disabled');
  }

  // Disable Decrease button if totalStitches <= initialStitches or totalStitches <= 0
  if (totalStitches <= initialStitches || totalStitches <= 0 || !pattern.some(p => p.includes("Round"))) {
    decreaseButton.disabled = true;
    decreaseButton.classList.add('disabled');
  } else {
    decreaseButton.disabled = false;
    decreaseButton.classList.remove('disabled');
  }

  // Disable Repeat button if totalStitches <= 0
  if (totalStitches <= 0) {
    repeatButton.disabled = true;
    repeatButton.classList.add('disabled');
  } else {
    repeatButton.disabled = false;
    repeatButton.classList.remove('disabled');
  }
}

function updatePatternDisplay() {
  const mergedPattern = [];
  let previousPattern = "";
  let previousStitchCount = "";
  let roundStart = 0;
  let roundEnd = 0;

  pattern.forEach((line, index) => {
    // Check if the line is a round (not color changes or other instructions)
    const match = line.match(/Round (\d+): (.*) \((\d+) sts\)/);

    if (match) {
      const currentRound = parseInt(match[1]);
      const currentPattern = match[2].trim();
      const currentStitchCount = match[3];

      // If this line matches the previous pattern and stitch count, extend the round range
      if (currentPattern === previousPattern && currentStitchCount === previousStitchCount) {
        roundEnd = currentRound;
      } else {
        // Push the previous round range if it exists
        if (roundStart !== 0) {
          if (roundStart === roundEnd) {
            mergedPattern.push(
              `Round ${roundStart}: ${previousPattern} (${previousStitchCount} sts)`
            );
          } else {
            mergedPattern.push(
              `Rounds ${roundStart}-${roundEnd}: ${previousPattern} (${previousStitchCount} sts)`
            );
          }
        }

        // Start a new round range
        previousPattern = currentPattern;
        previousStitchCount = currentStitchCount;
        roundStart = currentRound;
        roundEnd = currentRound;
      }
    } else {
      // If it's not a round, push the previous round range if it exists
      if (roundStart !== 0) {
        if (roundStart === roundEnd) {
          mergedPattern.push(
            `Round ${roundStart}: ${previousPattern} (${previousStitchCount} sts)`
          );
        } else {
          mergedPattern.push(
            `Rounds ${roundStart}-${roundEnd}: ${previousPattern} (${previousStitchCount} sts)`
          );
        }
        previousPattern = "";
        previousStitchCount = "";
        roundStart = 0;
        roundEnd = 0;
      }

      // Push non-round instruction as-is
      mergedPattern.push(line);
    }
  });

  // Push the last round if needed
  if (roundStart !== 0) {
    if (roundStart === roundEnd) {
      mergedPattern.push(
        `Round ${roundStart}: ${previousPattern} (${previousStitchCount} sts)`
      );
    } else {
      mergedPattern.push(
        `Rounds ${roundStart}-${roundEnd}: ${previousPattern} (${previousStitchCount} sts)`
      );
    }
  }

  // Display the merged pattern with bold formatting for both single and multiple rounds
  const formattedPattern = mergedPattern
    .map((line) => {
      // Add bold to both "Round" and "Rounds" cases
      const updatedLine = line.replace(/(Rounds? \d+(-\d+)?):/, (match) => `<b>${match}</b>`);
      return updatedLine;
    })
    .join("<br>");
    
  document.getElementById("pattern").innerHTML = formattedPattern;
}



function savePattern() {
  localStorage.setItem('crochetPattern', JSON.stringify(pattern));
  localStorage.setItem('currentRound', currentRound);
  localStorage.setItem('totalStitches', totalStitches);
  localStorage.setItem('increaseInterval', increaseInterval);
  localStorage.setItem('initialStitches', initialStitches);
}

document.addEventListener("DOMContentLoaded", function () {
  const startingMethodDropdown = document.getElementById("starting-method");
  const magicRingControls = document.getElementById("magic-ring-controls");
  const chainControls = document.getElementById("chain-controls");

  // Get the pattern display elements
  const crochetPatternDisplay = document.getElementById("crochet-pattern-display");
  const amigurumiPatternDisplay = document.getElementById("amigurumi-pattern-display");

  // Show/hide relevant controls and pattern displays based on the dropdown selection
  startingMethodDropdown.addEventListener("change", function () {
      const selectedMethod = this.value;

      // Hide both displays initially
      crochetPatternDisplay.style.display = 'none';
      amigurumiPatternDisplay.style.display = 'none';

      if (selectedMethod === 'magic-ring') {
          magicRingControls.style.display = "block";    // Show Amigurumi Pattern Builder controls
          chainControls.style.display = "none";         // Hide Crochet Pattern Builder controls
          
          amigurumiPatternDisplay.style.display = "block";  // Show Amigurumi pattern display
      } else if (selectedMethod === 'custom-round') {
          magicRingControls.style.display = "none";     // Hide Amigurumi Pattern Builder controls
          chainControls.style.display = "block";        // Show Crochet Pattern Builder controls

          crochetPatternDisplay.style.display = "block";    // Show Crochet pattern display
      }
  });

  // Trigger an initial state based on the current selection
  const initialSelection = startingMethodDropdown.value;
  if (initialSelection === "magic-ring") {
      magicRingControls.style.display = "block";
      chainControls.style.display = "none";
      amigurumiPatternDisplay.style.display = "block";
      crochetPatternDisplay.style.display = "none";
  } else {
      magicRingControls.style.display = "none";
      chainControls.style.display = "block";
      amigurumiPatternDisplay.style.display = "none";
      crochetPatternDisplay.style.display = "block";
  }
});
