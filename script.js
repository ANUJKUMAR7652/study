let quizzes = []; 
let currentQuizData = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 5;
let timerInterval;

// Audio Files
const tickSound = document.getElementById('tick-sound');
const revealSound = document.getElementById('reveal-sound');

document.getElementById('csvFileInput').addEventListener('change', function(e) {
    try {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            const parsedData = parseCSV(event.target.result);
            if(parsedData.length > 0) {
                quizzes.push({ name: file.name, data: parsedData });
                renderQuizList();
            }
        };
        reader.readAsText(file, 'UTF-8');
    } catch(err) { console.log(err); }
});

function parseCSV(text) {
    const lines = text.split(/\r?\n/);
    const questions = [];
    for(let i = 1; i < lines.length; i++) {
        let line = lines[i].trim();
        if(line === '') continue;
        let cols = line.split(',');
        if(cols.length >= 6) {
            cols = cols.map(c => c.replace(/^"|"$/g, '').trim());
            let ansLetter = cols[5].toUpperCase();
            let ansIndex = ansLetter === 'A' ? 0 : ansLetter === 'B' ? 1 : ansLetter === 'C' ? 2 : 3;
            questions.push({ q: cols[0], options: [cols[1], cols[2], cols[3], cols[4]], answer: ansIndex });
        }
    }
    return questions;
}

function renderQuizList() {
    const listDiv = document.getElementById('quiz-list');
    listDiv.innerHTML = '';
    quizzes.forEach((quiz, index) => {
        listDiv.innerHTML += `
            <div class="quiz-item">
                <div style="color: #00ffff;"><strong>${quiz.name}</strong><br><small>${quiz.data.length} Questions</small></div>
                <button class="play-btn" onclick="startQuiz(${index})">▶ Play</button>
            </div>
        `;
    });
}

function startQuiz(quizIndex) {
    currentQuizData = quizzes[quizIndex].data;
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('dashboard-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    document.getElementById('score').innerText = score;
    loadQuestion();
}

function goBack() {
    clearInterval(timerInterval);
    tickSound.pause();
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'block';
}

function loadQuestion() {
    const currentQuestion = currentQuizData[currentQuestionIndex];
    document.getElementById('question-text').innerText = currentQuestion.q;
    document.getElementById('q-counter').innerText = `Q: ${currentQuestionIndex + 1}/${currentQuizData.length}`;

    for(let i = 0; i < 4; i++) {
        let btn = document.getElementById(`opt${i}`);
        btn.innerText = currentQuestion.options[i];
        btn.className = "option-btn neon-option"; 
        btn.disabled = false; 
    }
    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 5.0;
    const timerBar = document.getElementById('timer-bar');
    timerBar.style.width = '100%';
    timerBar.style.backgroundColor = '#00ffff'; 
    
    tickSound.currentTime = 0;
    tickSound.play().catch(e => console.log("Auto-play prevented by browser"));

    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        timerBar.style.width = ((timeLeft / 5) * 100) + '%';

        if(timeLeft <= 2) { timerBar.style.backgroundColor = '#ff0000'; }

        if(timeLeft <= 0) {
            clearInterval(timerInterval);
            timerBar.style.width = '0%';
            tickSound.pause();
            autoRevealAnswer();
        }
    }, 100);
}

function checkAnswer(selectedIndex) {
    clearInterval(timerInterval); 
    tickSound.pause();
    revealSound.currentTime = 0;
    revealSound.play().catch(e => console.log("Sound error"));

    const currentQuestion = currentQuizData[currentQuestionIndex];
    
    if(selectedIndex === currentQuestion.answer) {
        document.getElementById(`opt${selectedIndex}`).classList.add('correct');
        score += 1; // +1 Point jaisa aapne kaha
        document.getElementById('score').innerText = score;
        triggerPointAnimation(); // Animation Call
    } else {
        document.getElementById(`opt${selectedIndex}`).classList.add('wrong');
        document.getElementById(`opt${currentQuestion.answer}`).classList.add('correct');
    }
    lockAndProceed();
}

function autoRevealAnswer() {
    revealSound.currentTime = 0;
    revealSound.play().catch(e => console.log("Sound error"));
    const currentQuestion = currentQuizData[currentQuestionIndex];
    document.getElementById(`opt${currentQuestion.answer}`).classList.add('correct');
    lockAndProceed();
}

function triggerPointAnimation() {
    const pointAnim = document.getElementById('point-animation');
    pointAnim.classList.add('show-point');
    setTimeout(() => {
        pointAnim.classList.remove('show-point');
    }, 2000); // 2 Second baad gayab
}

function lockAndProceed() {
    for(let i = 0; i < 4; i++) {
        document.getElementById(`opt${i}`).disabled = true;
    }
    // 7 second ka wait aur uske baad next question
    setTimeout(() => {
        currentQuestionIndex++;
        if(currentQuestionIndex < currentQuizData.length) {
            loadQuestion();
        } else {
            document.getElementById('question-text').innerText = `Quiz Complete! \nAapka Total Score: ${score}`;
            document.querySelector('.options-grid').style.display = "none";
            document.getElementById('timer-bar').style.width = '0%';
        }
    }, 7000);
}
