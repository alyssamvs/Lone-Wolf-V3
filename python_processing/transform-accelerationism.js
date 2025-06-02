// Load the datasets
const fs = require('fs');

const accelerationismData = JSON.parse(fs.readFileSync('Data/accelerationism-events.json', 'utf8'));
const loneActorData = JSON.parse(fs.readFileSync('Data/lone_actor_dict.json', 'utf8'));

console.log('Loaded accelerationism data:', accelerationismData.length, 'records');
console.log('Loaded lone actor data:', Object.keys(loneActorData).length, 'records');

const transformedData = [];

// First, add all accelerationism records
accelerationismData.forEach((record, index) => {
    const transformed = {
        perpetrator: record['Full legal name'] || `Unknown_${index}`,
        event: record['Short narrative'] || 'Unknown Event',
        date: record['Date'] || 'Unknown',
        method: record['Criminal method'] || 'Unknown',
        target: record['Physical target'] || 'Unknown',
        city: record['Location: city'] || 'Unknown',
        region: record['Location: state'] || 'Unknown', 
        country: record['Location: country'] || 'Unknown',
        killed: parseInt(record['# killed']) || 0,
        wounded: parseInt(record['# injured']) || 0,
        age: parseInt(record['Age']) || 0,
        gender: record['Gender'] || 'Unknown',
        race: record['Racial/ethnic group'] || 'Unknown',
        religion: record['Religion'] || 'Unknown',
        veteranStatus: record['Veteran status'] || 'Unknown',
        hateCrime: record['Hate crime'] || 'Unknown',
        ideology: record['Ideological affiliation'] || 'Unknown',
        groupAffiliation: record['Group affiliation'] || 'None/Unknown',
        // Fields specific to lone actor data (set as Unknown for accelerationism data)
        livestream: 'Unknown',
        manifesto: 'Unknown',
        socialMedia: 'Unknown',
        influences: 'Unknown',
        affiliations: record['Group affiliation'] || 'None/Unknown',
        source: 'accelerationism'
    };
    
    transformedData.push(transformed);
});

// Then, add all lone actor records (preserving ALL original fields)
Object.entries(loneActorData).forEach(([name, record]) => {
    const transformed = {
        perpetrator: name,
        event: record.Event || 'Unknown Event',
        date: record.Date || 'Unknown',
        method: record.Method || 'Unknown',
        target: record.Target || 'Unknown',
        city: record.City || 'Unknown',
        region: record.Region || 'Unknown',
        country: record.Country || 'Unknown',
        killed: parseInt(record.Killed) || 0,
        wounded: parseInt(record.Wounded) || 0,
        age: parseInt(record.Age) || 0,
        // Preserve original lone actor fields
        number: record.Number || 0,
        livestream: record.Livestream || 'Unknown',
        manifesto: record.Manifesto || 'Unknown',
        socialMedia: record['Social Media'] || 'Unknown',
        influences: record.Influences || 'Unknown',
        affiliations: record.Affiliations || 'None/Unknown',
        // Set demographic data as Unknown since original lone actor data doesn't have it
        gender: 'Unknown',
        race: 'Unknown',
        religion: 'Unknown',
        veteranStatus: 'Unknown',
        hateCrime: 'Unknown',
        ideology: record.Ideology || 'Unknown',
        groupAffiliation: record.Affiliations || 'None/Unknown',
        source: 'lone_actor'
    };
    
    transformedData.push(transformed);
});

console.log(`Total combined records: ${transformedData.length}`);

// Save the combined dataset
fs.writeFileSync('Data/all-combined-dataset.json', JSON.stringify(transformedData, null, 2));
console.log('\nAll combined dataset saved to Data/all-combined-dataset.json');

// Show samples from both sources
console.log('\nSample from accelerationism data:');
const accelSample = transformedData.find(record => record.source === 'accelerationism');
console.log(`  Perpetrator: ${accelSample.perpetrator}`);
console.log(`  Race: ${accelSample.race}`);

console.log('\nSample from lone actor data:');
const loneActorSample = transformedData.find(record => record.source === 'lone_actor');
console.log(`  Perpetrator: ${loneActorSample.perpetrator}`);
console.log(`  Livestream: ${loneActorSample.livestream}`);
console.log(`  Manifesto: ${loneActorSample.manifesto}`);
console.log(`  Social Media: ${loneActorSample.socialMedia}`);

console.log(`\nDataset ready! You now have ${transformedData.length} total records with all fields preserved.`);