// Load both datasets
const fs = require('fs');

// Read the files
const loneActorData = JSON.parse(fs.readFileSync('Data/lone_actor_dict.json', 'utf8'));
const accelerationismData = JSON.parse(fs.readFileSync('Data/accelerationism-events.json', 'utf8'));

console.log('Loaded lone actor data:', Object.keys(loneActorData).length, 'records');
console.log('Loaded accelerationism data:', accelerationismData.length, 'records');

const fieldsToAdd = [
    'Racial/ethnic group',
    'Religion', 
    'Veteran status',
    'Hate crime'
];

// Function to normalize names for matching
function normalizeName(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ')     // Normalize spaces
        .trim();
}

// Function to check if names match (more precise)
function namesMatch(curatedName, accelerationismName) {
    const normalizedCurated = normalizeName(curatedName);
    const normalizedAccel = normalizeName(accelerationismName);
    
    // Split names into parts
    const curatedParts = normalizedCurated.split(' ').filter(part => part.length > 2);
    const accelParts = normalizedAccel.split(' ').filter(part => part.length > 2);
    
    // For a match, we need at least 2 matching name parts (first + last name)
    let matchCount = 0;
    
    for (let curatedPart of curatedParts) {
        for (let accelPart of accelParts) {
            if (curatedPart === accelPart || 
                (curatedPart.length > 4 && accelPart.includes(curatedPart)) ||
                (accelPart.length > 4 && curatedPart.includes(accelPart))) {
                matchCount++;
                break; // Only count each curated part once
            }
        }
    }
    
    // Require at least 2 matching parts for a valid match
    return matchCount >= 2;
}
// Test the matching
console.log('\nTesting name matching:');
console.log('Match test:', namesMatch('Timothy McVeigh, Terry Nichols', 'Timothy James McVeigh'));

// Create the combined dataset
const combinedData = {};

// Start with the curated lone actor data
for (const [name, record] of Object.entries(loneActorData)) {
    combinedData[name] = { ...record }; // Copy the original record
    
    // Try to find a match in the accelerationism data
    let foundMatch = false;
    for (const accelRecord of accelerationismData) {
        if (namesMatch(name, accelRecord['Full legal name'])) {
            console.log(`Found match: ${name} -> ${accelRecord['Full legal name']}`);
            
            // Add the selected fields
            for (const field of fieldsToAdd) {
                if (accelRecord[field]) {
                    combinedData[name][field] = accelRecord[field];
                }
            }
            foundMatch = true;
            break; // Stop looking after first match
        }
    }
    
    if (!foundMatch) {
        console.log(`No match found for: ${name}`);
    }
}

console.log(`\nCombined ${Object.keys(combinedData).length} records`);

// Save the combined dataset
fs.writeFileSync('Data/combined-dataset.json', JSON.stringify(combinedData, null, 2));
console.log('\nCombined dataset saved to Data/combined-dataset.json');

// Show a sample of what we added
console.log('\nSample of added data:');
const firstMatch = Object.keys(combinedData).find(name => combinedData[name]['Racial/ethnic group']);
if (firstMatch) {
    console.log(`${firstMatch}:`);
    fieldsToAdd.forEach(field => {
        if (combinedData[firstMatch][field]) {
            console.log(`  ${field}: ${combinedData[firstMatch][field]}`);
        }
    });
}