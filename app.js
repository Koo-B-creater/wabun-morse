const APP_VERSION =
    "0.3.3";

const RELEASE_DATE =
    "2026/06/26";

const CHANGE_LOG = [

    {
        version : "0.3.4",
        date : "2026/06/26",
        changes : [
            "モールス辞典を追加",
            "ひらがな・数字・記号をアコーディオン表示",
            "文字選択時に詳細ポップアップを表示",
            "辞典専用モールス円を追加",
            "モールス再生をポップアップ内へ移行",
            "スマホ向けに辞典レイアウトを最適化"
        ]
    },

    {
        version : "0.3.3",
        date : "2026/06/26",
        changes : [
            "更新履歴画面を追加",
            "問題ごとに答えモードに、もう一度聞く機能を追加",
            "シャドーイング時のモールス併記ON/OFFを追加"
        ]
    },

    {
        version : "0.3.2",
        date : "2026/06/20",
        changes : [
            "シャドーイング機能を追加"
        ]
    },

    {
        version : "0.3.2",
        date : "2026/06/19",
        changes : [
            "数字（0-9）と記号の一部に対応",
            "トップ画面にバージョンと日付を表示",
            "GitHub Pages版を公開"
        ]
    },

    {
        version : "0.3.1",
        date : "2026/06/18",
        changes : [
            "出題範囲指定機能を追加",
            "モールス指定出題を追加",
            "出題文字の重複設定を追加",
            "設定画面のレイアウトを改善",
            "スマホ表示を改善"
        ]
    },

    {
        version : "0.3.0",
        date : "2026/06/17",
        changes : [
            "本番形式を実装",
            "練習形式を実装",
            "モールス発光・音声再生を実装",
            "設定保存に対応",
            "結果表示画面を実装"
        ]
    },

    {
        version : "0.2.0",
        date : "2026/06/xx",
        changes : [
            "HTML/CSS/JavaScript版へ移行",
            "レスポンシブ対応開始"
        ]
    },

    {
        version : "0.1.0",
        date : "2026/06/xx",
        changes : [
            "和文モールス練習アプリ　初版作成"
        ]
    }

];

// ==================================================
// グローバル変数
// ==================================================
"use strict";

let audioContext = null;
let answers = [];
let isRunning = false;
let examAnswers = [];

// ==================================================
// 設定
// ==================================================

const SETTINGS = {

    signalMode : "both",

    unitTime : 200,

    elementGap : 100,      // 将来使用予定

    characterGap : 300,    // 将来使用予定

    questionGap : 2000,

    questionCount : 10,

    questionChars : "",

    practiceMode : "normal",

    showShadowCode : false,

    allowDuplicate : false,

    charSelectMode : "morse",

    morsePrefix : ".",

    startChar : "",

    endChar : ""

};


// ==================================================
// モールス辞書
// ==================================================

