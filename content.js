(function () {
    if (window.MOMO_ATR_RUNNING) return;
    window.MOMO_ATR_RUNNING = true;

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
    box.style.minWidth = "170px";
    box.style.textAlign = "center";
    document.body.appendChild(box);

    function getPrices() {
        let text = document.body.innerText || "";
        let matches = text.match(/\b\d+\.\d{3,5}\b/g);
        if (!matches) return [];
        return matches.slice(-100).map(Number);
    }

    // 📈 MOMENTUM 10
    function getMomentum10(prices) {
        if (prices.length < 11) return 0;
        return prices[prices.length - 1] - prices[prices.length - 11];
    }

    // 📊 ATR 14 (SIMULÉ)
    function getATR14(prices) {
        if (prices.length < 15) return 0;

        let total = 0;

        for (let i = prices.length - 14; i < prices.length; i++) {
            total += Math.abs(prices[i] - prices[i - 1]);
        }

        return total / 14;
    }

    function analyze(prices) {
        let momentum = getMomentum10(prices);
        let atr = getATR14(prices);

        if (momentum > 0 && atr > 0.0002) {
            return { signal: "🟢 BUY", confidence: 80 };
        }

        if (momentum < 0 && atr > 0.0002) {
            return { signal: "🔴 SELL", confidence: 80 };
        }

        return { signal: "⚠️ WAIT", confidence: 40 };
    }

    function clickBuy() {
        let elements = document.querySelectorAll("*");
        for (let el of elements) {
            let t = (el.innerText || "").toLowerCase();
            if (t.includes("call")  t.includes("buy")  t.includes("up")) {
                el.click();
                return;
            }
        }
    }

    function clickSell() {
        let elements = document.querySelectorAll("*");
        for (let el of elements) {
            let t = (el.innerText || "").toLowerCase();
            if (t.includes("put")  t.includes("sell")  t.includes("down")) {
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
            let momentum = getMomentum10(prices);
            let atr = getATR14(prices);

            box.innerHTML = 
                <b style="color:#00e5ff;">MOMO + ATR</b><br>
                ${result.signal}<br>
                ${result.confidence}%<br><br>

                MOM: ${momentum.toFixed(5)}<br>
                ATR: ${atr.toFixed(5)}<br><br>

                <button id="buyBtn">BUY</button>
                <button id="sellBtn">SELL</button>
            ;

            let buyBtn = document.getElementById("buyBtn");
            let sellBtn = document.getElementById("sellBtn");

            if (buyBtn) buyBtn.onclick = clickBuy;
            if (sellBtn) sellBtn.onclick = clickSell;

        }, 1200);
    }, 3000);

})();
