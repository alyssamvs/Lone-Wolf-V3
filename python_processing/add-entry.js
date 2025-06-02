const fs = require('fs');

function addEntry(newEntry) {
    // Load existing data
    const existingData = JSON.parse(fs.readFileSync('Data/all-combined-dataset.json', 'utf8'));
    
    // Add the new entry
    existingData.push(newEntry);
    
    // Save back to file
    fs.writeFileSync('Data/all-combined-dataset.json', JSON.stringify(existingData, null, 2));
    
    console.log(`✅ Added new entry: ${newEntry.perpetrator}`);
    console.log(`📊 Total entries now: ${existingData.length}`);
}

// Get the JSON entry from command line argument
if (process.argv[2]) {
    try {
        const newEntry = JSON.parse(process.argv[2]);
        addEntry(newEntry);
    } catch (error) {
        console.error('❌ Error parsing JSON:', error.message);
        console.log('Usage: node add-entry.js \'{"perpetrator":"Name","event":"Event",...}\'');
    }
} else {
    console.log('Usage: node add-entry.js \'{"perpetrator":"Name","event":"Event",...}\'');
}