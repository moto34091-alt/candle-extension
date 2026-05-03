(function () {

    if (window.MOMO_ATR_RUNNING) return;
    window.MOMO_ATR_RUNNING = true;

    // =====================================
    // CREATE PANEL
    // =====================================
    const box = document.createElement("div");

    box.id = "momoAtrPro";

    box.style.position = "fixed";
    box.style.top = "20px";
    box.style.right = "20px";
    box.style.width = "260px";
    box.style.background = "rgba(15,15,20,0.96)";
    box.style.backdropFilter = "blur(12px)";
    box.style.border = "1px solid rgba(255,255,255,0.08)";
    box.style.borderRadius = "18px";
    box.style.padding = "16px";
    box.style.zIndex = "999999";
    box.style.fontFamily = "Arial, sans-serif";
    box.style.color = "white";
    box.style.boxShadow = "0 0 25px rgba(0,0,0,0.4)";

    document.body.appendChild(box);

    // =====================================
    // GET PRICES
    // =====================================
    function getPrices() {

        let prices = [];

        const elements = document.querySelectorAll("div, span");

        for (let el of elements) {

            const text = (el.innerText || "").trim();

            if (/^\d+\.\d{3,5}$/.test(text)) {

                prices.push(parseFloat(text));
            }
        }

        // Remove duplicates
        prices = [...new Set(prices)];

        return prices.slice(-120);
    }

    // =====================================
    // MOMENTUM
    // =====================================
    function getMomentum10(prices) {

        if (prices.length < 11) return 0;

        return prices[prices.length - 1] - prices[prices.length - 11];
    }

    // =====================================
    // ATR 14
    // =====================================
    function getATR14(prices) {

        if (prices.length < 15) return 0;

        let total = 0;

        for (let i = prices.length - 14; i < prices.length; i++) {

            total += Math.abs(prices[i] - prices[i - 1]);
        }

        return total / 14;
    }

    // =====================================
    // SIGNAL ANALYSIS
    // =====================================
    function analyze(prices) {

        const momentum = getMomentum10(prices);

        const atr = getATR14(prices);

        if (momentum > 0 && atr > 0.0002) {

            return {
                signal: "BUY",
                emoji: "🟢",
                color: "#00ff95",
                confidence: 87
            };
        }

        if (momentum < 0 && atr > 0.0002) {

            return {
                signal: "SELL",
                emoji: "🔴",
                color: "#ff4d67",
                confidence: 87
            };
        }

        return {
            signal: "WAIT",
            emoji: "🟡",
            color: "#ffd54f",
            confidence: 40
        };
    }

    // =====================================
    // CLICK BUY
    // =====================================
    function clickBuy() {

        const elements = document.querySelectorAll("button, div, span");

        for (let el of elements) {

            const t = (el.innerText || "").toLowerCase();

            if (
                t.includes("buy") ||
                t.includes("call") ||
                t.includes("up")
            ) {

                el.click();

                console.log("BUY CLICKED");

                return;
            }
        }
    }

    // =====================================
    // CLICK SELL
    // =====================================
    function clickSell() {

        const elements = document.querySelectorAll("button, div, span");

        for (let el of elements) {

            const t = (el.innerText || "").toLowerCase();

            if (
                t.includes("sell") ||
                t.includes("put") ||
                t.includes("down")
            ) {

                el.click();

                console.log("SELL CLICKED");

                return;
            }
        }
    }// =====================================
    // UPDATE PANEL
    // =====================================
    function updatePanel() {

        const prices = getPrices();

        if (prices.length < 5) {

            box.innerHTML = 

                <div style="text-align:center;">

                    <div style="
                        font-size:20px;
                        font-weight:bold;
                        color:#00e5ff;
                    ">
                        MOMO ATR PRO
                    </div>

                    <div style="
                        margin-top:18px;
                        color:#aaa;
                        font-size:14px;
                    ">
                        ⏳ Waiting market data...
                    </div>

                </div>

            ;

            return;
        }

        const result = analyze(prices);

        const momentum = getMomentum10(prices);

        const atr = getATR14(prices);

        const lastPrice = prices[prices.length - 1];

        // =====================================
        // DISPLAY
        // =====================================
        box.innerHTML = `

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
            ">

                <div>

                    <div style="
                        font-size:20px;
                        font-weight:bold;
                        color:#00e5ff;
                    ">
                        MOMO ATR PRO
                    </div>

                    <div style="
                        font-size:11px;
                        color:#888;
                    ">
                        Smart Signal Scanner
                    </div>

                </div>

                <div style="
                    width:12px;
                    height:12px;
                    border-radius:50%;
                    background:${result.color};
                    box-shadow:0 0 12px ${result.color};
                "></div>

            </div>

            <div style="
                margin-top:18px;
                padding:14px;
                border-radius:14px;
                background:rgba(255,255,255,0.04);
                text-align:center;
            ">

                <div style="font-size:32px;">
                    ${result.emoji}
                </div>

                <div style="
                    font-size:28px;
                    font-weight:bold;
                    color:${result.color};
                    margin-top:5px;
                ">
                    ${result.signal}
                </div>

                <div style="
                    margin-top:6px;
                    color:#bbb;
                    font-size:13px;
                ">
                    Confidence ${result.confidence}%
                </div>

            </div>

            <div style="
                margin-top:16px;
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:10px;
            ">

                <div style="
                    background:rgba(255,255,255,0.04);
                    padding:10px;
                    border-radius:12px;
                ">

                    <div style="
                        font-size:11px;
                        color:#888;
                    ">
                        Momentum
                    </div>

                    <div style="
                        font-size:16px;
                        font-weight:bold;
                    ">
                        ${momentum.toFixed(5)}
                    </div>

                </div>

                <div style="
                    background:rgba(255,255,255,0.04);
                    padding:10px;
                    border-radius:12px;
                "><div style="
                        font-size:11px;
                        color:#888;
                    ">
                        ATR 14
                    </div>

                    <div style="
                        font-size:16px;
                        font-weight:bold;
                    ">
                        ${atr.toFixed(5)}
                    </div>

                </div>

            </div>

            <div style="
                margin-top:10px;
                background:rgba(255,255,255,0.04);
                padding:10px;
                border-radius:12px;
            ">

                <div style="
                    font-size:11px;
                    color:#888;
                ">
                    Last Price
                </div>

                <div style="
                    font-size:17px;
                    font-weight:bold;
                    color:white;
                ">
                    ${lastPrice}
                </div>

            </div>

            <div style="
                display:flex;
                gap:10px;
                margin-top:18px;
            ">

                <button id="buyBtn"
                    style="
                        flex:1;
                        border:none;
                        padding:12px;
                        border-radius:12px;
                        background:#00c853;
                        color:white;
                        font-weight:bold;
                        cursor:pointer;
                    ">
                    BUY
                </button>

                <button id="sellBtn"
                    style="
                        flex:1;
                        border:none;
                        padding:12px;
                        border-radius:12px;
                        background:#ff1744;
                        color:white;
                        font-weight:bold;
                        cursor:pointer;
                    ">
                    SELL
                </button>

            </div>

        `;

        const buyBtn = document.getElementById("buyBtn");
        const sellBtn = document.getElementById("sellBtn");

        if (buyBtn) {
            buyBtn.onclick = clickBuy;
        }

        if (sellBtn) {
            sellBtn.onclick = clickSell;
        }
    }

    // =====================================
    // START ENGINE
    // =====================================
    setTimeout(() => {

        updatePanel();

        setInterval(updatePanel, 1200);

    }, 2500);

})();
