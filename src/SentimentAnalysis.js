const { spawn } = require('child_process');

 module.exports = function() { 
    const python = spawn('python3', ['sentimentAnalysis.py']);
    python.stdout.on('data', (data) => {
        console.log('Python',data.toString());
    })
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        // send data to browser
        }); 
}  

