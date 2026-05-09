// === GLOBAL VARIABLES (Yeh line missing thi isliye error aaya) ===
let quizzes = []; 
let currentQuizData = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 5;
let timerInterval;

// === 1. FILE UPLOAD LOGIC ===
document.getElementById('csvFileInput').addEventListener('change', function(e) {
    try {
        const file = e.target.files[0];
        if (!file) {
            alert("Koi file select nahi hui!");
            return;
        }

        alert("File select ho gayi: " + file.name + "\nProcess kar rahe hain...");

        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const csvData = event.target.result;
                const parsedData = parseCSV(csvData);
                
                if(parsedData.length > 0) {
                    quizzes.push({ name: file.name, data: parsedData });
                    renderQuizList();
                    alert(`Success! ${parsedData.length} questions load ho gaye.`);
                } else {
                    alert("File toh padh li, par usme questions nahi mile. Format check karein.");
                }
            } catch(err) {
                alert("Data read karne me error aaya: " + err.message);
            }
        };

        reader.onerror = function() {
            alert("File padhne me error aaya. Kya app ko storage permission mili hai?");
        };

        reader.readAsText(file, 'UTF-8');
    } catch(error) {
        alert("Kuch gadbad hui: " + error.message);
    }
});

// === 2. CSV PARSER (Excel & Hindi Support) ===
function parseCSV(text) {
    const lines = text.split(/\r?\n/);
    const questions = [];
    
    // Line 1 (Header) skip karke line 2 se padhenge
    for(let i = 1; i < lines.length; i++) {
        let line = lines[i].trim();
        if(line === '') continue;
        
        let cols = line.split(',');
        if(cols.length >= 6) {
            // Quotes hatane aur text ko clean karne ka code
            cols = cols.map(c => c.replace(/^"|"$/g, '').trim());
            let ansLetter = cols[5].toUpperCase();
            let ansIndex = ansLetter === 'A' ? 0 : ansLetter === 'B' ? 1 : ansLetter === 'C' ? 2 : 3;

            questions.push({
                q: cols[0],
                options: [cols[1], cols[2], cols[3], cols[4]],
                answer: ansIndex
            });
        }
    }
    return questions;
}

// === 3. DASHBOARD LIST ===
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

// === 4. START QUIZ ===
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

// === 5. QUESTION & TIMER ===
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

        if(timeLeft <= 2) { timerBar.style.backgroundColor = '#FF0000'; }

        if(timeLeft <= 0) {
            clearInterval(timerInterval);
            timerBar.style.width = '0%';
            autoRevealAnswer(); // Time khatam, answer dikhao
        }
    }, 100);
}

// === 6. ANSWER CHECK ===
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
