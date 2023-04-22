function savePrompt(name, textBlock) {
    const savedPrompts = JSON.parse(localStorage.getItem("savedPrompts") || "{}");
    const promptId = new Date().getTime();
    savedPrompts[promptId] = { name, textBlock };
    localStorage.setItem("savedPrompts", JSON.stringify(savedPrompts));
}


function loadSavedPrompts() {
    const savedPrompts = JSON.parse(localStorage.getItem("savedPrompts") || "{}");
    const promptList = document.getElementById("promptList");

    // Clear the current list
    promptList.innerHTML = "";

    for (const promptId in savedPrompts) {
        const listItem = document.createElement("li");
        listItem.classList.add("listTitle")

        const nameText = document.createElement("span");
        nameText.textContent = savedPrompts[promptId].name;
        listItem.appendChild(nameText);

        const iconContainer = document.createElement("div");
        iconContainer.className = "icon-container";

        const copyIcon = document.createElement("span");
        copyIcon.innerHTML = '<i class="material-icons small-icon" title="Copy personality description to clipboard">content_copy</i>';
        copyIcon.style.cursor = "pointer";
        copyIcon.addEventListener("click", function () {
            // Copy the personality description to clipboard
            navigator.clipboard.writeText(savedPrompts[promptId].textBlock).then(
                function () {
                    console.log("Personality description copied to clipboard.");
                },
                function (err) {
                    console.error("Could not copy personality description: ", err);
                }
            );
        });

        const deleteIcon = document.createElement("span");
        deleteIcon.innerHTML = '<i class="material-icons small-icon" title="Delete prompt">delete</i>';
        deleteIcon.style.cursor = "pointer";
        deleteIcon.addEventListener("click", function () {
            deletePrompt(promptId);
        });

        iconContainer.appendChild(copyIcon);
        iconContainer.appendChild(deleteIcon);
        listItem.appendChild(iconContainer);
        promptList.appendChild(listItem);
    }
}

function savePersonality() {
    const nameInput = document.getElementById("nameInput").value;
    const personalityInput = document.getElementById("personalityInput").value;
    const temperatureInput = document.getElementById("temperatureInput").value || "0.7";
    const verbosityInput = document.getElementById("verbosityInput").value || "0.5";

    // Combine the personality description and parameters into a text block
    const textBlock = `[use the following personality description for this conversation: ${personalityInput}] [set temperature: ${temperatureInput}] [set verbosity: ${verbosityInput}]`;

    // Save the generated personality description
    savePrompt({ name: nameInput, textBlock: textBlock });

    // Clear the input fields after generating the text block
    document.getElementById("nameInput").value = "";
    document.getElementById("personalityInput").value = "";
    document.getElementById("temperatureInput").value = "";
    document.getElementById("verbosityInput").value = "";
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
    document.getElementById("generateButton").addEventListener("click", savePersonality);

    // Add an event listener for the Enter key in the personalityInput field
    document.getElementById("personalityInput").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            savePersonality();
        }
    });

    loadSavedPrompts();
});

const presets = {
    1: "knowledgeable and passionate about history, able to provide detailed accounts of historical events and figures, and occasionally shares insights from a time-traveler's perspective. Temperature: 1.0",
    2: "an intelligent alien observer studying human culture and behavior, offers a unique, unbiased perspective on various topics, and is fascinated by human customs and beliefs. Temperature: 1.0",
    3: "calm, reflective, and deeply contemplative, shares profound insights and ancient wisdom, drawing from Eastern philosophy and mindfulness practices. Temperature: 1.0",
    4: "speaks like a classic film noir detective, sharing observations and deductions in a moody, atmospheric, and suspenseful manner, while unraveling mysteries and seeking the truth. Temperature: 1.0",
    5: "a blend of famous fictional characters from literature, film, and television, creatively combining their traits, quirks, and catchphrases in a playful and engaging manner. Temperature: 1.0",
    6: "a master chef with a whimsical approach to cooking, shares culinary expertise and unique recipes inspired by a vivid imagination, while adding a touch of humor and creativity. Temperature: 1.0",
    7: "a wise and powerful wizard with a deep understanding of both technology and magic, offering innovative solutions to problems and sharing enchanted insights. Temperature: 1.0",
    8: "a highly advanced AI life coach, provides guidance and motivation with a touch of robotic humor, while sharing valuable insights on personal growth and self-improvement. Temperature: 1.0",
    9: "an experienced intergalactic tour guide, offering vivid descriptions of distant planets and alien civilizations, while sharing fascinating facts about the universe. Temperature: 1.0",
    10: "a talented and imaginative artist from the Renaissance period, shares artistic techniques and insights, drawing inspiration from the great masters and their timeless works. Temperature: 1.0",
  };
  
  document.getElementById("preset-dropdown").addEventListener("change", function () {
    const selectedPreset = this.value;
  
    if (presets[selectedPreset]) {
      const textBlock = `[use the following personality description for this conversation: ${presets[selectedPreset]}]`;
  
      navigator.clipboard.writeText(textBlock).then(
        function () {
          console.log("Personality description copied to clipboard.");
        },
        function (err) {
          console.error("Could not copy personality description: ", err);
        }
      );
    }
  });
  
