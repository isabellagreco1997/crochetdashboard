let currentRound = 1;
let lastRoundPattern = "";
let pattern = [];
let repeatCount = 0;
let repeatStartRound = null;
let lastIncreaseBase = 3;
let totalStitches = 6;
let repeatInProgress = false;

const startMagicRingButton = document.getElementById('start-magic-ring');
const decreaseButton = document.getElementById('add-decrease');

// Load the saved pattern from localStorage when the page loads
window.addEventListener('load', () => {
  const savedPattern = localStorage.getItem('crochetPattern');
  const savedCurrentRound = localStorage.getItem('currentRound');
  const savedTotalStitches = localStorage.getItem('totalStitches');
  
  if (savedPattern) {
    pattern = JSON.parse(savedPattern);
    currentRound = savedCurrentRound ? parseInt(savedCurrentRound) : 1;
    totalStitches = savedTotalStitches ? parseInt(savedTotalStitches) : 6;
    updatePatternDisplay();
  }

  // Check if the magic ring is already in the pattern
  if (pattern.some(p => p.includes("Magic ring"))) {
    startMagicRingButton.disabled = true;
    startMagicRingButton.classList.add('disabled');
  }

  // Disable the decrease button if total stitches is 6 or less
  updateButtonStates();
});

startMagicRingButton.addEventListener('click', () => {
  const magicRingStitches = document.getElementById('magic-ring-input').value;
  totalStitches = parseInt(magicRingStitches); // Set initial stitch count
  const startPattern = `Round 1: Magic ring with ${magicRingStitches} stitches. (${totalStitches} sts)`;
  pattern.push(startPattern);
  lastRoundPattern = startPattern;
  lastIncreaseBase = 1;
  repeatCount = 0;
  repeatInProgress = false;
  currentRound++;
  
  // Disable the magic ring button and add disabled class for visual cue
  startMagicRingButton.disabled = true;
  startMagicRingButton.classList.add('disabled');
  
  savePattern(); // Save the pattern to localStorage
  updatePatternDisplay();
});

document.getElementById('add-increase').addEventListener('click', () => {
  totalStitches += Math.floor(totalStitches / lastIncreaseBase); // Calculate total stitches after increase
  const increasePattern = `Round ${currentRound}: 1 sc in each of the next ${lastIncreaseBase} stitches, INC. (${totalStitches} sts)`;
  pattern.push(increasePattern);
  lastRoundPattern = increasePattern;
  lastIncreaseBase++;
  repeatCount = 0;
  repeatInProgress = false;
  currentRound++;
  
  savePattern(); // Save the pattern to localStorage
  updatePatternDisplay();

  // Update button states after adding increase
  updateButtonStates();
});

decreaseButton.addEventListener('click', () => {
  if (totalStitches > 6) {
    if (totalStitches === 12) {
      totalStitches = 6; // Reduce to 6 after full DEC
      const decreasePattern = `Round ${currentRound}: 6 DEC. (${totalStitches} sts)`;
      pattern.push(decreasePattern);
    } else {
      totalStitches -= Math.floor(totalStitches / lastIncreaseBase); // Calculate total stitches after decrease
      const decreasePattern = `Round ${currentRound}: 1 sc in each of the next ${lastIncreaseBase - 1} stitches, DEC. (${totalStitches} sts)`;
      pattern.push(decreasePattern);
    }
    lastRoundPattern = pattern[pattern.length - 1];
    lastIncreaseBase = Math.max(lastIncreaseBase - 1, 1);
    repeatCount = 0;
    repeatInProgress = false;
    currentRound++;
    
    savePattern(); // Save the pattern to localStorage
    updatePatternDisplay();
    
    // Update button states after decreasing
    updateButtonStates();
  }
});

document.getElementById('repeat-round').addEventListener('click', () => {
  if (!repeatInProgress) {
    repeatStartRound = currentRound;
    repeatInProgress = true;
    pattern.push(`Round ${currentRound}: 1 sc in each stitch. (${totalStitches} sts)`);
  } else {
    repeatCount++;
    pattern.pop();
    const repeatPattern = `Round ${repeatStartRound}-${currentRound}: 1 sc in each stitch. (${totalStitches} sts)`;
    pattern.push(repeatPattern);
  }
  currentRound++;
  
  savePattern(); // Save the pattern to localStorage
  updatePatternDisplay();
});

document.getElementById('delete-last-round').addEventListener('click', () => {
  if (pattern.length > 0) {
    pattern.pop();
    currentRound--;
    
    savePattern(); // Save the updated pattern to localStorage
    updatePatternDisplay();
  }
});

document.getElementById('fasten-off').addEventListener('click', () => {
  const fastenOffPattern = "Fasten off and leave a long tail.";
  pattern.push(fastenOffPattern);
  
  savePattern(); // Save the pattern to localStorage
  updatePatternDisplay();
});

document.getElementById('add-yarn-color').addEventListener('click', () => {
  const yarnColor = document.getElementById('yarn-color').value;
  const colorPattern = `With ${yarnColor} yarn.`;
  pattern.push(colorPattern);
  
  savePattern(); // Save the pattern to localStorage
  updatePatternDisplay();
});

document.getElementById('clear-pattern').addEventListener('click', () => {
  pattern = [];
  currentRound = 1;
  totalStitches = 6;

  // Re-enable the magic ring button and reset its style
  startMagicRingButton.disabled = false;
  startMagicRingButton.classList.remove('disabled');
  
  savePattern(); // Save the cleared pattern to localStorage
  updatePatternDisplay();
});

// Function to update button states based on the number of stitches
function updateButtonStates() {
  if (totalStitches <= 6) {
    decreaseButton.disabled = true;
    decreaseButton.classList.add('disabled');
  } else {
    decreaseButton.disabled = false;
    decreaseButton.classList.remove('disabled');
  }
}

function updatePatternDisplay() {
  const formattedPattern = pattern.map((line) => {
    const updatedLine = line.replace(/(Round (\d+)(-\d+)?:)/, (match) => `<b>${match}</b>`);
    return updatedLine;
  }).join('<br>');
  document.getElementById('pattern').innerHTML = formattedPattern;
}

// Save the pattern to localStorage
function savePattern() {
  localStorage.setItem('crochetPattern', JSON.stringify(pattern));
  localStorage.setItem('currentRound', currentRound);
  localStorage.setItem('totalStitches', totalStitches);
}
