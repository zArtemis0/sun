let rollCount = parseInt(localStorage.getItem("rollCount")) || 0;
let isRolling = false;
let cooldown = 2000;
let autoRollEnabled = false;
let rollInterval;

const auras = [
    { name: "Common", chance: 60, class: "common" },
    { name: "Uncommon", chance: 25, class: "uncommon" },
    { name: "Rare", chance: 10, class: "rare" },
    { name: "Epic", chance: 4, class: "epic" },
    { name: "Legendary", chance: 0.9, class: "legendary" },
    { name: "Mythic", chance: 0.1, class: "mythic" }
];

const rollBtn = document.getElementById("rollBtn");
const result = document.getElementById("result");
const rollCountDisplay = document.getElementById("rollCount");
const autoRollCheckbox = document.getElementById("autoRoll");
const cooldownTimer = document.getElementById("cooldownTimer");

function updateRollCount() {
    rollCountDisplay.textContent = `Rolls: ${rollCount}`;
    localStorage.setItem("rollCount", rollCount);
}

function getRandomAura() {
    let rand = Math.random() * 100;
    let cumulative = 0;
    for (let aura of auras) {
        cumulative += aura.chance;
        if (rand < cumulative) return aura;
    }
    return auras[0]; // fallback
}

function handleRoll() {
    if (isRolling) return;

    isRolling = true;
    rollBtn.disabled = true;
    cooldownTimer.textContent = `Cooldown...`;

    const aura = getRandomAura();
    rollCount++;
    updateRollCount();

    result.innerHTML = `You rolled a <span class="${aura.class}">${aura.name}</span> aura!`;

    let delay = (rollCount >= 1000) ? 200 : cooldown;

    setTimeout(() => {
        isRolling = false;
        rollBtn.disabled = false;
        cooldownTimer.textContent = '';
    }, delay);
}

rollBtn.addEventListener("click", handleRoll);

autoRollCheckbox.addEventListener("change", (e) => {
    autoRollEnabled = e.target.checked;
    if (autoRollEnabled) {
        rollInterval = setInterval(() => {
            if (!isRolling) handleRoll();
        }, 100);
    } else {
        clearInterval(rollInterval);
    }
});

updateRollCount();