const MORSE = {

    "ア":"--.--",
    "イ":".-",
    "ウ":"..-",
    "エ":"-.---",
    "オ":".-...",

    "カ":".-..",
    "キ":"-.-..",
    "ク":"...-",
    "ケ":"-.--",
    "コ":"----",

    "サ":"-.-.-",
    "シ":"--.-.",
    "ス":"---.-",
    "セ":".---.",
    "ソ":"---.",

    "タ":"-.",
    "チ":"..-.",
    "ツ":".--.",
    "テ":".-.--",
    "ト":"..-..",

    "ナ":".-.",
    "ニ":"-.-.",
    "ヌ":"....",
    "ネ":"--.-",
    "ノ":"..--",

    "ハ":"-...",
    "ヒ":"--..-",
    "フ":"--..",
    "ヘ":".",
    "ホ":"-..",

    "マ":"-..-",
    "ミ":"..-.-",
    "ム":"-",
    "メ":"-...-",
    "モ":"-..-.",

    "ヤ":".--",
    "ユ":"-..--",
    "ヨ":"--",

    "ラ":"...",
    "リ":"--.",
    "ル":"-.--.",
    "レ":"---",
    "ロ":".-.-",

    "ワ":"-.-",
    "ヰ":".-..-",
    "ヲ":".---",
    "ヱ":".--..",
    "ン":".-.-.",

    "゛":"..",
    "゜":"..--.",

    "0":"-----",
    "1":".----",
    "2":"..---",
    "3":"...--",
    "4":"....-",
    "5":".....",
    "6":"-....",
    "7":"--...",
    "8":"---..",
    "9":"----.",
    
    "ー":".--.-"

};
const DICTIONARY_GROUPS = [

    {
        title : "ひらがな",
        rows : [
            { title:"ア行", chars:["ア","イ","ウ","エ","オ"] },
            { title:"カ行", chars:["カ","キ","ク","ケ","コ"] },
            { title:"サ行", chars:["サ","シ","ス","セ","ソ"] },
            { title:"タ行", chars:["タ","チ","ツ","テ","ト"] },
            { title:"ナ行", chars:["ナ","ニ","ヌ","ネ","ノ"] },
            { title:"ハ行", chars:["ハ","ヒ","フ","ヘ","ホ"] },
            { title:"マ行", chars:["マ","ミ","ム","メ","モ"] },
            { title:"ヤ行", chars:["ヤ","ユ","ヨ"] },
            { title:"ラ行", chars:["ラ","リ","ル","レ","ロ"] },
            { title:"ワ行", chars:["ワ","ヰ","ヱ","ヲ","ン"] },
            { title:"濁点・半濁点", chars:["゛","゜"] }
        ]
    },

    {
        title : "数字",
        rows : [
            { title:"数字", chars:["0","1","2","3","4","5","6","7","8","9"] }
        ]
    },

    {
        title : "記号",
        rows : [
            { title:"記号", chars:["ー"] }
        ]
    }

];

function getShadowText(char){

    const code = MORSE[char];

    let result = "";

    for(
        let i = 1;
        i <= code.length;
        i++
    ){

        const prefix =
            code.slice(0,i);

        const found =
            Object.keys(MORSE)
                .find(
                    key =>
                    MORSE[key] === prefix
                );

        if(found){

            result += found;
        }

    }

    return result;
}

const ALL_CHARS =
    Object.keys(MORSE);

const settingsButton =
    document.getElementById("settingsButton");

const retryExamBtn =
    document.getElementById("retryExamBtn");


// ==================================================
// ユーティリティ
// ==================================================

function sleep(ms){

    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );

}

function shuffleArray(array){

    const result = [...array];

    for(
        let i = result.length - 1;
        i > 0;
        i--
    ){

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [result[i], result[j]] =
        [result[j], result[i]];
    }

    return result;
}



// ==================================================
// 設定保存
// ==================================================

function saveSettings(){

    localStorage.setItem(
        "morseSettings",
        JSON.stringify(SETTINGS)
    );

}

function loadSettings(){

    const saved =
        localStorage.getItem(
            "morseSettings"
        );

    if(saved){

        Object.assign(
            SETTINGS,
            JSON.parse(saved)
        );
    }
}

loadSettings();

if(!SETTINGS.practiceMode){

    SETTINGS.practiceMode =
        "normal";
}

updateCharSelectModeUI();

// ==================================================
// 画面制御
// ==================================================

function showScreen(screenId){

    const screens =
        document.querySelectorAll(".screen");

    screens.forEach(screen => {

        screen.style.display = "none";

    });

    document
        .getElementById(screenId)
        .style.display = "flex";
}

function openHistory(){

    const area =
        document.getElementById(
            "changeLogArea"
        );

    let html = "";

    CHANGE_LOG.forEach(log => {

        html +=
        `<div class="changeLogItem">

            <div class="changeLogVersion">
                ▼ Ver ${log.version}
            </div>

            <div class="changeLogDate">
                ${log.date}
            </div>

            <ul>`;

        log.changes.forEach(change => {

            html +=
                `<li>${change}</li>`;

        });

        html +=
            `</ul>

        </div>`;
    });

    area.innerHTML = html;

    showScreen(
        "historyScreen"
    );
}

