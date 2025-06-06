let options = ["10% de desconto", "20% de desconto", "30% de desconto", "Massagem Grátis"];
let startAngle = 0;
let spinTimeout = null;
let spinAngleStart = 0;
let spinTime = 0;
let spinTimeTotal = 0;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spin");
const editText = document.getElementById("editText");
const overlay = document.getElementById("overlay");
const winnerModal = document.getElementById("winnerModal");
const winnerText = document.getElementById("winnerText");
const closeWinner = document.getElementById("closeWinner");
const editModal = document.getElementById("editModal");
const editList = document.getElementById("editList");
const addOption = document.getElementById("addOption");
const saveOptions = document.getElementById("saveOptions");

const colorPalette = [
    "#f5f0e6",
    "#e3dacf", 
    "#d4c9b8",
    "#c6b8a0",
    "#b8a58d",
    "#a8927c",
    "#99836e",
    "#8b755e"
];

function getColorsList(n) {
    const palette = [...colorPalette];
    const result = [];
    let lastColor = null;

    for (let i = 0; i < n; i++) {
    const available = palette.filter(color => color !== lastColor);
    const color = available[i % available.length];
    result.push(color);
    lastColor = color;
    }

    return result;
}

function drawRouletteWheel() {
    const outsideRadius = 200;
    const insideRadius = 50;
    const textRadius = 130;
    const arc = Math.PI / (options.length / 2);
    const colors = getColorsList(options.length);

    ctx.clearRect(0, 0, 500, 500);

    for (let i = 0; i < options.length; i++) {
    const angle = startAngle + i * arc;
    ctx.fillStyle = colors[i];

    ctx.beginPath();
    ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
    ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
    ctx.fill();

    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(angle + arc / 2);
    ctx.fillStyle = "#4a4a4a";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const text = options[i];
    const words = text.split(" ");
    if (words.length > 2) {
        const firstLine = words.slice(0, Math.ceil(words.length / 2)).join(" ");
        const secondLine = words.slice(Math.ceil(words.length / 2)).join(" ");
        ctx.fillText(firstLine, textRadius, -10);
        ctx.fillText(secondLine, textRadius, 10);
    } else {
        ctx.fillText(text, textRadius, 0);
    }

    ctx.restore();
    }

    // desenha a seta
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(250 - 10, 250 - (outsideRadius + 20));
    ctx.lineTo(250 + 10, 250 - (outsideRadius + 20));
    ctx.lineTo(250, 250 - (outsideRadius - 10));
    ctx.fill();
}

function spin() {
    spinAngleStart = Math.random() * 20 + 30;
    spinTime = 0;
    spinTimeTotal = Math.random() * 3000 + 5000;
    rotateWheel();
}

function rotateWheel() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
    }
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI) / 180;
    drawRouletteWheel();
    spinTimeout = setTimeout(rotateWheel, 20);
}

function stopRotateWheel() {
    clearTimeout(spinTimeout);
    const arc = Math.PI / (options.length / 2);
    const degrees = (startAngle * 180) / Math.PI + 90;
    const arcd = (arc * 180) / Math.PI;
    const index = Math.floor((360 - (degrees % 360)) / arcd);
    winnerText.textContent = `Você ganhou: ${options[index]}`;
    overlay.classList.add("active");
    winnerModal.classList.add("active");
}

function easeOut(t, b, c, d) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
}

overlay.addEventListener("click", () => {
    overlay.classList.remove("active");
    winnerModal.classList.remove("active");
    editModal.classList.remove("active");
});

spinButton.addEventListener("click", spin);
canvas.addEventListener("click", spin);

// toque/arraste pra girar
let isDragging = false;
let lastY = 0;

canvas.addEventListener("mousedown", e => {
    isDragging = true;
    lastY = e.clientY;
});
canvas.addEventListener("mouseup", e => {
    if (isDragging) {
    const delta = e.clientY - lastY;
    if (Math.abs(delta) > 20) spin();
    isDragging = false;
    }
});
canvas.addEventListener("touchstart", e => {
    isDragging = true;
    lastY = e.touches[0].clientY;
});
canvas.addEventListener("touchend", e => {
    if (isDragging) {
    const delta = e.changedTouches[0].clientY - lastY;
    if (Math.abs(delta) > 20) spin();
    isDragging = false;
    }
});

// fechar modal resultado
closeWinner.addEventListener("click", () => {
    overlay.classList.remove("active");
    winnerModal.classList.remove("active");
});

// editar prêmios
editText.addEventListener("click", () => {
    editList.innerHTML = "";
    options.forEach((opt, i) => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";

    const input = document.createElement("input");
    input.value = opt;
    input.style.flexGrow = "1";
    input.style.fontSize = "14px";

    const btn = document.createElement("button");
    btn.textContent = "×";
    btn.className = "remove-button";
    btn.title = "Remover";
    btn.onclick = () => {
        options.splice(i, 1);
        editText.click();
    };

    div.appendChild(input);
    div.appendChild(btn);
    editList.appendChild(div);
    });
    editModal.classList.add("active");
    overlay.classList.add("active");
});

addOption.addEventListener("click", () => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";

    const input = document.createElement("input");
    input.placeholder = "Novo prêmio";
    input.style.flexGrow = "1";
    input.style.fontSize = "14px";

    const btn = document.createElement("button");
    btn.textContent = "×";
    btn.className = "remove-button";
    btn.title = "Remover";
    btn.onclick = () => div.remove();

    div.appendChild(input);
    div.appendChild(btn);
    editList.appendChild(div);
});

saveOptions.addEventListener("click", () => {
    const inputs = editList.querySelectorAll("input");
    options = Array.from(inputs).map(input => input.value.trim()).filter(Boolean);
    editModal.classList.remove("active");
    overlay.classList.remove("active");
    drawRouletteWheel();
});

drawRouletteWheel();
