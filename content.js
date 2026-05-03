(function () {
    if (window.MOMO_RSI_RUNNING) return;
    window.MOMO_RSI_RUNNING = true;

    // UI
    let box = document.createElement("div");
    box.style.position = "fixed";
    box.style.bottom = "90px";
    box.style.right = "10px";
    box.style.padding = "10px";
    box.style.background = "rgba(0,0,0,0.85)";
    box.style.color = "#fff";
    box.style.fontSize = "12px";
    box.style.borderRadius = "10px";
    box.style.zIndex = "999999";
    box.style.minWidth = "180px";
    box.style.textAlign = "center";
    document.body.appendChild(box);

    function getPrices() {
        let text = document.body.innerText || "";
        let matches = text.match(/\b\d+\.\d{3,5}\b/g);
        if (!matches) return [];
        return matches.slice(-100).map(Number);
    }

    function getMomentum10(prices) {
        if (prices.length < 11) return 0;
        return prices[prices.length - 1] - prices[prices.length - 11];
    }

    function getRSI14(prices) {
        if (prices.length < 15) return 50;

        let gains = 0;
        let losses = 0;

        for (let i = prices.length - 14; i < prices.length; i++) {
            let diff = prices[i] - prices[i - 1];
            if (diff > 0) gains += diff;
            else losses -= diff;
        }

        if (losses === 0) return 100;

        let rs = gains / losses;
        return 100 - (100 / (1 + rs));
    }

    function analyze(prices) {
        let momentum = getMomentum10(prices);
        let rsi = getRSI14(prices);
        let strength = Math.abs(momentum);

        if (momentum > 0 && rsi > 50 && rsi < 70 && strength > 0.0003) {
            return { signal: "🟢 BUY", confidence: 80 };
        }

        if (momentum < 0 && rsi < 50 && rsi > 30 && strength > 0.0003) {
            return { signal: "🔴 SELL", confidence: 80 };
        }

        return { signal: "⚠️ WAIT", confidence: 40 };
    }

    function clickBuy() {
        let elements = document.querySelectorAll("*");
        for (let el of elements) {
            let t = (el.innerText || "").toLowerCase();
            if (
                t.includes("call") ||
                t.includes("buy") ||
                t.includes("up")
            ) {
                el.click();
                return;
            }
        }
    }

    function clickSell() {
        let elements = document.querySelectorAll("*");
        for (let el of elements) {
            let t = (el.innerText || "").toLowerCase();
            if (
                t.includes("put") ||
                t.includes("sell") ||
                t.includes("down")
            ) {
                el.click();
                return;
            }
        }
    }

    setTimeout(() => {
        setInterval(() => {

            let prices = getPrices();

            if (prices.length < 20) {
                box.innerHTML = "⏳ Loading...";
                return;
            }

            let result = analyze(prices);
            let rsi = getRSI14(prices);
            let momentum = getMomentum10(prices);

            // ✅ HTML CORRECT AVEC BACKTICKS
            box.innerHTML = 
                <b style="color:#00e5ff;">MOMO RSI MANUAL</b><br>
                ${result.signal}<br>
                ${result.confidence}%<br><br>

                RSI: ${rsi.toFixed(1)}<br>
                MOM: ${momentum.toFixed(5)}<br><br>

                <button id="buyBtn" style="background:#00c853;color:white;border:none;padding:6px 10px;margin:2px;border-radius:6px;cursor:pointer;">BUY</button>
                <button id="sellBtn" style="background:#d50000;color:white;border:none;padding:6px 10px;margin:2px;border-radius:6px;cursor:pointer;">SELL</button>
            ;

            let buyBtn = document.getElementById("buyBtn");
            let sellBtn = document.getElementById("sellBtn");

            if (buyBtn) buyBtn.onclick = clickBuy;
            if (sellBtn) sellBtn.onclick = clickSell;

        }, 1200);
    }, 3000);

})();