function openDictionary(){

    const area =
        document.getElementById(
            "dictionaryArea"
        );

    let html = "";

    DICTIONARY_GROUPS.forEach(group => {

        html +=
            `<details class="dictionaryItem">

                <summary class="dictionaryTitle">
                    ${group.title}
                </summary>`;

        group.rows.forEach(row => {

            html +=
                `<div class="dictionaryGroupTitle">
                    ${row.title}
                </div>

                <div class="dictionaryButtonGrid">`;

            row.chars.forEach(char => {

                if(MORSE[char]){

                    html +=
                        `<button
                            class="dictionaryCharButton"
                            data-char="${char}">
                            ${char}
                        </button>`;
                }

            });

            html +=
                `</div>`;
        });

        html +=
            `</details>`;
    });

    area.innerHTML = html;

    document
        .querySelectorAll(
            ".dictionaryCharButton"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openDictionaryPopup(
                        button.dataset.char
                    );
                }
            );

        });

    showScreen(
        "dictionaryScreen"
    );
}

function openDictionaryPopup(char){

    dictionaryCurrentChar =
        char;

    const overlay =
        document.getElementById(
            "dictionaryOverlay"
        );

    document
        .getElementById(
            "dictionaryPopupChar"
        )
        .textContent =
        char;

    document
        .getElementById(
            "dictionaryPopupCode"
        )
        .textContent =
        MORSE[char];

    const shadow =
        getShadowText(char);

    document
        .getElementById(
            "dictionaryPopupShadow"
        )
        .innerHTML =
        shadow.slice(0,-1)
        + "<span class='dictionaryFinalChar'>"
        + shadow.slice(-1)
        + "</span>";

    const playButton =
        document.getElementById(
            "dictionaryPlayButton"
        );

    if(playButton){

        playButton.disabled =
            false;
    }

    overlay.style.display =
        "flex";
}
async function playDictionaryChar(){

    if(
        dictionaryCurrentChar === ""
    ){

        return;
    }

    const playButton =
        document.getElementById(
            "dictionaryPlayButton"
        );

    playButton.disabled =
        true;

    isRunning =
        true;

    await playDictionaryMorse(
        MORSE[dictionaryCurrentChar]
    );

    isRunning =
        false;

    playButton.disabled =
        false;
}
async function playDictionaryMorse(code){

    const signal =
        document.getElementById(
            "dictionarySignal"
        );

    for(
        let i = 0;
        i < code.length;
        i++
    ){

        if(!isRunning){

            signal.classList.remove(
                "on"
            );

            return;
        }

        const c =
            code[i];

        const osc =
            SETTINGS.signalMode !== "visual"
            ? startBeep()
            : null;

        if(
            SETTINGS.signalMode !== "audio"
        ){

            signal.classList.add(
                "on"
            );
        }

        if(c === "."){

            await sleep(
                SETTINGS.unitTime
            );

        }else{

            await sleep(
                SETTINGS.unitTime * 3
            );
        }

        stopBeep(osc);

        signal.classList.remove(
            "on"
        );

        await sleep(
            SETTINGS.unitTime
        );
    }
}
function closeDictionaryPopup(){

    isRunning = false;

    dictionaryCurrentChar =
        "";

    document
        .getElementById(
            "dictionaryOverlay"
        )
        .style.display =
        "none";

    document
        .getElementById(
            "dictionaryPopupChar"
        )
        .textContent =
        "";

    document
        .getElementById(
            "dictionaryPopupCode"
        )
        .textContent =
        "";

    document
        .getElementById(
            "dictionaryPopupShadow"
        )
        .textContent =
        "";

    document
        .getElementById(
            "dictionarySignal"
        )
        .classList.remove(
            "on"
        );
}
// ==================================================
// 音と光
// ==================================================

function signalOn(){

    if(!isRunning)return null;

    document.getElementById("signal")
            .style.display="block";

    if(SETTINGS.signalMode !=="audio"){
        document
            .getElementById("morseArea")
            .style.display ="flex";

        document
            .getElementById("signal")
            .classList.add("on");
    }

    if(SETTINGS.signalMode !=="visual"){

        return startBeep();
    }

    return null;
}

function signalOff(){

    document
        .getElementById("signal")
        .classList.remove("on");

    document.getElementById("morseArea")
            .style.display="none";
}

