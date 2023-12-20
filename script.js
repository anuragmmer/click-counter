// script.js
// Grid Button Counter
// Author: Anurag
// Description: JavaScript code to handle button clicks and counter functionality.
// License: MIT (See LICENSE file for details)

document.addEventListener("DOMContentLoaded", function () {
    let numButtons = parseInt(prompt("Enter the number of buttons (1-20):"));
    numButtons = Math.max(1, Math.min(20, numButtons));

    const gridContainer = document.getElementById("grid-container");
    const buttons = [];
    const clickCounts = [];
    let lastClickedButtonIndex = -1;

    function updateButtonClickCount(buttonIndex) {
        clickCounts[buttonIndex - 1] = (clickCounts[buttonIndex - 1] || 0) + 1;
        buttons[buttonIndex - 1].innerText = `Button ${buttonIndex} (${clickCounts[buttonIndex - 1]})`;
        lastClickedButtonIndex = buttonIndex;
    }

    for (let i = 1; i <= numButtons; i++) {
        const button = document.createElement("button");
        button.className = "button";
        button.innerText = `Button ${i} (0)`;

        (function (buttonIndex) {
            button.addEventListener("click", function () {
                updateButtonClickCount(buttonIndex);
            });
        })(i);

        gridContainer.appendChild(button);
        buttons.push(button);
        clickCounts.push(0);
    }

    const clickedButtonsStack = [];

    function updateButtonClickCount(buttonIndex) {
        clickCounts[buttonIndex - 1] = (clickCounts[buttonIndex - 1] || 0) + 1;
        buttons[buttonIndex - 1].innerText = `Button ${buttonIndex} (${clickCounts[buttonIndex - 1]})`;
        lastClickedButtonIndex = buttonIndex;

        clickedButtonsStack.push(buttonIndex);
    }

    const undoButton = document.getElementById("undo-button");
    undoButton.addEventListener("click", function () {
        if (clickedButtonsStack.length > 0) {
            const buttonToUndo = clickedButtonsStack.pop();
            clickCounts[buttonToUndo - 1]--;
            buttons[buttonToUndo - 1].innerText = `Button ${buttonToUndo} (${clickCounts[buttonToUndo - 1]})`;
            lastClickedButtonIndex = buttonToUndo;
        }
    });

    const saveCsvButton = document.getElementById("save-csv-button");
    saveCsvButton.addEventListener("click", function () {
        let csvData = "Serial,Clicks\n";
        buttons.forEach((button, index) => {
            const serial = index + 1;
            const clicks = clickCounts[index] || 0;
            csvData += `${serial},${clicks}\n`;
        });

        const csvBlob = new Blob([csvData], { type: "text/csv" });
        const csvUrl = URL.createObjectURL(csvBlob);

        const a = document.createElement("a");
        a.href = csvUrl;
        a.download = "button_click_data.csv";
        a.click();
    });
});
