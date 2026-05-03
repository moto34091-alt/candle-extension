let box = document.createElement("div");
box.style.position = "fixed";
box.style.top = "20px";
box.style.right = "20px";
box.style.padding = "12px";
box.style.background = "#111";
box.style.color = "#fff";
box.style.fontSize = "18px";
box.style.zIndex = "999999";
box.style.borderRadius = "10px";
box.innerText = "Analyse...";
document.body.appendChild(box);

// 🔍 chercher valeurs numériques visibles
function getPrices() {
    let text = document.body.innerText;

    let matches = text.match(/\d+\.\d+/g);
    if (!matches) return [];

    return matches.slice(-20).map(Number);
}

// 📈 tendance simple
function trend(prices) {
    if (prices.length < 5) return "FLAT";

    let first = prices[0];
    let last = prices[prices.length - 1];

    if (last > first) return "UP";
    if (last < first) return "DOWN";
    return "FLAT";
}

// ⚡ momentum (vitesse)
function momentum(prices) {
    if (prices.length < 3) return 0;

    let a = prices[prices.length - 3];
    let b = prices[prices.length - 2];
    let c = prices[prices.length - 1];

    return (c - b) + (b - a);
}

// 🎯 signal intelligent
function signal(prices) {
    let t = trend(prices);
    let m = momentum(prices);

    if (t === "UP" && m > 0) return "🟢 BUY";
    if (t === "DOWN" && m < 0) return "🔴 SELL";

    return "⚠️ WAIT";
}

// 🔄 loop
setInterval(() => {
    let prices = getPrices();

    if (prices.length === 0) {
        box.innerText = "❌ No data";
        return;
    }

    let s = signal(prices);

    box.innerText =
        "Momentum AI\n" +
        s + "\n" +
        "Price: " + prices[prices.length - 1];

}, 2000);
