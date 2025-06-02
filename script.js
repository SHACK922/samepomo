// DOM要素の取得
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const modeLabel = document.getElementById('mode-label');
const messageText = document.getElementById('message-text');
const progressBar = document.getElementById('progress');
const startBtn = document.getElementById('start-btn');
const skipBtn = document.getElementById('skip-btn');
const stopBtn = document.getElementById('stop-btn');
const currentModeInfo = document.getElementById('current-mode-info');

// モードボタン
const modeButtons = document.querySelectorAll('.mode-btn');

// タイマーの状態
let timer;
let isRunning = false;
let timeLeft;
let totalTime;
let currentMode = 'affirm'; // 'affirm', 'main', 'break', 'auto'
let autoMode = false;
let autoStep = 0; // オートモードのステップ（0: アファメーション, 1: メインポモ, 2: 休憩ポモ）

// モードの設定
const MODES = {
    affirm: {
        name: 'アファメーション',
        duration: 60, // 1分
        message: 'この25分間のゴールをイメージしよう'
    },
    main: {
        name: 'メインポモ',
        duration: 1500, // 25分
        message: '集中して作業を進めましょう！'
    },
    break: {
        name: '休憩ポモ',
        duration: 300, // 5分
        message: 'リラックスして休憩しましょう！'
    },
    auto: {
        name: 'オートポモ',
        duration: 60, // 初期値はアファメーション
        message: 'この25分間のゴールをイメージしよう'
    }
};

// モードを切り替える
function switchMode(mode) {
    // タイマーを停止
    clearInterval(timer);
    isRunning = false;
    
    // 現在のモードを更新
    currentMode = mode;
    
    // オートモードの場合
    if (mode === 'auto') {
        autoMode = true;
        autoStep = 0;
        updateAutoMode();
    } else {
        autoMode = false;
        // 通常モードの設定を適用
        timeLeft = MODES[mode].duration;
        totalTime = MODES[mode].duration;
        messageText.textContent = MODES[mode].message;
    }
    
    // UI更新
    updateTimerDisplay();
    updateModeLabel();
    updateCurrentModeInfo();
    resetProgressBar();
    
    // モードボタンのアクティブ状態を更新
    modeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
}

// オートモードの更新
function updateAutoMode() {
    // オートモードのステップに応じて設定を変更
    switch(autoStep % 3) {
        case 0: // アファメーション
            timeLeft = MODES.affirm.duration;
            totalTime = MODES.affirm.duration;
            messageText.textContent = MODES.affirm.message;
            break;
        case 1: // メインポモ
            timeLeft = MODES.main.duration;
            totalTime = MODES.main.duration;
            messageText.textContent = MODES.main.message;
            break;
        case 2: // 休憩ポモ
            timeLeft = MODES.break.duration;
            totalTime = MODES.break.duration;
            messageText.textContent = MODES.break.message;
            break;
    }
    
    updateCurrentModeInfo();
}

// タイマーを停止する
function stopTimer() {
    clearInterval(timer);
    isRunning = false;
    autoMode = false;
    
    // 現在のモードの初期値に戻す
    timeLeft = MODES[currentMode].duration;
    totalTime = MODES[currentMode].duration;
    
    updateTimerDisplay();
    resetProgressBar();
    
    // オートモードの場合は初期ステップに戻す
    if (currentMode === 'auto') {
        autoStep = 0;
        updateAutoMode();
    }
}

// タイマーの表示を更新する
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
}

// モードラベルを更新する
function updateModeLabel() {
    if (currentMode === 'auto') {
        switch(autoStep % 3) {
            case 0:
                modeLabel.textContent = 'アファメーション';
                break;
            case 1:
                modeLabel.textContent = 'メインポモ';
                break;
            case 2:
                modeLabel.textContent = '休憩ポモ';
                break;
        }
    } else {
        modeLabel.textContent = MODES[currentMode].name;
    }
}

// 現在のモード情報を更新
function updateCurrentModeInfo() {
    let modeText;
    let durationText;
    
    if (currentMode === 'auto') {
        const steps = ['アファメーション (1分)', 'メインポモ (25分)', '休憩ポモ (5分)'];
        modeText = 'オートポモ';
        durationText = steps[autoStep % 3];
    } else {
        modeText = MODES[currentMode].name;
        const minutes = Math.floor(MODES[currentMode].duration / 60);
        durationText = `${minutes}分`;
    }
    
    currentModeInfo.textContent = `現在のモード: ${modeText} - ${durationText}`;
}

// プログレスバーをリセット
function resetProgressBar() {
    progressBar.style.width = '0%';
}

// タイマーを開始する
function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    
    timer = setInterval(() => {
        timeLeft--;
        
        // タイマー表示を更新
        updateTimerDisplay();
        
        // プログレスバーを更新
        const progress = 100 - (timeLeft / totalTime * 100);
        progressBar.style.width = `${progress}%`;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            isRunning = false;
            playNotificationSound();
            
            // タイマー終了時の処理
            if (autoMode) {
                // オートモードの場合、次のステップへ
                autoStep++;
                updateAutoMode();
                updateModeLabel();
                // 少し間を置いて次のタイマーを開始
                setTimeout(() => {
                    if (autoMode) startTimer();
                }, 1000);
            } else {
                // 通常モードの場合、タイマーをリセット
                timeLeft = MODES[currentMode].duration;
                totalTime = MODES[currentMode].duration;
                resetProgressBar();
                updateTimerDisplay();
            }
        }
    }, 1000);
}

// タイマーをスキップする
function skipTimer() {
    clearInterval(timer);
    isRunning = false;
    
    if (autoMode) {
        // オートモードの場合、次のステップへ
        autoStep++;
        updateAutoMode();
        updateModeLabel();
        resetProgressBar();
    } else {
        // 通常モードの場合、タイマーをリセット
        timeLeft = 0;
        updateTimerDisplay();
        resetProgressBar();
        messageText.textContent = 'スキップしました！';
    }
}

// 通知音を再生する
function playNotificationSound() {
    const audio = new Audio('https://cdn.freesound.org/previews/320/320181_5260872-lq.mp3');
    audio.play().catch(e => console.log('通知音の再生に失敗しました:', e));
}

// イベントリスナーの設定
function setupEventListeners() {
    // モードボタンのイベントリスナー
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchMode(btn.dataset.mode);
        });
    });
    
    // 操作ボタンのイベントリスナー
    startBtn.addEventListener('click', startTimer);
    skipBtn.addEventListener('click', skipTimer);
    stopBtn.addEventListener('click', stopTimer);
}

// 初期化関数
function initialize() {
    // 初期モードの設定
    timeLeft = MODES.affirm.duration;
    totalTime = MODES.affirm.duration;
    
    // UI更新
    updateTimerDisplay();
    updateModeLabel();
    updateCurrentModeInfo();
    resetProgressBar();
    
    // イベントリスナーの設定
    setupEventListeners();
    
    // 通知の許可をリクエスト
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

// DOMコンテンツ読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', initialize);
