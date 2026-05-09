let quizzes = []; // Yahan saari upload ki gayi files save hongi
let currentQuizData = [];
let currentQuestionIndex = 0;
let score = 0;

let timeLeft = 5;
let timerInterval;

// 1. File Upload Logic
document.getElementById('csvFileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const csvData = event.target.result;
        const parsedData = parseCSV(csvData);
        
        if(parsedData.length > 0) {
            quizzes.push({ name: file.name, data: parsedData });
            renderQuizList();
            alert("File upload ho gayi!");
        } else {
            alert("CSV file format sahi nahi hai.");
        }
    };
    reader.readAsText(file);
});

// CSV ko JavaScript me convert karna
function parseCSV(text) {
    const lines = text.split('\n');
    const questions = [];
    // Line 1 (Header) skip karke line 2 se padhenge
    for(let i = 1; i < lines.length; i++) {
        if(lines[i].trim() === '') continue;
        const cols = lines[i].split(',');
        if(cols.length >= 6) {
            // A=0, B=1, C=2, D=3
            let ansLetter = cols[5].trim().toUpperCase();
            let ansIndex = ansLetter === 'A' ? 0 : ansLetter === 'B' ? 1 : ansLetter === 'C' ? 2 : 3;

            questions.push({
                q: cols[0].trim(),
                options: [cols[1].trim(), cols[2].trim(), cols[3].trim(), cols[4].trim()],
                answer: ansIndex
            });
        }
    }
    return questions;
}

// 2. Dashboard par list dikhana
function renderQuizList() {
    const listDiv = document.getElementById('quiz-list');
    listDiv.innerHTML = '';
    quizzes.forEach((quiz, index) => {
        listDiv.innerHTML += `
            <div class="quiz-item">
                <div>
                    <strong>${quiz.name}</strong><br>
                    <small>${quiz.data.length} Questions</small>
                </div>
                <button class="play-btn" onclick="startQuiz(${index})">▶ Play</button>
            </div>
        `;
    });
}

// 3. Quiz Shuru Karna
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
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'block';
}

// 4. Question aur Timer Load karna
function loadQuestion() {
    const currentQuestion = currentQuizData[currentQuestionIndex];
    document.getElementById('question-text').innerText = currentQuestion.q;
    document.getElementById('q-counter').innerText = `Q: ${currentQuestionIndex + 1}/${currentQuizData.length}`;

    for(let i = 0; i < 4; i++) {
        let btn = document.getElementById(`opt${i}`);
        btn.innerText = currentQuestion.options[i];
        btn.className = "option-btn"; 
        btn.disabled = false; 
    }
    document.getElementById('next-btn').style.display = "none";
    
    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 5.0;
    const timerBar = document.getElementById('timer-bar');
    timerBar.style.width = '100%';
    timerBar.style.backgroundColor = '#FFD700'; // Yellow

    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        let percentage = (timeLeft / 5) * 100;
        timerBar.style.width = percentage + '%';

        // Jab time 2 second reh jaye toh laal (red) ho jaye
        if(timeLeft <= 2) { timerBar.style.backgroundColor = '#FF0000'; }

        if(timeLeft <= 0) {
            clearInterval(timerInterval);
            timerBar.style.width = '0%';
            autoRevealAnswer(); // Time khatam, answer dikhao
        }
    }, 100);
}

// 5. Answer Check aur Highlight karna
function checkAnswer(selectedIndex) {
    clearInterval(timerInterval); // Button dabate hi timer rok do
    const currentQuestion = currentQuizData[currentQuestionIndex];
    
    if(selectedIndex === currentQuestion.answer) {
        document.getElementById(`opt${selectedIndex}`).classList.add('correct');
        score += 10;
        document.getElementById('score').innerText = score;
    } else {
        document.getElementById(`opt${selectedIndex}`).classList.add('wrong');
        document.getElementById(`opt${currentQuestion.answer}`).classList.add('correct');
    }
    lockOptions();
}

function autoRevealAnswer() {
    const currentQuestion = currentQuizData[currentQuestionIndex];
    document.getElementById(`opt${currentQuestion.answer}`).classList.add('correct');
    lockOptions();
}

function lockOptions() {
    for(let i = 0; i < 4; i++) {
        document.getElementById(`opt${i}`).disabled = true;
    }
    document.getElementById('next-btn').style.display = "block";
}

function nextQuestion() {
    currentQuestionIndex++;
    if(currentQuestionIndex < currentQuizData.length) {
        loadQuestion();
    } else {
        document.getElementById('question-text').innerText = `Quiz Complete! \nAapka Total Score: ${score}`;
        document.querySelector('.options-grid').style.display = "none";
        document.getElementById('next-btn').style.display = "none";
        document.getElementById('timer-bar').style.width = '0%';
    }
}
