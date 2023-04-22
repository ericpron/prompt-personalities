function savePrompt(name, textBlock) {
    const savedPrompts = JSON.parse(localStorage.getItem("savedPrompts") || "{}");
    const promptId = new Date().getTime();
    savedPrompts[promptId] = { name, textBlock };
    localStorage.setItem("savedPrompts", JSON.stringify(savedPrompts));
    loadSavedPrompts();
}

function showToast() {
    const toast = document.getElementById("toast");
    toast.classList.remove("hidden");
    toast.classList.add("visible");
    setTimeout(() => {
        toast.classList.remove("visible");
        toast.classList.add("hidden");
    }, 3000); // Display the toast for 3 seconds
}

function populateHistoricalFiguresDropdown(historicalFigures) {
    const historicalPeopleDropdown = document.getElementById("historicalPeopleDropdown");

    historicalFigures.forEach(function (person) {
        const option = document.createElement("option");
        option.value = JSON.stringify(person);
        option.textContent = person.name;
        historicalPeopleDropdown.appendChild(option);
    });

    historicalPeopleDropdown.addEventListener("change", function () {
        if (historicalPeopleDropdown.value) {
            const person = JSON.parse(historicalPeopleDropdown.value);
            const textBlock = `[use the following personality description for this conversation: ${person.description.replace(/\n/g, '\\n')}] [set temperature: ${person.temperature}] [set verbosity: ${person.verbosity}]\n\n`;
            navigator.clipboard.writeText(textBlock).then(
                function () {
                    console.log("Personality description copied to clipboard.");
                    historicalPeopleDropdown.value = "";
                    showToast(); // Show the toast notification
                },
                function (err) {
                    console.error("Could not copy personality description: ", err);
                }
            );
        }
    });
}

async function loadHistoricalFigures() {
    try {
        const response = await fetch(chrome.runtime.getURL('historicalFigures.json'));
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching historical figures:', error);
        return [];
    }
}

function loadSavedPrompts() {
    const savedPrompts = JSON.parse(localStorage.getItem("savedPrompts") || "{}");
    const promptList = document.getElementById("promptList");

    // Clear the current list
    promptList.innerHTML = "";

    for (const promptId in savedPrompts) {
        const listItem = document.createElement("li");
        listItem.style.cursor = "pointer";
        listItem.title = "Click to copy prompt modifier";
        listItem.classList.add("listTitle");

        const nameText = document.createElement("span");
        nameText.textContent = savedPrompts[promptId].name;
        listItem.appendChild(nameText);

        const iconContainer = document.createElement("div");
        iconContainer.className = "icon-container";

        const deleteIcon = document.createElement("i");
        deleteIcon.className = "material-icons small-icon";
        deleteIcon.title = "Delete prompt";
        deleteIcon.textContent = "delete";
        deleteIcon.style.cursor = "pointer";
        deleteIcon.addEventListener("click", function (event) {
            event.stopPropagation(); // Prevent the click event from propagating to the listItem
            deletePrompt(promptId);
        });

        const editIcon = document.createElement("i");
        editIcon.className = "material-icons small-icon";
        editIcon.title = "Edit personality";
        editIcon.textContent = "edit";
        editIcon.style.cursor = "pointer";
        editIcon.addEventListener("click", function (event) {
            event.stopPropagation(); // Prevent the click event from propagating to the listItem
            editPersonality(promptId);
        });

        iconContainer.appendChild(editIcon);
        iconContainer.appendChild(deleteIcon);
        listItem.appendChild(iconContainer);
        promptList.appendChild(listItem);

        // Add a click event listener to the listItem
        listItem.addEventListener("click", function () {
            // Copy the personality description to clipboard
            navigator.clipboard.writeText(savedPrompts[promptId].textBlock).then(
                function () {
                    console.log("Personality description copied to clipboard.");
                },
                function (err) {
                    console.error("Could not copy personality description: ", err);
                }
            );
            showToast(); // Show the toast notification
        });
    }
}

