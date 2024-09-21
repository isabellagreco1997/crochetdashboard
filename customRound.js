(function() {
    let customPattern = JSON.parse(localStorage.getItem("customPattern")) || [];
    let undoStack = [];
    let redoStack = [];
    let customCurrentRound = customPattern.length + 1;
    let isAutoRoundEnabled = true;
    let isCommaEnabled = true;
    let isFirstStitch = customPattern.length === 0;

    const customPatternDisplay = document.getElementById("pattern-display");
    const autoRoundToggle = document.getElementById("auto-round-toggle");
    const commaToggle = document.getElementById("comma-toggle");
    const addRoundButton = document.getElementById("add-round-button");
    const manualNextLineButton = document.getElementById("manual-next-line-button");
    const undoButton = document.getElementById("undo-button");
    const redoButton = document.getElementById("redo-button");
    const clearPatternButton = document.getElementById("clear-pattern-button");

    // Load pattern from localStorage on page load
    function loadPatternFromStorage() {
        customPattern = JSON.parse(localStorage.getItem("customPattern")) || [];
        updateCustomPatternDisplay();
    }

    // Save the current pattern to localStorage
    function savePatternToStorage() {
        localStorage.setItem("customPattern", JSON.stringify(customPattern));
    }

  
    
    // Function to undo the last stitch or action
    function undoLastAction() {
        if (undoStack.length > 0) {
            const lastAction = undoStack.pop();  // Get the last action from the undo stack
    
            if (lastAction.action === 'addStitch') {
                // Undo adding a stitch
                const round = customPattern[lastAction.roundIndex];
                round.stitches.pop();  // Remove the last stitch
                redoStack.push(lastAction);  // Track this in the redo stack
            } else if (lastAction.action === 'createRound') {
                // Undo creating a round
                customPattern.pop();  // Remove the last created round
                redoStack.push(lastAction);  // Track this in the redo stack
            }
    
            updateCustomPatternDisplay();
            savePatternToStorage();
            redoButton.disabled = false;  // Enable redo button
        }
    }
    
    // Function to redo the last undone action
    function redoLastAction() {
        if (redoStack.length > 0) {
            const lastAction = redoStack.pop();  // Get the last undone action from the redo stack
    
            if (lastAction.action === 'addStitch') {
                // Redo adding a stitch
                const round = customPattern[lastAction.roundIndex];
                round.stitches.splice(lastAction.stitchIndex, 0, { text: lastAction.stitch });
                undoStack.push(lastAction);  // Move the action back to the undo stack
            } else if (lastAction.action === 'createRound') {
                // Redo creating a round
                customPattern.push({ stitches: [], totalStitches: 0, isUnnamedRound: false });  // Recreate the round
                undoStack.push(lastAction);  // Move the action back to the undo stack
            }
    
            updateCustomPatternDisplay();
            savePatternToStorage();
            if (redoStack.length === 0) {
                redoButton.disabled = true;  // Disable redo button if there are no more actions to redo
            }
        }
    }
    

    


    // Clear the entire pattern
    function clearPattern() {
        customPattern = [];
        undoStack = [];
        redoStack = [];
        updateCustomPatternDisplay();
        localStorage.removeItem("customPattern");
        redoButton.disabled = true;
    }

    function updateCustomPatternDisplay() {
        customPatternDisplay.innerHTML = ""; // Clear the pattern display
    
        let roundNumber = 1; // Keep track of the actual numbered rounds
    
        customPattern.forEach((round, roundIndex) => {
            const roundDiv = document.createElement("div");
            roundDiv.classList.add("round");
    
            // Add Edit/Save button
            const editButton = document.createElement("button");
            editButton.textContent = "✎"; // Using an icon for the button
            editButton.classList.add("edit-button");
            editButton.dataset.roundIndex = roundIndex;
    
            // Create round content based on whether the round is unnamed or not
            const roundContent = document.createElement("span");
            roundContent.classList.add("round-content");
    
            // If the round is numbered, display the round count
            if (!round.isUnnamedRound) {
                roundContent.innerHTML = `Round ${roundNumber}: `;
                roundNumber++; // Increment round number only for numbered rounds
            } else {
                // For unnamed rounds, don't show any round count
                roundContent.innerHTML = ""; 
            }
    
            // Insert button before the round content
            roundDiv.appendChild(editButton);
            roundDiv.appendChild(roundContent);
    
            // Track the number of valid stitches (ignore line breaks)
            let validStitchCount = 0;
    
            // Add each stitch for the round
            round.stitches.forEach((stitch, stitchIndex) => {
                const stitchSpan = document.createElement("span");
                stitchSpan.classList.add("stitch-item");
    
                // Handle line breaks visually without counting them as stitches
                if (stitch.text === "\n") {
                    const lineBreak = document.createElement("br");
                    roundContent.appendChild(lineBreak); // Insert a line break in the display
                } else {
                    stitchSpan.textContent = stitch.text;
                    roundContent.appendChild(stitchSpan);
                    validStitchCount++;  // Increment count only for valid stitches
                }
    
                const stitchInput = document.createElement("input");
                stitchInput.type = "text";
                stitchInput.classList.add("stitch-input");
                stitchInput.value = stitch.text;
                stitchInput.dataset.stitchIndex = stitchIndex;
                stitchInput.style.display = "none"; // Hide input by default
    
                roundContent.appendChild(stitchInput);
            });
    
            // Add the stitch count input and display at the end of the round-content
            const stitchCountInput = document.createElement("input");
            stitchCountInput.type = "number";
            stitchCountInput.classList.add("stitch-count-input");
            stitchCountInput.placeholder = "Add stitch count"; // Placeholder
            stitchCountInput.value = validStitchCount || ""; // Start with no value
    
            // Initially hide the input (only show in edit mode)
            stitchCountInput.style.display = "none";
    
            const stitchCountDisplay = document.createElement("span");
            stitchCountDisplay.classList.add("stitch-count-display");
    
            // Show the stitch count only for valid stitches
            if (validStitchCount > 0) {
                stitchCountDisplay.textContent = ` (${validStitchCount} stitches)`; // Display actual count
            } else {
                stitchCountDisplay.textContent = ""; // Hide if there are no valid stitches
            }
    
            // Add stitch count input and display to the round content (after stitches)
            roundContent.appendChild(stitchCountInput);
            roundContent.appendChild(stitchCountDisplay);
    
            // Append the entire roundDiv to the pattern display
            customPatternDisplay.appendChild(roundDiv);
    
            // Attach event listener to the Edit/Save button
            editButton.addEventListener("click", function() {
                toggleEditMode(roundIndex);
            });
        });
    
        savePatternToStorage(); // Save the updated pattern
    }
    
    
    
    
    

    function toggleEditMode(roundIndex) {
        const roundDiv = customPatternDisplay.children[roundIndex];
        const editButton = roundDiv.querySelector(".edit-button");
        const stitchItems = roundDiv.querySelectorAll(".stitch-item");
        const stitchInputs = roundDiv.querySelectorAll(".stitch-input");
        const stitchCountInput = roundDiv.querySelector(".stitch-count-input");
        const stitchCountDisplay = roundDiv.querySelector(".stitch-count-display");

        if (editButton.textContent === "✎") {
            // Switch to edit mode
            editButton.textContent = "✔"; // Change to save icon

            // Make all stitches editable
            stitchItems.forEach(stitch => stitch.style.display = "none"); // Hide stitch display
            stitchInputs.forEach(input => input.style.display = "inline-block"); // Show inputs for stitches

            // Show stitch count input, hide stitch count display
            stitchCountInput.style.display = "inline-block"; // Show input in edit mode
            stitchCountDisplay.style.display = "none"; // Hide display in edit mode
        } else {
            // Switch to save mode
            editButton.textContent = "✎"; // Change back to edit icon

            // Save and update all stitches
            stitchInputs.forEach((input, inputIndex) => {
                const stitchItem = stitchItems[inputIndex];

                // Save the new stitch values
                stitchItem.textContent = input.value;
                stitchItem.style.display = "inline-block"; // Show stitch text
                input.style.display = "none"; // Hide input after saving

                // Update the stitch in the pattern
                customPattern[roundIndex].stitches[inputIndex].text = input.value;
            });

            // Save the stitch count for the round
            const totalStitches = parseInt(stitchCountInput.value) || 0;
            customPattern[roundIndex].totalStitches = totalStitches;

            // Update the display for total stitches
            if (totalStitches > 0) {
                stitchCountDisplay.textContent = ` (${totalStitches} stitches)`; // Display count if > 0
                stitchCountDisplay.style.display = "inline-block"; // Show display in saved mode
            } else {
                stitchCountDisplay.textContent = ""; // Hide if count is 0
            }

            stitchCountInput.style.display = "none"; // Hide input after saving
        }
    }

    // Add a stitch to the pattern
    function addCustomStitch(stitch) {
        // Ensure that a round exists before adding stitches
        if (customPattern.length === 0) {
            // Automatically create a new round if none exists
            customPattern.push({ stitches: [], totalStitches: 0 });
        }
    
        const lastRound = customPattern[customPattern.length - 1];
        lastRound.stitches.push({ text: stitch });
    
        // Track adding a stitch as a separate action
        undoStack.push({ action: 'addStitch', roundIndex: customPattern.length - 1, stitchIndex: lastRound.stitches.length - 1, stitch });
    
        updateCustomPatternDisplay();
        savePatternToStorage();
    }

    function addNextLine() {
        if (isAutoRoundEnabled) {
            // If auto-round is enabled, create a new numbered round
            customPattern.push({ stitches: [], totalStitches: 0, isUnnamedRound: false });
            customCurrentRound++;
        } else {
            // If auto-round is disabled, create a new unnamed round (no round count)
            customPattern.push({ stitches: [], totalStitches: 0, isUnnamedRound: true });
        }
    
        // Track this round creation as a separate action (without adding any stitches)
        undoStack.push({ action: 'createRound', roundIndex: customPattern.length - 1 });
        redoStack = [];  // Clear the redo stack when a new action occurs
        updateCustomPatternDisplay();
        savePatternToStorage();
    }
    
    





    // Handle the toggle for auto-rounds
    autoRoundToggle.addEventListener("change", function() {
        isAutoRoundEnabled = this.checked;
        addRoundButton.style.display = isAutoRoundEnabled ? "none" : "block";
    });

    // Handle the toggle for comma behavior
    commaToggle.addEventListener("change", function() {
        isCommaEnabled = this.checked;
    });

    // Manually add a round when pressing the "Add Round" button
    addRoundButton.addEventListener("click", function() {
        customPattern.push({ stitches: [], totalStitches: 0 }); // Initialize totalStitches for the new round
        customCurrentRound++;
        updateCustomPatternDisplay();
    });

    // Handle the manual next line button if the toggle is off
    manualNextLineButton.addEventListener("click", addNextLine);

    // Add event listeners for each button
    document.querySelectorAll(".block-button").forEach(button => {
        button.addEventListener("click", function() {
            const action = this.getAttribute("data-action");
            let stitchText = "";

            switch (action) {
                case "chain":
                    stitchText = "CH";
                    break;
                case "skip":
                    stitchText = "SK";
                    break;
                case "sc":
                    stitchText = "SC";
                    break;
                case "hdc":
                    stitchText = "HDC";
                    break;
                case "dc":
                    stitchText = "DC";
                    break;
                case "tc":
                    stitchText = "TC";
                    break;
                case "sl-st":
                    stitchText = "SL ST";
                    break;
                case "inc":
                    stitchText = "INC";
                    break;
                case "dec":
                    stitchText = "DEC";
                    break;
                case "ch-sp":
                    stitchText = "CH SP";
                    break;
                case "v-stitch":
                    stitchText = "V-Stitch";
                    break;
                case "shell-stitch":
                    stitchText = "Shell Stitch";
                    break;
                case "picot":
                    stitchText = "Picot";
                    break;
                case "cluster":
                    stitchText = "Cluster";
                    break;
                case "flo":
                    stitchText = "FLO";
                    break;
                case "blo":
                    stitchText = "BLO";
                    break;
                case "fpdc":
                    stitchText = "FPDC";
                    break;
                case "next-line":
                    addNextLine();
                    return; // Exit, no need to add a stitch
                default:
                    console.error("Unknown action:", action);
                    return;
            }

            addCustomStitch(stitchText + (isCommaEnabled ? ", " : " "));
        });
    });

    // Load the saved pattern on page load
    window.addEventListener("load", loadPatternFromStorage);

    // Attach event listeners for Undo, Redo, and Clear buttons
    undoButton.addEventListener("click", undoLastAction);
    redoButton.addEventListener("click", redoLastAction);
    clearPatternButton.addEventListener("click", clearPattern);

})();


