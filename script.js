let currentConfig = {
  color: "#000000",
  size: "8px",
  className: "drawing-pin",
}
let pins = []
let undoStack = [];
let zoomLevel = 1;

const updatePinCount = () => {
  document.getElementById(
    "pin-count"
  ).textContent = `Total Pins: ${pins.length}`
  // Enable/disable undo button based on pins array
  document.getElementById('undoButton').disabled = pins.length === 0;
}

const updateZoomLevel = () => {
  document.getElementById('zoom-level').textContent = `Zoom Level: ${(zoomLevel * 100).toFixed(0)}%`;
  document.querySelector('.gym-image').style.transform = `scale(${zoomLevel})`;
};


const savePins = () => {
  localStorage.setItem("gymPins", JSON.stringify(pins))
  localStorage.setItem('zoomLevel', zoomLevel);
  updatePinCount()
}

const loadPins = () => {
  const savedPins = localStorage.getItem('gymPins');
  const savedZoomLevel = localStorage.getItem('zoomLevel');
  if (savedPins) {
    pins = JSON.parse(savedPins);
    zoomLevel = parseFloat(savedZoomLevel) || 1;
    renderPins();
    updatePinCount();
    updateZoomLevel();
  }
}

const renderPins = () => {
  const container = document.querySelector(".container")
  // Clear existing pins from DOM
  document.querySelectorAll(".drawing-pin").forEach((pin) => pin.remove())

  // Render all pins
  pins.forEach((pinData) => {
    const pin = document.createElement("div")
    pin.className = currentConfig.className

    Object.assign(pin.style, {
      top: `${pinData.y * zoomLevel}px`,
      left: `${pinData.x * zoomLevel}px`,
      width: `${parseInt(currentConfig.size) * zoomLevel}px`,
      height: `${parseInt(currentConfig.size) * zoomLevel}px`,
      backgroundColor: pinData.color
    })

    container.appendChild(pin)
  })
}

const undoLastPin = () => {
  if (pins.length > 0) {
    const removedPin = pins.pop();
    undoStack.push(removedPin);
    savePins();
    renderPins();
  }
};

const handleKeyboard = (event) => {
  // Check for Ctrl+Z or Cmd+Z
  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    event.preventDefault();
    undoLastPin();
  }
};

const zoomIn = () => {
  if (zoomLevel < 2) {
    zoomLevel += 0.1;
    updateZoomLevel();
    renderPins();
    savePins();
  }
};

const zoomOut = () => {
  if (zoomLevel > 0.5) {
    zoomLevel -= 0.1;
    updateZoomLevel();
    renderPins();
    savePins();
  }
};



const initializeDrawing = () => {
  const container = document.querySelector(".container")

  container.addEventListener("click", (event) => {
    if (event.target.classList.contains("gym-image")) {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / zoomLevel;
      const y = (event.clientY - rect.top) / zoomLevel;

      // Save pin data
      pins.push({
        x,
        y,
        color: currentConfig.color,
        timestamp: new Date().toISOString(),
      })

      undoStack = [];


      const pin = document.createElement("div")
      pin.className = currentConfig.className

      Object.assign(pin.style, {
        top: `${y * zoomLevel}px`,
        left: `${x * zoomLevel}px`,
        width: `${parseInt(currentConfig.size) * zoomLevel}px`,
        height: `${parseInt(currentConfig.size) * zoomLevel}px`,
        backgroundColor: currentConfig.color
      })

      container.appendChild(pin)
      savePins()
    }
  })

  document.addEventListener('keydown', handleKeyboard);
  // Load saved pins on initialization
  loadPins()
}

const changePinColor = (color) => {
  currentConfig.color = color
}

const clearPins = () => {
  if (pins.length > 0) {
    // Store current pins in undo stack before clearing
    undoStack = [...pins];
    pins = [];
    savePins();
    renderPins();
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeDrawing)
} else {
  initializeDrawing()
}