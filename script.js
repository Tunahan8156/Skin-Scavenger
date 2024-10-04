let skinData = {}; // This will hold the JSON data

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                skinData = JSON.parse(e.target.result);
                updateComboBox();
                document.getElementById('downloadButton').style.display = 'block'; // Show download button
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        };
        reader.readAsText(file);
    }
});

document.getElementById('customDateCheckbox').addEventListener('change', function() {
    const dateContainer = document.getElementById('dateContainer');
    if (this.checked) {
        dateContainer.style.display = 'block';
        populateDateComboBoxes();
    } else {
        dateContainer.style.display = 'none';
    }
});

function populateDateComboBoxes() {
    const dayComboBox = document.getElementById('dayComboBox');
    const monthComboBox = document.getElementById('monthComboBox');
    const yearComboBox = document.getElementById('yearComboBox');

    // Clear existing options
    dayComboBox.innerHTML = '';
    monthComboBox.innerHTML = '';
    yearComboBox.innerHTML = '';

    // Populate day combo box
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        dayComboBox.appendChild(option);
    }

    // Populate month combo box
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        monthComboBox.appendChild(option);
    });

    // Populate year combo box
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i <= currentYear + 10; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearComboBox.appendChild(option);
    }

    // Set default to today's date
    const today = new Date();
    dayComboBox.value = today.getDate();
    monthComboBox.value = today.getMonth() + 1; // Months are 0-indexed
    yearComboBox.value = today.getFullYear();
}

document.querySelectorAll('input[name="selection"]').forEach(radio => {
    radio.addEventListener('change', updateComboBox);
});

function updateComboBox() {
    const comboBox = document.getElementById('comboBox');
    const selectedRadio = document.querySelector('input[name="selection"]:checked').value;

    // Clear existing options
    comboBox.innerHTML = '';

    const options = new Set(); // Use a Set to avoid duplicates

    // Collect options based on the selected radio button
    for (const skin in skinData) {
        const skinDataItem = skinData[skin];
        if (selectedRadio === 'brawler') {
            options.add(skinDataItem.brawler);
        } else if (selectedRadio === 'theme') {
            options.add(skinDataItem.theme);
        } else if (selectedRadio === 'rarity') {
            options.add(skinDataItem.rarity);
        }
    }

    // Populate the combo box with options, sorting them appropriately
    if (selectedRadio === 'rarity') {
        const rarityOrder = ['Default', 'Rare', 'Super Rare', 'Epic', 'Mythic', 'Legendary', 'Hypercharge', 'Coin'];
        rarityOrder.forEach(rarityValue => {
            if (options.has(rarityValue)) {
                const option = document.createElement('option');
                option.value = rarityValue;
                option.textContent = rarityValue;
                comboBox.appendChild(option);
            }
        });
    } else {
        const sortedOptions = Array.from(options).sort(); // Sort the options alphabetically
        sortedOptions.forEach(optionValue => {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = optionValue;
            comboBox.appendChild(option);
        });
    }

    // Clear existing checkboxes when updating the combo box
    document.getElementById('checkboxContainer').innerHTML = '';

    // Add event listener to the combo box to show checkboxes
    comboBox.addEventListener('change', generateCheckboxes);
}

function generateCheckboxes() {
    const selectedComboValue = document.getElementById('comboBox').value;
    const selectedRadio = document.querySelector('input[name="selection"]:checked').value;

    const checkboxContainer = document.getElementById('checkboxContainer');
    checkboxContainer.innerHTML = ''; // Clear existing checkboxes

    // Generate checkboxes based on the selected option
    for (const skin in skinData) {
        const skinDataItem = skinData[skin];
        
        if ((selectedRadio === 'brawler' && skinDataItem.brawler === selectedComboValue) ||
            (selectedRadio === 'theme' && skinDataItem.theme === selectedComboValue) ||
            (selectedRadio === 'rarity' && skinDataItem.rarity === selectedComboValue)) {
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = skin;
            checkbox.name = skin;
            checkbox.checked = skinDataItem.found !== null; // Check if found attribute is not null
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    // Check if custom date checkbox is checked
                    const isCustomDateChecked = document.getElementById('customDateCheckbox').checked;

                    if (isCustomDateChecked) {
                        // Set found attribute to selected date
                        const day = document.getElementById('dayComboBox').value;
                        const month = document.getElementById('monthComboBox').value;
                        const year = document.getElementById('yearComboBox').value;
                        skinDataItem.found = `${day}/${months[month - 1]}/${year}`; // e.g. "11/July/2024"
                    } else {
                        // Set found attribute to today's date
                        const today = new Date();
                        skinDataItem.found = `${today.getDate()}/${months[today.getMonth()]}/${today.getFullYear()}`;
                    }
                } else {
                    skinDataItem.found = null; // Set found attribute to null if unchecked
                }
            });

            const label = document.createElement('label');
            label.htmlFor = skin;
            label.textContent = skin;

            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);
            checkboxContainer.appendChild(document.createElement('br')); // Line break for spacing
        }
    }
}

// Add functionality to download the modified JSON data
document.getElementById('downloadButton').addEventListener('click', function() {
    const blob = new Blob([JSON.stringify(skinData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modified_skins.json'; // Name of the downloaded file
    a.click();
    URL.revokeObjectURL(url); // Clean up
});

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