function savePersonality() {
    const nameInput = document.getElementById("nameInput").value;
    const personalityInput = document.getElementById("personalityInput").value;
    const temperatureInput = document.getElementById("temperatureInput").value || "0.7";
    const verbosityInput = document.getElementById("verbosityInput").value || "0.5";

    if (nameInput === "" || personalityInput === "") {
        alert("Please enter a name and personality description.");
        return;
    }

    // Combine the personality description and parameters into a text block
    const textBlock = `[use the following personality description for this conversation: ${personalityInput.replace(/\n/g, '\\n')}] [set temperature: ${temperatureInput}] [set verbosity: ${verbosityInput}]\n\n`;

    // Save the generated personality description
    savePrompt(nameInput, textBlock);

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

function updatePersonality(promptId) {
    const savedPrompts = JSON.parse(localStorage.getItem("savedPrompts") || "{}");
    const name = document.getElementById("nameInput").value;
    const description = document.getElementById("personalityInput").value;
    const temperature = document.getElementById("temperatureInput").value || "0.7";
    const verbosity = document.getElementById("verbosityInput").value || "0.5";

    if (name === "" || description === "") {
        alert("Please enter a name and personality description.");
        return;
    }

    const textBlock = `[use the following personality description for this conversation: ${description}, temperature: ${temperature}, verbosity: ${verbosity}]`;

    savedPrompts[promptId] = { name, textBlock };
    localStorage.setItem("savedPrompts", JSON.stringify(savedPrompts));

    loadSavedPrompts();

    document.getElementById("nameInput").value = "";
    document.getElementById("personalityInput").value = "";
    document.getElementById("temperatureInput").value = "";
    document.getElementById("verbosityInput").value = "";

    document.getElementById("savePersonalityButton").style.display = "block";
    document.getElementById("updatePersonalityButton").style.display = "none";
}

function editPersonality(promptId) {
    const savedPrompts = JSON.parse(localStorage.getItem("savedPrompts") || "{}");
    const prompt = savedPrompts[promptId];

    if (prompt) {
        document.getElementById("nameInput").value = prompt.name;

        const descriptionStartIndex = prompt.textBlock.indexOf(': ') + 2;
        const descriptionEndIndex = prompt.textBlock.indexOf('], [set temperature: ');
        const description = prompt.textBlock.slice(descriptionStartIndex, descriptionEndIndex).replace(/\\n/g, '\n');

        const temperatureStartIndex = prompt.textBlock.indexOf('[set temperature: ') + 17;
        const temperatureEndIndex = prompt.textBlock.indexOf('] [set verbosity: ');
        const temperature = prompt.textBlock.slice(temperatureStartIndex, temperatureEndIndex);

        const verbosityStartIndex = prompt.textBlock.indexOf('[set verbosity: ') + 16;
        const verbosityEndIndex = prompt.textBlock.indexOf(']', verbosityStartIndex);
        const verbosity = prompt.textBlock.slice(verbosityStartIndex, verbosityEndIndex);

        document.getElementById("personalityInput").value = description;
        document.getElementById("temperatureInput").value = temperature;
        document.getElementById("verbosityInput").value = verbosity;

        document.getElementById("contentContainer").style.display = "none";
        document.getElementById("formContainer").style.display = "block";

        document.getElementById("savePersonalityButton").style.display = "none";
        document.getElementById("updatePersonalityButton").style.display = "block";

        document.getElementById("updatePersonalityButton").onclick = function () {
            updatePersonality(promptId);
            document.getElementById("contentContainer").style.display = "block";
            document.getElementById("formContainer").style.display = "none";
        };
    }
}


document.addEventListener("DOMContentLoaded", function () {
    loadHistoricalFigures().then((data) => {
        populateHistoricalFiguresDropdown(data);
    });
    document.getElementById("newPersonalityButton").addEventListener("click", function () {
        document.getElementById("contentContainer").style.display = "none";
        document.getElementById("formContainer").style.display = "block";
        document.getElementById("nameInput").value = "";
        document.getElementById("personalityInput").value = "";
        document.getElementById("temperatureInput").value = "";
        document.getElementById("verbosityInput").value = "";

    });

    document.getElementById("cancelButton").addEventListener("click", function () {
        document.getElementById("contentContainer").style.display = "block";
        document.getElementById("formContainer").style.display = "none";
    });

    document.getElementById("savePersonalityButton").addEventListener("click", function () {
        savePersonality();
        document.getElementById("contentContainer").style.display = "block";
        document.getElementById("formContainer").style.display = "none";
    });

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
        const textBlock = `[use the following personality description for this conversation: ${personalityInput.replace(/\n/g, '\\n')}] [set temperature: ${temperatureInput}] [set verbosity: ${verbosityInput}]\n\n`;

        navigator.clipboard.writeText(textBlock).then(
            function () {
                console.log("Personality description copied to clipboard.");
                showToast(); // Show the toast notification
            },
            function (err) {
                console.error("Could not copy personality description: ", err);
            }
        );
    }
});


