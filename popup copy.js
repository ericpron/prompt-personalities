function savePrompt(textBlock) {
    const savedPrompts = JSON.parse(localStorage.getItem("savedPrompts") || "{}");
    const promptId = new Date().getTime();
    savedPrompts[promptId] = textBlock;
    localStorage.setItem("savedPrompts", JSON.stringify(savedPrompts));
  }
  
  function savePersonality() {
    const personalityInput = document.getElementById("personalityInput").value;
  
    // Combine the personality description into a text block
    const textBlock = `[use the following personality description for this conversation: ${personalityInput}]`;
  
    // Display the generated text block
    const output = document.getElementById("output");
    output.textContent = textBlock;
  
    // Save the generated personality description
    savePrompt(textBlock);
  
    // Clear the personalityInput field after generating the text block
    document.getElementById("personalityInput").value = "";
  }

  function loadSavedPrompts() {
    // Load the saved prompts from local storage and display them in a list
    chrome.storage.local.get("savedPrompts", function (data) {
      const savedPrompts = data.savedPrompts || {};
      const promptList = document.getElementById("promptList");
  
      // Clear the current list
      promptList.innerHTML = "";
  
      for (const promptId in savedPrompts) {
        const listItem = document.createElement("li");
        listItem.textContent = savedPrompts[promptId];
      
        const copyIcon = document.createElement("span");
        copyIcon.innerHTML = '<i class="material-icons small-icon" title="Copy prompt to clipboard">content_copy</i>';
        copyIcon.style.cursor = "pointer";
        copyIcon.addEventListener("click", function () {
          // Copy the prompt text to clipboard
          navigator.clipboard.writeText(savedPrompts[promptId]).then(
            function () {
              console.log("Prompt copied to clipboard.");
            },
            function (err) {
              console.error("Could not copy prompt: ", err);
            }
          );
        });
  
        const deleteIcon = document.createElement("span");
        deleteIcon.innerHTML = '<i class="material-icons small-icon" title="Delete prompt">delete</i>';
        deleteIcon.style.cursor = "pointer";
        deleteIcon.addEventListener("click", function () {
          deletePrompt(promptId);
        });      
  
        listItem.appendChild(copyIcon);
        listItem.appendChild(deleteIcon);
        promptList.appendChild(listItem);
      }
    });
  }

  function deletePrompt(promptId) {
    const savedPrompts = JSON.parse(localStorage.getItem("savedPrompts") || "{}");
  
    if (savedPrompts[promptId]) {
      delete savedPrompts[promptId];
      localStorage.setItem("savedPrompts", JSON.stringify(savedPrompts));
      loadSavedPrompts(); // Reload the list of saved prompts
    }
  }
  
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("generateButton").onclick = savePersonality;

  // Add an event listener for the Enter key in the personalityInput field
  document.getElementById("personalityInput").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      savePersonality();
    }
  });

  loadSavedPrompts();
});
  
  