/* script.js - Obsrvr Logic */

document.addEventListener("DOMContentLoaded", function () {
    // --- State Management ---
    const state = {
        projectName: "Untitled",
        counters: [], // { id, label, count }
        history: [], // Stack of IDs for undo
        isEditMode: false,
        editingId: null
    };

    // --- DOM Elements ---
    const gridContainer = document.getElementById("grid-container");
    const projectTitleDisplay = document.getElementById("project-title-display");
    
    // Modals
    const setupModal = document.getElementById("setup-modal");
    const renameModal = document.getElementById("rename-modal");
    const exportModal = document.getElementById("export-modal");
    
    // Inputs
    const setupNameInput = document.getElementById("setup-name");
    const setupCountInput = document.getElementById("setup-count");
    const renameInput = document.getElementById("rename-input");
    const exportFilenameInput = document.getElementById("export-filename");

    // --- Initialization ---
    
    // Start Button (Setup Modal)
    document.getElementById("start-btn").addEventListener("click", () => {
        const count = Math.min(20, Math.max(1, parseInt(setupCountInput.value) || 1));
        state.projectName = setupNameInput.value || "Untitled";
        
        projectTitleDisplay.textContent = state.projectName;
        initializeGrid(count);
        setupModal.classList.remove("active");
    });

    function initializeGrid(numButtons) {
        state.counters = [];
        gridContainer.innerHTML = ""; // Clear existing

        for (let i = 0; i < numButtons; i++) {
            const counter = {
                id: i,
                label: `Variable ${i + 1}`,
                count: 0
            };
            state.counters.push(counter);
            createCounterElement(counter);
        }
    }

    function createCounterElement(counterObj) {
        const card = document.createElement("div");
        card.className = "counter-card";
        card.id = `card-${counterObj.id}`;
        
        // Internal HTML
        card.innerHTML = `
            <div class="counter-label">${counterObj.label}</div>
            <div class="counter-value">${counterObj.count}</div>
        `;

        // Click Handler
        card.addEventListener("click", () => handleCardClick(counterObj.id));
        
        gridContainer.appendChild(card);
    }

    // --- Core Logic ---

    function handleCardClick(id) {
        if (state.isEditMode) {
            // Edit Mode: Open Rename Modal
            state.editingId = id;
            renameInput.value = state.counters[id].label;
            renameModal.classList.add("active");
        } else {
            // Count Mode: Increment
            incrementCounter(id);
        }
    }

    function incrementCounter(id) {
        state.counters[id].count++;
        state.history.push(id);
        updateUI(id);
        triggerHaptic();
    }

    function updateUI(id) {
        const card = document.getElementById(`card-${id}`);
        const counter = state.counters[id];
        card.querySelector(".counter-value").innerText = counter.count;
        card.querySelector(".counter-label").innerText = counter.label;
    }

    function triggerHaptic() {
        if (navigator.vibrate) navigator.vibrate(40); // 40ms vibration
    }

    // --- Bottom Bar Actions ---

    // Toggle Edit Mode
    const modeBtn = document.getElementById("mode-toggle");
    modeBtn.addEventListener("click", () => {
        state.isEditMode = !state.isEditMode;
        document.body.classList.toggle("edit-mode", state.isEditMode);
        modeBtn.classList.toggle("active", state.isEditMode);
    });

    // Undo
    document.getElementById("undo-button").addEventListener("click", () => {
        if (state.history.length > 0) {
            const lastId = state.history.pop();
            if (state.counters[lastId].count > 0) {
                state.counters[lastId].count--;
                updateUI(lastId);
                triggerHaptic(); // Double vibrate for undo?
            }
        }
    });

    // Export Logic
    document.getElementById("export-button").addEventListener("click", () => {
        exportFilenameInput.value = `${state.projectName}_data`;
        exportModal.classList.add("active");
    });

    document.getElementById("export-confirm").addEventListener("click", () => {
        let csvContent = "data:text/csv;charset=utf-8,ID,Label,Count\n";
        
        state.counters.forEach(c => {
            csvContent += `${c.id + 1},"${c.label}",${c.count}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        
        let fileName = exportFilenameInput.value || "data";
        if(!fileName.endsWith(".csv")) fileName += ".csv";
        
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        exportModal.classList.remove("active");
    });

    // --- Modal Closing Logic ---
    
    // Rename Modal
    document.getElementById("rename-cancel").addEventListener("click", () => renameModal.classList.remove("active"));
    document.getElementById("rename-confirm").addEventListener("click", () => {
        if (state.editingId !== null) {
            state.counters[state.editingId].label = renameInput.value;
            updateUI(state.editingId);
            state.editingId = null;
        }
        renameModal.classList.remove("active");
    });

    // Export Modal
    document.getElementById("export-cancel").addEventListener("click", () => exportModal.classList.remove("active"));
});
