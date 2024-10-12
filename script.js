let dayCombobox = document.getElementById("day-combobox");
let monthCombobox = document.getElementById("month-combobox");
let yearCombobox = document.getElementById("year-combobox");
let searchCombobox = document.getElementById("search-combobox");
let skinContainer = document.querySelector(".skin-container");

const rarityOrder = ["Basic", "Rare", "Super Rare", "Epic", "Mythic", "Legendary", "Hypercharge", "Coin"];
let skinsData = {};

const monthDictionary = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December"
};

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getMonthLength(year) {
    return {
        'January': 31,
        'February': isLeapYear(year) ? 29 : 28,
        'March': 31,
        'April': 30,
        'May': 31,
        'June': 30,
        'July': 31,
        'August': 31,
        'September': 30,
        'October': 31,
        'November': 30,
        'December': 31
    };
}

const date = new Date();
const currentDay = date.getDate();
const currentMonth = date.getMonth() + 1;
const currentYear = date.getFullYear();

for (let i = 1; i <= 12; i++) {
    monthCombobox.add(new Option(monthDictionary[i], i));
}

for (let i = 2019; i <= currentYear + 10; i++) {
    yearCombobox.add(new Option(i, i));
}

function populateDateComboboxes() {
    const selectedMonth = parseInt(monthCombobox.value);
    const selectedYear = parseInt(yearCombobox.value);
    const monthLength = getMonthLength(selectedYear);

    const currentDayValue = parseInt(dayCombobox.value);
    dayCombobox.innerHTML = "";

    for (let i = 1; i <= monthLength[monthDictionary[selectedMonth]]; i++) {
        dayCombobox.add(new Option(String(i), String(i)));
    }

    if (currentDayValue > monthLength[monthDictionary[selectedMonth]]) {
        dayCombobox.value = monthLength[monthDictionary[selectedMonth]];
    } else {
        dayCombobox.value = currentDayValue;
    }
}

monthCombobox.value = currentMonth;
yearCombobox.value = currentYear;
populateDateComboboxes();
dayCombobox.value = currentDay;

function populateSearchCombobox() {
    searchCombobox.innerHTML = "";

    const selectedCategory = document.querySelector('input[name="category"]:checked').id;

    if (selectedCategory === "brawler-radiobutton") {
        const brawlers = new Set();
        for (const skin in skinsData) {
            brawlers.add(skinsData[skin].brawler);
        }
        const brawlerArray = Array.from(brawlers).sort();
        brawlerArray.forEach(brawler => {
            searchCombobox.add(new Option(brawler, brawler));
        });
    } else if (selectedCategory === "theme-radiobutton") {
        const themes = new Set();
        for (const skin in skinsData) {
            themes.add(skinsData[skin].theme);
        }
        const themeArray = Array.from(themes).sort();
        themeArray.forEach(theme => {
            searchCombobox.add(new Option(theme, theme));
        });
    } else if (selectedCategory === "rarity-radiobutton") {
        rarityOrder.forEach(rarity => {
            searchCombobox.add(new Option(rarity, rarity));
        });
    }

    populateSkinCheckboxes();
}
document.querySelectorAll('input[name="category"]').forEach(radio => {
    radio.addEventListener('change', populateSearchCombobox);
});

function loadSkinsData(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            skinsData = JSON.parse(event.target.result);
            populateSearchCombobox();
            populateSkinCheckboxes();
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    };
    reader.readAsText(file);
}

document.getElementById("file-input").addEventListener("change", function() {
    const file = this.files[0];
    if (file) {
        loadSkinsData(file);
    }
});

window.onload = function() {
    fetch('skins.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            skinsData = data;
            populateSearchCombobox();
            populateSkinCheckboxes();
        })
        .catch(error => {
            console.error('Error fetching the skins.json file:', error);
        });
};

function populateSkinCheckboxes() {
    skinContainer.innerHTML = "";

    const selectedCategory = document.querySelector('input[name="category"]:checked').id;
    const selectedValue = searchCombobox.value;

    if (!selectedValue) return;

    for (const skin in skinsData) {
        const skinData = skinsData[skin];
        let matches = false;

        if (selectedCategory === "brawler-radiobutton" && skinData.brawler === selectedValue) {
            matches = true;
        } else if (selectedCategory === "theme-radiobutton" && skinData.theme === selectedValue) {
            matches = true;
        } else if (selectedCategory === "rarity-radiobutton" && skinData.rarity === selectedValue) {
            matches = true;
        }

        if (matches) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = skin;
            checkbox.value = skin;

            const label = document.createElement('label');
            label.htmlFor = skin;
            label.innerText = skin;

            const dateSpan = document.createElement('span');
            dateSpan.style.color = "gray";

            if (skinData.found) {
                checkbox.checked = true;
                dateSpan.innerText = ` ${skinData.found}`;
            }

            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    const selectedMonthName = monthDictionary[monthCombobox.value];
                    const selectedDate = `${dayCombobox.value}/${selectedMonthName}/${yearCombobox.value}`;
                    skinsData[skin].found = selectedDate;

                    dateSpan.innerText = ` ${selectedDate}`;
                    console.log(`${skin} found on ${selectedDate}`);
                } else {
                    skinsData[skin].found = null;
                    dateSpan.innerText = "";
                }
            });

            skinContainer.appendChild(checkbox);
            skinContainer.appendChild(label);
            label.appendChild(dateSpan);
            skinContainer.appendChild(document.createElement('br'));
        }
    }
}

searchCombobox.addEventListener('change', populateSkinCheckboxes);

function downloadJSON() {
    const dataStr = JSON.stringify(skinsData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "skins.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.getElementById("download-file-button").addEventListener("click", downloadJSON);
document.getElementById("upload-file-button").addEventListener("click", function() {
    document.getElementById("file-input").click();
});
