document.addEventListener("DOMContentLoaded", function () {

    const state = {
        projectName: "Untitled",
        counters: [], 
        history: [],  
        clickLogs: [], 
        isEditMode: false,
        editingId: null,
        
        // Settings
        trackGlobalInterval: false,
        trackVarInterval: false,
        
        // Runtime variables
        lastGlobalClickTime: null,
        startTime: null
    };

    // --- DOM Elements ---
    const gridContainer = document.getElementById("grid-container");
    const projectTitleDisplay = document.getElementById("project-title-display");

    const toggleGlobal = document.getElementById("toggle-global-interval");
    const toggleVar = document.getElementById("toggle-var-interval");
    const rowVar = document.getElementById("row-var-interval");
    const setupModal = document.getElementById("setup-modal");
    const setupNameInput = document.getElementById("setup-name");
    const setupCountInput = document.getElementById("setup-count");
    const renameModal = document.getElementById("rename-modal");
    const renameInput = document.getElementById("rename-input");
    const exportModal = document.getElementById("export-modal");
    const exportFilenameInput = document.getElementById("export-filename");
    const exportDesc = document.getElementById("export-desc");


    toggleGlobal.addEventListener("change", () => {
        if (toggleGlobal.checked) {
            rowVar.classList.remove("hidden");
        } else {
            rowVar.classList.add("hidden");
            toggleVar.checked = false; 
        }
    });


    document.getElementById("start-btn").addEventListener("click", () => {
        const count = Math.min(20, Math.max(1, parseInt(setupCountInput.value) || 1));
        state.projectName = setupNameInput.value || "Untitled";
        state.trackGlobalInterval = toggleGlobal.checked;
        state.trackVarInterval = toggleVar.checked;
        state.startTime = Date.now();
        state.lastGlobalClickTime = state.startTime;

        projectTitleDisplay.textContent = state.projectName;
        initializeGrid(count);
        setupModal.classList.remove("active");
    });

    function initializeGrid(numButtons) {
        state.counters = [];
        state.clickLogs = [];
        state.history = [];
        gridContainer.innerHTML = ""; 

        for (let i = 0; i < numButtons; i++) {
            const counter = {
                id: i,
                label: `Variable ${i + 1}`,
                count: 0,
                lastClickTime: state.startTime 
            };
            state.counters.push(counter);
            createCounterElement(counter);
        }
    }

    function createCounterElement(counterObj) {
        const card = document.createElement("div");
        card.className = "counter-card";
        card.id = `card-${counterObj.id}`;
        
        card.innerHTML = `
            <div class="counter-label">${counterObj.label}</div>
            <div class="counter-value">${counterObj.count}</div>
        `;

        card.addEventListener("click", () => handleCardClick(counterObj.id));
        gridContainer.appendChild(card);
    }


    function handleCardClick(id) {
        if (state.isEditMode) {
            openRenameModal(id);
        } else {
            processClick(id);
        }
    }

    function processClick(id) {
        const now = Date.now();
        const counter = state.counters[id];

        let globalDelta = 0;
        let varDelta = 0;

        if (state.trackGlobalInterval) {
            globalDelta = now - state.lastGlobalClickTime;
            state.lastGlobalClickTime = now;
        }

        if (state.trackVarInterval) {
            varDelta = now - counter.lastClickTime;
            counter.lastClickTime = now;
        }

        counter.count++;
        

        const logEntry = {
            sequence: state.history.length + 1,
            timestamp: new Date(now).toISOString(),
            id: id,
            label: counter.label,
            globalDelta: globalDelta, 
            varDelta: varDelta 
        };
        state.clickLogs.push(logEntry);
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
        if (navigator.vibrate) navigator.vibrate(50);
    }

    const modeBtn = document.getElementById("mode-toggle");
    modeBtn.addEventListener("click", () => {
        state.isEditMode = !state.isEditMode;
        document.body.classList.toggle("edit-mode", state.isEditMode);
        modeBtn.classList.toggle("active", state.isEditMode);
    });

    const focusBtn = document.getElementById("focus-btn");
    const exitFocusBtn = document.getElementById("exit-focus-btn");
    
    focusBtn.addEventListener("click", () => {
        document.body.classList.add("focus-mode");
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(e => console.log(e));
        }
    });

    exitFocusBtn.addEventListener("click", () => {
        document.body.classList.remove("focus-mode");
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(e => console.log(e));
        }
    });

    // Undo
    document.getElementById("undo-button").addEventListener("click", () => {
        if (state.history.length > 0) {
            const lastId = state.history.pop();
            state.counters[lastId].count--;
            state.clickLogs.pop(); 
            updateUI(lastId);
        }
    });


    document.getElementById("export-button").addEventListener("click", () => {
        exportFilenameInput.value = `${state.projectName}_data`;
        
        if (state.trackGlobalInterval) {
            exportDesc.innerText = "Interval tracking enabled. Exporting detailed event log.";
        } else {
            exportDesc.innerText = "Download count summary.";
        }
        
        exportModal.classList.add("active");
    });

    document.getElementById("export-confirm").addEventListener("click", () => {
        let csvContent = "";
        
        if (state.trackGlobalInterval) {
            csvContent = "data:text/csv;charset=utf-8,Sequence,Timestamp,ID,Label,Interval_Global(ms)";
            if (state.trackVarInterval) csvContent += ",Interval_Variable(ms)";
            csvContent += "\n";

            state.clickLogs.forEach(log => {
                let row = `${log.sequence},${log.timestamp},${log.id + 1},"${log.label}",${log.globalDelta}`;
                if (state.trackVarInterval) row += `,${log.varDelta}`;
                csvContent += row + "\n";
            });

        } else {
            csvContent = "data:text/csv;charset=utf-8,ID,Label,Count\n";
            state.counters.forEach(c => {
                csvContent += `${c.id + 1},"${c.label}",${c.count}\n`;
            });
        }

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


    function openRenameModal(id) {
        state.editingId = id;
        renameInput.value = state.counters[id].label;
        renameModal.classList.add("active");
    }

    document.getElementById("rename-cancel").addEventListener("click", () => renameModal.classList.remove("active"));
    document.getElementById("rename-confirm").addEventListener("click", () => {
        if (state.editingId !== null) {
            state.counters[state.editingId].label = renameInput.value;
            updateUI(state.editingId);
            state.editingId = null;
        }
        renameModal.classList.remove("active");
    });

    document.getElementById("export-cancel").addEventListener("click", () => exportModal.classList.remove("active"));
});