function startBeep(){

    if(!audioContext){

        audioContext =
            new AudioContext();
    }

    const oscillator =
        audioContext.createOscillator();

    oscillator.type = "sine";

    oscillator.frequency.value = 700;

    oscillator.connect(
        audioContext.destination
    );

    oscillator.start();

    return oscillator;
}

function stopBeep(oscillator){

    if(oscillator){

        oscillator.stop();
    }
}

// ==================================================
// モールス再生
// ==================================================

async function playMorse(code){

    for(
        let i = 0;
        i < code.length;
        i++
    ){
        if(!isRunning){signalOff();return;}

        const c = code[i];

        const osc =
            signalOn();

        if(c === "."){

            await sleep(
                SETTINGS.unitTime
            );

        }else{

            await sleep(
                SETTINGS.unitTime * 3
            );
        }

        stopBeep(osc);

        signalOff();

        await sleep(
            SETTINGS.unitTime
        );
    }
}

async function playCharacter(char){

    const code =
        MORSE[char];

    await playMorse(code);

}

// ==================================================
// 出題
// ==================================================
function getAvailableChars(){

    switch(SETTINGS.charSelectMode){

        case "manual":

            return [...SETTINGS.questionChars];

        case "all":

            return [...ALL_CHARS];

        case "range":{

            const start =
                ALL_CHARS.indexOf(
                    SETTINGS.startChar
                );

            const end =
                ALL_CHARS.indexOf(
                    SETTINGS.endChar
                );

            if(
                start === -1 ||
                end === -1
            ){
                return [];
            }

            const from =
                Math.min(start,end);

            const to =
                Math.max(start,end);

            return ALL_CHARS.slice(
                from,
                to + 1
            );
        }

        case "morse":

            if(
                SETTINGS.morsePrefix === ""
            ){
                return [];
            } 

            return ALL_CHARS.filter(
                c =>
                    MORSE[c]
                    .startsWith(
                        SETTINGS.morsePrefix
                    )
            );

        default:

            return [];
    }
}

function updateCharSelectModeUI(){


    const mode =
        SETTINGS.charSelectMode;

    const manualFields =
        document.getElementById(
            "manualFields"
        );

    const rangeFields =
        document.getElementById(
            "rangeFields"
        );

    const morseFields =
        document.getElementById(
            "morseFields"
        );

    manualFields.style.display =
        mode === "manual"
        ? "block"
        : "none";

    rangeFields.style.display =
        mode === "range"
        ? "block"
        : "none";

    morseFields.style.display =
        mode === "morse"
        ? "block"
        : "none";
}

function getQuestionList(){

    return SETTINGS
        .questionChars
        .split("");

}

function createQuestions(){

    const chars =
        getAvailableChars();

    const result = [];

    if(chars.length === 0){

        alert(
            "出題文字がありません"
        );

        return [];
    }
    if(
        !SETTINGS.allowDuplicate &&
        SETTINGS.questionCount >
        chars.length
    ){

        alert(
            "問題数が出題可能文字数を超えています"
        );

        return [];
    }

    if(
        SETTINGS.allowDuplicate
    ){

        for(
            let i = 0;
            i < SETTINGS.questionCount;
            i++
        ){

            const index =
                Math.floor(
                    Math.random() *
                    chars.length
                );

            result.push(
                chars[index]
            );
        }

    }else{

        const shuffled =
            shuffleArray(chars);

        const count =
            Math.min(
                SETTINGS.questionCount,
                shuffled.length
            );

        for(
            let i = 0;
            i < count;
            i++
        ){

            result.push(
                shuffled[i]
            );
        }
    }

    return result;
}

