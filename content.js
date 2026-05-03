(function () {
    if (window.BOUGIE_AI_RUNNING) return;
    window.BOUGIE_AI_RUNNING = true;

    let box = document.createElement("div");
    box.style.position = "fixed";
    box.style.bottom = "95px";
    box.style.right = "10px";
    box.style.padding = "10px";
    box.style.background = "rgba(15,15,15,0.9)";
    box.style.color = "#fff";
    box.style.fontSize = "12px";
    box.style.borderRadius = "12px";
    box.style.zIndex = "999999";
    box.style.minWidth = "170px";
    box.style.textAlign = "center";
    box.style.boxShadow = "0 0 12px rgba(0,0,0,0.4)";
    document.body.appendChild(box);

    let lastSignal = "";

    function getPrices() {
        let text = document.body.innerText || "";
        let matches = text.match(/\b\d+\.\d{3,5}\b/g);
        if (!matches) return [];
        return matches.slice(-50).map(Number);
    }

    function buildCandles(prices) {
        let candles = [];
        for (let i = 1; i < prices.length; i++) {
            let open = prices[i - 1];
            let close = prices[i];

            candles.push({
                open,
                close,
                high: Math.max(open, close),
                low: Math.min(open, close),
                body: Math.abs(close - open),
                bullish: close > open,
                bearish: close < open
            });
        }
        return candles;
    }

    function getMomentum(prices) {
        let recent = prices.slice(-6);
        let up = 0, down = 0, force = 0;

        for (let i = 1; i < recent.length; i++) {
            let diff = recent[i] - recent[i - 1];
            if (diff > 0) up++;
            if (diff < 0) down++;
            force += Math.abs(diff);
        }

        return {
            dir: up > down ? "UP" : down > up ? "DOWN" : "NONE",
            strength: force
        };
    }

    function microMomentum(prices) {
        let last3 = prices.slice(-3);
        let up = 0, down = 0;

        for (let i = 1; i < last3.length; i++) {
            if (last3[i] > last3[i - 1]) up++;
            if (last3[i] < last3[i - 1]) down++;
        }

        if (up === 2) return "UP";
        if (down === 2) return "DOWN";
        return "NONE";
    }

    function getSR(prices) {
        let recent = prices.slice(-20);
        return {
            support: Math.min(...recent),
            resistance: Math.max(...recent)
        };
    }

    function isFakeBreakout(prices, sr) {
        let last = prices[prices.length - 1];
        let prev = prices[prices.length - 2];

        if (prev > sr.resistance && last < sr.resistance) return true;
        if (prev < sr.support && last > sr.support) return true;

        return false;
    }

    function engulfing(c1, c2) {
        if (!c1 || !c2) return null;

        if (c1.bearish && c2.bullish && c2.close > c1.open) return "BUY";
        if (c1.bullish && c2.bearish && c2.close < c1.open) return "SELL";

        return null;
    }

    function analyze(candles, prices) {
        if (candles.length < 12) {
            return { signal: "⚠️ WAIT", confidence: 0, reason: "No data" };
        }

        let momentum = getMomentum(prices);
        let micro = microMomentum(prices);
        let sr = getSR(prices);
        let fake = isFakeBreakout(prices, sr);

        if (fake) {
            return {
                signal: "⚠️ WAIT",
                confidence: 10,
                reason: "Fake breakout"
            };
        }

        if (momentum.strength < 0.0015) {
            return {
                signal: "⚠️ WAIT",
                confidence: 20,
                reason: "Low momentum"
            };
        }

        let last = prices[prices.length - 1];
        let c1 = candles[candles.length - 2];
        let c2 = candles[candles.length - 1];

        let score = 0;
        let reason = [];

        if (momentum.dir === "UP") {
            score += 2;
            reason.push("Momentum UP");
        }

        if (momentum.dir === "DOWN") {
            score += 2;
            reason.push("Momentum DOWN");
        }if (last > sr.resistance) {
            score += 3;
            reason.push("Break Resistance");
        }

        if (last < sr.support) {
            score += 3;
            reason.push("Break Support");
        }

        let eng = engulfing(c1, c2);
        if (eng === "BUY") {
            score += 3;
            reason.push("Engulfing BUY");
        }

        if (eng === "SELL") {
            score += 3;
            reason.push("Engulfing SELL");
        }

        // 🔥 SNIPER MODE
        if (score >= 7 && momentum.dir === "UP" && micro === "UP") {
            return {
                signal: "🟢 BUY",
                confidence: 92 + score,
                reason: "SNIPER BUY | " + reason.join(" | ")
            };
        }

        if (score >= 7 && momentum.dir === "DOWN" && micro === "DOWN") {
            return {
                signal: "🔴 SELL",
                confidence: 92 + score,
                reason: "SNIPER SELL | " + reason.join(" | ")
            };
        }

        return {
            signal: "⚠️ WAIT",
            confidence: 50,
            reason: "No clear setup"
        };
    }

    setInterval(() => {
        let prices = getPrices();

        if (!prices.length) {
            box.innerHTML = "❌ No data";
            return;
        }

        let candles = buildCandles(prices);
        let result = analyze(candles, prices);
        let current = prices[prices.length - 1];

        box.innerHTML = 
            <b style="color:#FFD700;">BOUGIE AI PRO</b><br>
            ${result.signal}<br>
            ${result.confidence}%<br>
            <small>${result.reason}</small><br>
            <small>${current}</small><br><br>

            <button id="buyBtn" style="
                background:#00c853;
                color:white;
                border:none;
                padding:6px 10px;
                margin:2px;
                border-radius:6px;
                cursor:pointer;
            ">BUY</button>

            <button id="sellBtn" style="
                background:#d50000;
                color:white;
                border:none;
                padding:6px 10px;
                margin:2px;
                border-radius:6px;
                cursor:pointer;
            ">SELL</button>
        ;

        // 🎯 boutons rapides
        let buyBtn = document.getElementById("buyBtn");
        let sellBtn = document.getElementById("sellBtn");

        if (buyBtn) {
            buyBtn.onclick = () => {
                let realBuy = document.querySelector('[class*="call"]');
                if (realBuy) realBuy.click();
            };
        }

        if (sellBtn) {
            sellBtn.onclick = () => {
                let realSell = document.querySelector('[class*="put"]');
                if (realSell) realSell.click();
            };
        }

        // 🤖 AUTO MODE (optionnel)
        if (
            result.confidence >= 95 &&
            lastSignal !== result.signal
        ) {
            if (result.signal.includes("BUY")) {
                let btn = document.querySelector('[class*="call"]');
                btn && btn.click();
            }

            if (result.signal.includes("SELL")) {
                let btn = document.querySelector('[class*="put"]');
                btn && btn.click();
            }

            navigator.vibrate && navigator.vibrate([200, 100, 200]);
            lastSignal = result.signal;
        }

    }, 1500);

})();
