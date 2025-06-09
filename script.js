// Game state
let rolls = 0;
let luck = 1.0;
let speed = 1.0;

let potions = {
  luck: 0,
  speed: 0,
};

const auras = [
  "Fire", "Water", "Earth", "Air", "Light", "Dark", "Storm", "Ice",
  "Thunder", "Shadow", "Spirit", "Void", "Arcane", "Solar", "Lunar"
];

let ownedAuras = new Set();
let gear = []; // Gear items bought

const gearItems = [
  { id: "luckRing", name: "Luck Ring", luckBoost: 0.2, speedBoost: 0, cost: 100, autoAura: false },
  { id: "speedBoots", name: "Speed Boots", luckBoost: 0, speedBoost: 0.3, cost: 150, autoAura: false },
  { id: "auraCharm", name: "Aura Charm", luckBoost: 0.1, speedBoost: 0.1, cost: 200, autoAura: true }, // auto adds auras
];

// Load saved state or initialize
function loadState() {
  const savedRolls = localStorage.getItem("rolls");
  const savedLuck = localStorage.getItem("luck");
  const savedSpeed = localStorage.getItem("speed");
  const savedPotions = localStorage.getItem("potions");
  const savedOwnedAuras = localStorage.getItem("ownedAuras");
  const savedGear = localStorage.getItem("gear");

  rolls = savedRolls ? parseInt(savedRolls) : 0;
  luck = savedLuck ? parseFloat(savedLuck) : 1.0;
  speed = savedSpeed ? parseFloat(savedSpeed) : 1.0;

  if (savedPotions) potions = JSON.parse(savedPotions);
  if (savedOwnedAuras) ownedAuras = new Set(JSON.parse(savedOwnedAuras));
  if (savedGear) gear = JSON.parse(savedGear);
}

// Save game state
function saveState() {
  localStorage.setItem("rolls", rolls);
  localStorage.setItem("luck", luck.toFixed(2));
  localStorage.setItem("speed", speed.toFixed(2));
  localStorage.setItem("potions", JSON.stringify(potions));
  localStorage.setItem("ownedAuras", JSON.stringify(Array.from(ownedAuras)));
  localStorage.setItem("gear", JSON.stringify(gear));
}

// Update UI
function updateUI() {
  document.getElementById("rollCount").innerText = rolls;
  document.getElementById("luck").innerText = luck.toFixed(2) + "x";
  document.getElementById("speed").innerText = speed.toFixed(2) + "x";
  document.getElementById("luckPotionCount").innerText = potions.luck;
  document.getElementById("speedPotionCount").innerText = potions.speed;

  // Update potions buttons
  document.getElementById("useLuckPotionBtn").disabled = potions.luck <= 0;
  document.getElementById("useSpeedPotionBtn").disabled = potions.speed <= 0;

  // Display owned auras with 4-pointed star animation
  const auraDiv = document.getElementById("auraDisplay");
  auraDiv.innerHTML = "";
  ownedAuras.forEach(aura => {
    const auraElem = document.createElement("div");
    auraElem.className = "aura";
    auraElem.textContent = aura;
    auraDiv.appendChild(auraElem);
  });

  // Update gear shop
  const gearShopDiv = document.getElementById("gearShop");
  gearShopDiv.innerHTML = "";
  gearItems.forEach(item => {
    if (!gear.includes(item.id)) {
      const itemDiv = document.createElement("div");
      itemDiv.className = "gear-item";
      itemDiv.textContent = `${item.name} (Cost: ${item.cost} rolls)`;
      itemDiv.onclick = () => buyGear(item);
      gearShopDiv.appendChild(itemDiv);
    }
  });

  // Enable quick roll button after 1000 rolls
  document.getElementById("quickRollBtn").disabled = rolls < 1000;
}

// Buy gear if enough rolls
function buyGear(item) {
  if (rolls >= item.cost) {
    rolls -= item.cost;
    gear.push(item.id);
    luck += item.luckBoost;
    speed += item.speedBoost;
    saveState();
    updateUI();
    alert(`Bought ${item.name}!`);
  } else {
    alert("Not enough rolls to buy this gear.");
  }
}

// Roll RNG once
function rollOnce() {
  rolls++;
  let baseChance = 0.01 * luck; // Base 1% chance modified by luck
  // Potions and gear can modify luck here (luck is already adjusted)

  if (Math.random() < baseChance) {
    // Randomly get an aura you don’t have
    let missing = auras.filter(a => !ownedAuras.has(a));
    if (missing.length > 0) {
      const newAura = missing[Math.floor(Math.random() * missing.length)];
      ownedAuras.add(newAura);
      alert(`You found a new aura: ${newAura}!`);
    }
  }

  // Auto aura add from gear
  gearItems.forEach(item => {
    if (gear.includes(item.id) && item.autoAura) {
      let missing = auras.filter(a => !ownedAuras.has(a));
      if (missing.length > 0 && Math.random() < 0.005) { // small chance per roll
        const newAura = missing[Math.floor(Math.random() * missing.length)];
        ownedAuras.add(newAura);
        alert(`Aura Charm granted you a new aura: ${newAura}!`);
      }
    }
  });

  // Random chance to find potions (very rare, ~1 in 1000 seconds)
  // Let's say each roll is ~1 second of game time modified by speed
  let potionRoll = Math.random();
  let potionChance = 1 / (1000 * speed);
  if (potionRoll < potionChance) {
    // Pick either luck or speed potion
    if (Math.random() < 0.5) {
      potions.luck++;
      alert("You found a Luck Potion!");
    } else {
      potions.speed++;
      alert("You found a Speed Potion!");
    }
  }

  saveState();
  updateUI();
}

// Quick roll 10 rolls at a time
function quickRoll() {
  for (let i = 0; i < 10; i++) {
    rollOnce();
  }
}

// Use a potion (luck or speed) for 30 seconds effect
let activeLuckPotion = false;
let activeSpeedPotion = false;
let luckPotionTimeout, speedPotionTimeout;

function useLuckPotion() {
  if (potions.luck > 0 && !activeLuckPotion) {
    potions.luck--;
    activeLuckPotion = true;
    luck += 0.5; // +0.5 luck for 30s
    updateUI();
    alert("Luck Potion activated for 30 seconds!");
    luckPotionTimeout = setTimeout(() => {
      luck -= 0.5;
      activeLuckPotion = false;
      updateUI();
      alert("Luck Potion effect expired.");
    }, 30000);
    saveState();
  }
}

function useSpeedPotion() {
  if (potions.speed > 0 && !activeSpeedPotion) {
    potions.speed--;
    activeSpeedPotion = true;
    speed += 0.5; // +0.5 speed for 30s
    updateUI();
    alert("Speed Potion activated for 30 seconds!");
    speedPotionTimeout = setTimeout(() => {
      speed -= 0.5;
      activeSpeedPotion = false;
      updateUI();
      alert("Speed Potion effect expired.");
    }, 30000);
    saveState();
  }
}

// Event listeners
document.getElementById("rollBtn").onclick = () => {
  rollOnce();
};

document.getElementById("quickRollBtn").onclick = () => {
  quickRoll();
};

document.getElementById("useLuckPotionBtn").onclick = () => {
  useLuckPotion();
};

document.getElementById("useSpeedPotionBtn").onclick = () => {
  useSpeedPotion();
};

// Initialize game
loadState();
updateUI();