async function runQuestions(){

    answers = [];

    const questionList =
        createQuestions();
    for(
        let i = 0;
        i < questionList.length;
        i++
    ){
        if(!isRunning){

            return;
        }

        document
            .getElementById("signal")
            .style.display = "block";

        const char =
            questionList[i];

        answers.push(char);

        if(
            SETTINGS.practiceMode === "shadowing"
        ){

            const answerArea =
                document.getElementById(
                    "answerArea"
                );

            answerArea.style.display =
                "block";

            answerArea.classList.add(
                "shadowing"
            );

            let text =
                getShadowText(char);

            if(
                SETTINGS.showShadowCode
            ){

                text +=
                    "\n" +
                    MORSE[char];
            }

            answerArea.textContent =
                text;
        }

        await playCharacter(char);

        if(
            SETTINGS.practiceMode === "shadowing"
        ){

            document
                .getElementById("answerArea")
                .textContent = "";

            document
                .getElementById("answerArea")
                .style.display =
                "none";
        }

        if(!isRunning){

            return;
        }

        if(
            SETTINGS.practiceMode ===
            "answerEach"
        ){

            const replayButton =
                document.getElementById(
                    "replayQuestionButton"
                );

            replayButton.style.display =
                "block";

            replayButton.onclick = async () => {

                if(!isRunning){

                    return;
                }

                replayButton.disabled = true;

                await playCharacter(char);

                if(!isRunning){

                    replayButton.style.display =
                        "none";

                    replayButton.disabled =
                        false;

                    return;
                }

                replayButton.disabled = false;
            };

            await waitForButton("showOneAnswerButton");

             if(!isRunning){

                return;
            }
           
            document
                .getElementById("showOneAnswerButton")
                .style.display = "none";

            document
                .getElementById("replayQuestionButton")
                .style.display = "none";

            document
                .getElementById("signal")
                .style.display = "none";

            document
                .getElementById("answerArea")
                .style.display = "block";

            document
                .getElementById("answerArea")
                .textContent = char;

            await waitForButton("nextButton");

            if(!isRunning){

                return;
            }            

            answerArea.textContent = "";

            answerArea.style.display =
                "none";

            answerArea.classList.remove(
                "shadowing"
            );

            document
                .getElementById("showOneAnswerButton")
                .style.display = "block";

        }else{

            await sleep(SETTINGS.questionGap);
        }
    }

    document
        .getElementById("signal")
        .style.display = "none";

    document
        .getElementById(
            "showOneAnswerButton"
        )
        .style.display = "none";

    document
        .getElementById(
            "nextButton"
        )
        .style.display = "none";
}

// ==================================================
// 練習形式
// ==================================================

async function countdown(){

    const countdownEl =
        document.getElementById(
            "countdown"
        );

    countdownEl.style.display =
        "block";

    for(
        let i = 3;
        i >= 1;
        i--
    ){

        if(!isRunning){

            countdownEl.textContent = "";

            return;
        }

        countdownEl.textContent = i;

        await sleep(1000);
    }

    if(!isRunning){

        countdownEl.textContent = "";

        return;
    }

    countdownEl.textContent =
        "開始";

    await sleep(1000);

    countdownEl.textContent = "";
}

async function startPractice(){

    isRunning = true;

    document
        .getElementById("countdown")
        .style.display = "block";

    document
        .getElementById("displayArea")
        .style.display = "flex";

    document
        .getElementById("startButton")
        .style.display = "none";

    document
        .getElementById("showOneAnswerButton")
        .style.display = "none";

    document
        .getElementById("replayQuestionButton")
        .style.display = "none";

    document
        .getElementById("nextButton")
        .style.display = "none";
        
    document
        .getElementById("showAnswerButton")
        .style.display = "none";

    document
        .getElementById("retryButton")
        .style.display = "none";

    document
        .getElementById("answerArea")
        .textContent = "";

    document
        .getElementById("answerArea")
        .style.display = "none";

    document
        .getElementById("resultArea")
        .style.display = "none";

    document
        .getElementById("resultArea")
        .textContent = "";

    document
        .getElementById("signal")
        .style.display = "none";

    await countdown();

    if(!isRunning){
    return;
    }

    await runQuestions();

    if(!isRunning){
        return;
    }

    document
        .getElementById("showAnswerButton")
        .style.display = "block";
            
}

// ==================================================
// 解答表示
// ==================================================

function showAnswers(){

    let text = "";

    for(
        let i = 0;
        i < answers.length;
        i++
    ){

        text +=
            (i + 1)
            + " : "
            + answers[i]
            + "\n";
    }

    document
        .getElementById("showAnswerButton")
        .style.display = "none";

    document
        .getElementById("signal")
        .style.display = "none";

    document
        .getElementById("countdown")
        .style.display = "none";

    document
        .getElementById("displayArea")
        .style.display = "none";

    document
        .getElementById("resultArea")
        .style.display = "block";

    document
        .getElementById("resultArea")
        .textContent = text;
    document
        .getElementById("startButton")
        .style.display = "none";

    document
        .getElementById("retryButton")
        .style.display = "block";
}

