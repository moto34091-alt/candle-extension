(function () {
    if (window.MOMO_RSI_RUNNING) return;
    window.MOMO_RSI_RUNNING = true;

    let lastSignal = "";
    let lastTradeTime = 0;

    // 🎯 UI BOX
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

    // 📥 GET PRICES
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

    // 📊 RSI 14
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

    // 🧠 ANALYSE SIMPLE
    function analyze(prices) {
        let momentum = getMomentum10(prices);
        let rsi = getRSI14(prices);
        let strength = Math.abs(momentum);

        if (momentum > 0 && rsi > 50 && rsi < 70 && strength > 0.0003) {
            return { signal: "BUY", confidence: 80 };
        }

        if (momentum < 0 && rsi < 50 && rsi > 30 && strength > 0.0003) {
            return { signal: "SELL", confidence: 80 };
        }

        return { signal: "WAIT", confidence: 40 };
    }

    // 🔊 SON
    function playBeep() {
        let ctx = new (window.AudioContext || window.webkitAudioContext)();
        let osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 800;
        osc.connect(ctx.destination);
        osc.start();
        setTimeout(() => osc.stop(), 150);
    }

    // 🎯 CLICK BUY
    function clickBuy() {
        let buttons = document.querySelectorAll("button");
        for (let btn of buttons) {
            let t = btn.innerText.toLowerCase();
            if (t.includes("call")  t.includes("buy")  t.includes("up")) {
                btn.click();
                return true;
            }
        }
        return false;
    }

    // 🎯 CLICK SELL
    function clickSell() {
        let buttons = document.querySelectorAll("button");
        for (let btn of buttons) {
            let t = btn.innerText.toLowerCase();
            if (t.includes("put")  t.includes("sell")  t.includes("down")) {
                btn.click();
                return true;
            }
        }
        return false;
    }

    // 🔁 LOOP
    setInterval(() => {
        let prices = getPrices();

        if (prices.length < 20) {
            box.innerHTML = "⏳ Loading...";
            return;
        }

        let result = analyze(prices);
        let rsi = getRSI14(prices);
        let momentum = getMomentum10(prices);
        let now = Date.now();

        box.innerHTML = 
            <b style="color:#00e5ff;">MOMO RSI PRO</b><br>
            ${result.signal}<br>
            ${result.confidence}%<br><br>
            RSI: ${rsi.toFixed(1)}<br>
            MOM: ${momentum.toFixed(5)}
        ;

        // 🤖 AUTO TRADE
        if (
            result.signal !== "WAIT" &&
            result.signal !== lastSignal &&
            now - lastTradeTime > 4000
        ) {
            if (result.signal === "BUY") clickBuy();
            if (result.signal === "SELL") clickSell();

            playBeep();
            navigator.vibrate && navigator.vibrate([200, 100, 200]);lastSignal = result.signal;
            lastTradeTime = now;
        }

    }, 1200);

})();
