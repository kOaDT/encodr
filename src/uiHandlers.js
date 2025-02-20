import { encodingFunctions } from './encodingFunctions.js';
import { detectHashType } from './hashDetector.js';
import { showNotification, handleError } from './utils.js';

export function initializeEventListeners() {
    document.getElementById("encodeButton").addEventListener("click", function() {
        try {
            const input = document.getElementById("input").value;
            const type = document.getElementById("encodingType").value;
            const output = encodingFunctions[type].encode(input);
            document.getElementById("output").value = output;
        } catch (error) {
            handleError(error);
        }
    });

    document.getElementById("decodeButton").addEventListener("click", function() {
        try {
            const input = document.getElementById("input").value;
            const type = document.getElementById("encodingType").value;
            const output = encodingFunctions[type].decode(input);
            document.getElementById("output").value = output;
        } catch (error) {
            handleError(error);
        }
    });

    document.getElementById("copyButton").addEventListener("click", async function() {
        const output = document.getElementById("output").value;
        await navigator.clipboard.writeText(output);
        showNotification('Copied to clipboard!');
    });

    document.getElementById("clearButton").addEventListener("click", function() {
        document.getElementById("input").value = '';
        document.getElementById("output").value = '';
    });

    document.getElementById('encodingType').addEventListener('change', function(e) {
        const normalButtons = document.getElementById('normalButtons');
        const hashButtons = document.getElementById('hashButtons');
        
        if (e.target.value === 'hash-detect') {
            normalButtons.style.display = 'none';
            hashButtons.style.display = 'block';
            document.getElementById('input').placeholder = 'Enter hash to analyze...';
        } else {
            normalButtons.style.display = 'block';
            hashButtons.style.display = 'none';
            document.getElementById('input').placeholder = 'Enter text to encode/decode...';
        }
    });

    document.getElementById('detectHashButton').addEventListener('click', function() {
        const input = document.getElementById('input').value.trim();
        
        if (!input) {
            document.getElementById('output').value = 'Please enter a hash to analyze.';
            return;
        }
        
        const results = detectHashType(input);
        
        if (results.length === 0) {
            document.getElementById('output').value = 'No known hash format detected.';
            return;
        }
        
        let output = 'Detected Hash Types:\n\n';
        results.forEach(result => {
            output += `Type: ${result.type}\n`;
            output += `Probability: ${result.probability}%\n`;
            output += `Format: ${result.format}\n`;
            output += `Description: ${result.description}\n\n`;
        });
        
        document.getElementById('output').value = output;
    });
} 