function openSettings(){

    document.getElementById(
        "questionCount"
    ).value =
        SETTINGS.questionCount;

    document.getElementById(
        "questionChars"
    ).value =
        SETTINGS.questionChars;

    document.getElementById(
        "allowDuplicate"
    ).checked =
        SETTINGS.allowDuplicate;

    document.getElementById(
        "unitTimeInput"
    ).value =
        SETTINGS.unitTime;

    document.getElementById(
        "questionGapInput"
    ).value =
        SETTINGS.questionGap;

    document
        .getElementById(
            "showShadowCode"
        )
        .checked =
        SETTINGS.showShadowCode;
    

    const modeRadio =
        document.querySelector(
            `input[name="charSelectMode"][value="${SETTINGS.charSelectMode}"]`
        );

    if(modeRadio){

        modeRadio.checked = true;

    }

    document.getElementById(
        "morsePrefix"
    ).value =
        SETTINGS.morsePrefix;

    document.getElementById(
        "startChar"
    ).value =
        SETTINGS.startChar;


    document.getElementById(
        "endChar"
    ).value =
        SETTINGS.endChar;

    const radio =
        document.querySelector(
            `input[name="signalMode"][value="${SETTINGS.signalMode}"]`
        );

    if(radio){

        radio.checked = true;

    } 
    updateCharSelectModeUI();
    showScreen(
        "settingScreen"
    );
    
}

function saveSettingScreen(){

    SETTINGS.questionCount =
        Number(
            document.getElementById(
                "questionCount"
            ).value
        );

    SETTINGS.questionChars =
        document.getElementById(
            "questionChars"
        ).value;

    SETTINGS.allowDuplicate =
        document.getElementById(
            "allowDuplicate"
        ).checked;

    SETTINGS.signalMode =
        document.querySelector(
            'input[name="signalMode"]:checked'
        ).value;

    SETTINGS.unitTime =
        Number(
            document.getElementById(
                "unitTimeInput"
            ).value
        );

    SETTINGS.questionGap =
        Number(
            document.getElementById(
                "questionGapInput"
            ).value
        );

    const mode =
        document.querySelector(
            'input[name="charSelectMode"]:checked'
        );

    if(mode){

        SETTINGS.charSelectMode =
            mode.value;

    }

    SETTINGS.morsePrefix =
        document.getElementById(
            "morsePrefix"
        ).value;

    SETTINGS.startChar =
        document.getElementById(
            "startChar"
        ).value;

    SETTINGS.endChar =
        document.getElementById(
            "endChar"
        ).value;

    SETTINGS.showShadowCode =

        document
            .getElementById(
                "showShadowCode"
            )
            .checked;

    saveSettings();

    showScreen("topScreen");
}

const radio =
document.querySelector(
`input[name="signalMode"][value="${SETTINGS.signalMode}"]`
);

function openPracticeSettings(){

    const radio =
        document.querySelector(
            `input[name="practiceMode"][value="${SETTINGS.practiceMode}"]`
        );

    if(radio){

        radio.checked = true;
    }

    document
        .getElementById(
            "showShadowCode"
        )
        .checked =
        SETTINGS.showShadowCode;

    updatePracticeModeUI();

    showScreen(
        "practiceSettingScreen"
    );
}

function updatePracticeModeUI(){

    const shadowCodeArea =
        document.getElementById(
            "shadowCodeArea"
        );

    const mode =
        document.querySelector(
            'input[name="practiceMode"]:checked'
        )?.value;

    shadowCodeArea.style.display =
        mode === "shadowing"
        ? "block"
        : "none";
}

function savePracticeSettings(){

    const radio =
        document.querySelector(
            'input[name="practiceMode"]:checked'
        );

    if(radio){

        SETTINGS.practiceMode =
            radio.value;
    }

    SETTINGS.showShadowCode =

        document
            .getElementById(
                "showShadowCode"
            )
            .checked;

    saveSettings();

    showScreen(
        "practiceScreen"
    );
}

