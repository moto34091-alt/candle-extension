// ================= UI =================
function createBox() {
    const box = document.createElement("div");
    box.id = "signalBox";
    box.style.position = "fixed";
    box.style.top = "20px";
    box.style.right = "20px";
    box.style.padding = "15px";
    box.style.background = "#000";
    box.style.color = "#fff";
    box.style.fontSize = "20px";
    box.style.zIndex = "999999";
    box.style.borderRadius = "10px";
    box.innerText = "Analyse...";
    document.body.appendChild(box);
}
createBox();

function setSignal(text, color) {
    const box = document.getElementById("signalBox");
    box.innerText = text;
    box.style.color = color;
}

// ================= CANVAS =================
function getCanvas() {
    const list = document.querySelectorAll("canvas");
    return list[list.length - 1];
}

function getData(canvas) {
    return canvas.getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height);
}

// ================= EXTRACTION =================
function extractCandle(imageData, width, height, xStart) {

    let top = height, bottom = 0;
    let green = 0, red = 0;

    for (let x = xStart; x < xStart + 5; x++) {
        for (let y = 0; y < height; y++) {

            let i = (y * width + x) * 4;
            let r = imageData.data[i];
            let g = imageData.data[i + 1];

            if (g > r) {
                green++;
                top = Math.min(top, y);
                bottom = Math.max(bottom, y);
            }

            if (r > g) {
                red++;
                top = Math.min(top, y);
                bottom = Math.max(bottom, y);
            }
        }
    }

    let heightCandle = bottom - top;

    return {
        height: heightCandle,
        color: green > red ? "green" : "red",
        top,
        bottom
    };
}

// ================= CALCUL =================
function classify(c, avg) {
    let ratio = c.height / avg;

    if (ratio < 0.5) return "small";
    if (ratio > 1.2) return "big";
    return "normal";
}

// 📈 tendance simple
function detectTrend(c1, c2, c3) {
    if (c1.bottom < c2.bottom && c2.bottom < c3.bottom) return "UP";
    if (c1.top > c2.top && c2.top > c3.top) return "DOWN";
    return "FLAT";
}

// 🎯 zone extrême (haut/bas écran)
function detectZone(c3, height) {
    if (c3.bottom > height * 0.75) return "LOW";   // bas écran → BUY
    if (c3.top < height * 0.25) return "HIGH";     // haut écran → SELL
    return "MID";
}

// ================= STRATEGIE =================
function detectSignal(c1, c2, c3, avg, canvasHeight) {

    let t1 = classify(c1, avg);
    let t2 = classify(c2, avg);
    let t3 = classify(c3, avg);

    let trend = detectTrend(c1, c2, c3);
    let zone = detectZone(c3, canvasHeight);

    // base stratégie
    if (!(t1 === "big" && t2 === "small" && t3 === "big"))
        return "WAIT";

    // filtre tendance
    if (trend === "UP" && c3.color !== "green") return "WAIT";
    if (trend === "DOWN" && c3.color !== "red") return "WAIT";

    // filtre zone
    if (zone === "HIGH" && c3.color !== "red") return "WAIT";
    if (zone === "LOW" && c3.color !== "green") return "WAIT";

    // signal final
    if (c3.color === "green") return "BUY";
    if (c3.color === "red") return "SELL";

    return "WAIT";
}

// ================= LOOP =================
setInterval(() => {
    try {
        let canvas = getCanvas();
        if (!canvas) return;

        let data = getData(canvas);
        let w = canvas.width;
        let h = canvas.height;

        let c3 = extractCandle(data, w, h, w - 10);
        let c2 = extractCandle(data, w, h, w - 20);
        let c1 = extractCandle(data, w, h, w - 30);

        let avg = (c1.height + c2.height + c3.height) / 3;

        let signal = detectSignal(c1, c2, c3, avg, h);

        if (signal === "BUY") setSignal("🟢 BUY", "lime");
        else if (signal === "SELL") setSignal("🔴 SELL", "red");
        else setSignal("⚠️ WAIT", "yellow");

    } catch (e) {
        console.log(e);
    }
}, 1500);
