// 1. File Upload Logic (UTF-8 ke sath)
document.getElementById('csvFileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    // 'UTF-8' lagana zaroori hai taaki Hindi text box ya question mark (?) me convert na ho
    reader.readAsText(file, 'UTF-8'); 
    
    reader.onload = function(event) {
        const csvData = event.target.result;
        const parsedData = parseCSV(csvData);
        
        if(parsedData.length > 0) {
            quizzes.push({ name: file.name, data: parsedData });
            renderQuizList();
            alert("File successfully upload ho gayi!");
        } else {
            alert("CSV format me kuch gadbad hai. Kripya check karein.");
        }
    };
});

// CSV ko JavaScript me convert karna (Advanced Parser for Hindi & Excel formats)
function parseCSV(text) {
    const lines = text.split('\n');
    const questions = [];
    
    // Line 1 (Header) skip karke line 2 se padhenge
    for(let i = 1; i < lines.length; i++) {
        let line = lines[i].trim();
        if(line === '') continue;
        
        // Excel kabhi-kabhi text ke aas-paas quotes ("") laga deta hai, yeh usko handle karega
        let cols = line.split(',');
        
        if(cols.length >= 6) {
            // Quotes hatane aur text ko clean karne ka code
            cols = cols.map(c => c.replace(/^"|"$/g, '').trim());
            
            // A=0, B=1, C=2, D=3
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

// Baaki aapka timer aur game logic ka code purana wala hi rahega...