function waitForButton(buttonId){

    return new Promise(resolve => {

        const button =
            document.getElementById(
                buttonId
            );

        button.style.display =
            "block";

        button.onclick = () => {

            button.style.display =
                "none";

            resolve();
        };

        const checkStop =
            setInterval(() => {

                if(!isRunning){

                    clearInterval(
                        checkStop
                    );

                    button.style.display =
                        "none";

                    resolve();
                }

            }, 100);
    });
}

// ==================================================
// 本番形式
// ==================================================

async function startExam(){

    isRunning = true;

    examAnswers = [];

    document
        .getElementById("examCountdown")
        .style.display = "block";
    
    document
        .getElementById("examDisplayArea")
        .style.display = "flex";

    document
        .getElementById("examStartButton")
        .style.display = "none";

    document
        .getElementById("examResultArea")
        .style.display = "none";

    document
        .getElementById("examResultArea")
        .textContent = "";

    document
        .getElementById("retryExamBtn")
        .style.display = "none";

    await runExam();

    if(!isRunning){

        return;
    }
}

async function restartExam(){

    if(isRunning){

        return;

    }

    document
        .getElementById("examCountdown")
        .style.display = "block";
    
    document
        .getElementById("examDisplayArea")
        .style.display = "flex";    
    document
        .getElementById(
            "retryExamBtn"
        )
        .style.display = "none";

    document
        .getElementById(
            "examResultArea"
        )
        .style.display = "none";

    document
        .getElementById(
            "examResultArea"
        )
        .textContent = "";

    isRunning = true;

    await runExam();

}

async function countdownExam(){

    const countdownEl =
        document.getElementById(
            "examCountdown"
        );

    countdownEl.textContent =
        "まもなく開始";

    await sleep(1000);

    for(
        let i = 3;
        i >= 1;
        i--
    ){

        if(!isRunning){

            return;
        }

        countdownEl.textContent = i;

        await sleep(1000);
    }

    countdownEl.textContent =
        "開始";

    await sleep(1000);

    countdownEl.textContent = "";
}

async function showReadyMessage(){

    examCountdown.textContent ="まもなく開始";

    const chars ="マモナクカイシ";

    for(const char of chars){

        if(!isRunning){

            return;

        }

        await playCharacter(char);

    }

    examCountdown.textContent = "";

    await sleep(3000);

}

async function runExam(){

    examAnswers = [];

    const examQuestions =
        createExamQuestions();

    examResultArea.style.display = "none";
    examResultArea.textContent = "";

    if(examQuestions.length === 0){

        return;

    }

    await showReadyMessage();

    for(
        let i = 0;
        i < examQuestions.length;
        i++
    ){

        if(!isRunning){

            return;

        }

        const answer =
            examQuestions[i];

        examAnswers.push(answer);

        await playCharacter(answer);

        await sleep(
            EXAM_SETTINGS.interval
        );

    }

    for(
        let i = 5;
        i >= 1;
        i--
    ){

        examCountdown.textContent =
            `解答表示まで${i}秒`;

        await sleep(1000);

    }
    examCountdown.textContent = "";

    showExamResult();
    isRunning = false;

}

function showExamResult(){
    
    document
        .getElementById("examCountdown")
        .style.display = "none";
    
    document
        .getElementById("examDisplayArea")
        .style.display = "none";

    let text = "";

    for(
        let i = 0;
        i < examAnswers.length;
        i++
    ){

        text +=
            (i + 1)
            + ". "
            + examAnswers[i]
            + "\n";

    }

    examResultArea.textContent =text;

    examResultArea.style.display ="block";
    document
        .getElementById("retryExamBtn")
        .style.display = "block";

    isRunning = false;

}

const EXAM_SETTINGS = {

    questionCount : 10,

    questionChars :
        "アイウエオカキクケコ",

    allowDuplicate : false
};

function openExamSettings(){

    document
        .getElementById(
            "examQuestionCount"
        )
        .value =
        EXAM_SETTINGS.questionCount;

    document
        .getElementById(
            "examQuestionChars"
        )
        .value =
        EXAM_SETTINGS.questionChars;

    document
        .getElementById(
            "examAllowDuplicate"
        )
        .checked =
        EXAM_SETTINGS.allowDuplicate;

    showScreen(
        "examSettingScreen"
    );
}

