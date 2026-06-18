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

    showAnswerEachQuestion : false,

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
    "゜":"..--."
};

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

        await playCharacter(char);

        if(!isRunning){

            return;
        }

        if(
            SETTINGS.showAnswerEachQuestion
        ){

            await waitForButton("showOneAnswerButton");

             if(!isRunning){

                return;
            }
           
            document
                .getElementById("showOneAnswerButton")
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

            document
                .getElementById("answerArea")
                .textContent = "";

            document
                .getElementById("answerArea")
                .style.display = "none";

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
        .getElementById("startButton")
        .style.display = "none";

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

    saveSettings();

    showScreen("topScreen");
}

const radio =
document.querySelector(
`input[name="signalMode"][value="${SETTINGS.signalMode}"]`
);

function openPracticeSettings(){

    document.getElementById(
        "showAnswerEachQuestion"
    ).checked =
        SETTINGS.showAnswerEachQuestion;

    showScreen(
        "practiceSettingScreen"
    );
}

function savePracticeSettings(){

    SETTINGS.showAnswerEachQuestion =

        document.getElementById(
            "showAnswerEachQuestion"
        ).checked;

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

function returnToTop(){

    isRunning = false;

    answers = [];

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

    showScreen("topScreen");
}
