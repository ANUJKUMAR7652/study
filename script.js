// 1. File Upload Logic (Android ke liye Fix)
document.getElementById('csvFileInput').addEventListener('change', function(e) {
    try {
        const file = e.target.files[0];
        if (!file) {
            alert("Koi file select nahi hui!");
            return;
        }

        // Yeh aapko batayega ki file successfully click ho gayi hai
        alert("File select ho gayi: " + file.name + "\nProcess kar rahe hain...");

        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const csvData = event.target.result;
                const parsedData = parseCSV(csvData);
                
                if(parsedData.length > 0) {
                    quizzes.push({ name: file.name, data: parsedData });
                    renderQuizList();
                    // Yeh success message dega aur batayega kitne questions mile
                    alert(`Success! ${parsedData.length} questions load ho gaye.`);
                } else {
                    alert("File toh padh li, par usme questions nahi mile. Format check karein.");
                }
            } catch(err) {
                alert("Data read karne me error aaya: " + err.message);
            }
        };

        // Agar Android ko storage ki permission ka issue hoga toh yeh error dega
        reader.onerror = function() {
            alert("File padhne me dikkat aa rahi hai. Kya app ko storage permission mili hai?");
        };

        reader.readAsText(file, 'UTF-8');
    } catch(error) {
        alert("Kuch gadbad hui: " + error.message);
    }
});

// CSV ko JavaScript me convert karna (Windows aur Android dono ke line-breaks ke liye)
function parseCSV(text) {
    // \r?\n ka matlab hai chahe enter PC se mara ho ya Mobile se, dono ko pehchaan lega
    const lines = text.split(/\r?\n/);
    const questions = [];
    
    // Line 1 (Header) skip karke line 2 se padhenge
    for(let i = 1; i < lines.length; i++) {
        let line = lines[i].trim();
        if(line === '') continue;
        
        // Comma se split karenge
        let cols = line.split(',');
        
        // Agar aapke column kam hain toh error nahi aayega, ignore kar dega
        if(cols.length >= 6) {
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

// Baaki aapka neeche ka saara code (renderQuizList, startQuiz, timer etc.) Waisa hi rahega...