function saveExamSettings(){

    EXAM_SETTINGS.questionCount =
        Number(
            document
                .getElementById(
                    "examQuestionCount"
                )
                .value
        );

    EXAM_SETTINGS.questionChars =
        document
            .getElementById(
                "examQuestionChars"
            )
            .value;

    EXAM_SETTINGS.allowDuplicate =
        document
            .getElementById(
                "examAllowDuplicate"
            )
            .checked;

    showScreen(
        "examScreen"
    );
}

function createExamQuestions(){

    const result = [];

    const chars =getAvailableChars();

    
    if(
        !SETTINGS.allowDuplicate &&
        SETTINGS.questionCount >
        chars.length
    ){

        alert(
            "問題数が出題文字数を超えています"
        );

        return [];
    }            

    if(SETTINGS.allowDuplicate){

        for(
            let i = 0;
            i < SETTINGS.questionCount;
            i++
        ){

            const index =
                Math.floor(
                    Math.random() *
                    chars.length
                );

            result.push(
                chars[index]
            );

        }

    }else{

        const shuffled =
            [...chars];

        shuffled.sort(
            () => Math.random() - 0.5
        );

        return shuffled.slice(
            0,
            SETTINGS.questionCount
        );

    }

    return result;

}

settingsButton.addEventListener("click", () => {

    openSettings();

});
retryExamBtn.addEventListener(
    "click",
    restartExam
);

document
    .getElementById(
        "dictionaryOverlay"
    )
    .addEventListener(
        "click",
        closeDictionaryPopup
    );

document
    .getElementById(
        "dictionaryPopup"
    )
    .addEventListener(
        "click",
        event => {

            event.stopPropagation();

        }
    );

document
    .querySelectorAll(
        'input[name="charSelectMode"]'
    )
    .forEach(radio => {

        radio.addEventListener(
            "change",
            () => {

                SETTINGS.charSelectMode =
                    radio.value;

                updateCharSelectModeUI();
            }
        );

    });

document
    .querySelectorAll(
        'input[name="practiceMode"]'
    )
    .forEach(radio => {

        radio.addEventListener(
            "change",
            updatePracticeModeUI
        );

    });

function returnToTop(){

    isRunning = false;

    answers = [];

    document
        .getElementById("countdown")
        .style.display = "block";

    document
        .getElementById("displayArea")
        .style.display = "flex";

    document
        .getElementById("countdown")
        .textContent = "";

    document
        .getElementById("answerArea")
        .style.display = "none";

    document
        .getElementById("answerArea")
        .textContent = "";

    document
        .getElementById("answerArea")
        .classList.remove("shadowing");

    document
        .getElementById("resultArea")
        .style.display = "none";

    document
        .getElementById("resultArea")
        .textContent = "";

    document
        .getElementById("showOneAnswerButton")
        .style.display = "none";

    document
        .getElementById("nextButton")
        .style.display = "none";

    document
        .getElementById("showAnswerButton")
        .style.display = "none";

    document
        .getElementById("retryButton")
        .style.display = "none";

    document
        .getElementById("startButton")
        .style.display = "block";

    document
        .getElementById("examStartButton")
        .style.display = "block";

    document
        .getElementById("retryExamBtn")
        .style.display = "none";

    document
        .getElementById("examResultArea")
        .style.display = "none";

    document
        .getElementById("examResultArea")
        .textContent = "";

    document
        .getElementById("examCountdown")
        .textContent = "";

    document
        .getElementById("morseArea")
        .style.display ="none"; 
        
    document.getElementById("signal")
            .classList.remove("on");

    document.getElementById("morseArea")
            .style.display="none";

    document
        .getElementById("examCountdown")
        .style.display = "block";
    
    document
        .getElementById("examDisplayArea")
        .style.display = "flex";  

    closeDictionaryPopup();  
    
    showScreen("topScreen");
}

document
    .getElementById("versionLabel")
    .innerHTML =
    `Ver ${APP_VERSION}<br>${RELEASE_DATE}`;
