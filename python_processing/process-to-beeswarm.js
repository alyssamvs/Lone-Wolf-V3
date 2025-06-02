const fs = require('fs');

function processToBeesarmFormat() {
    console.log('🔄 Processing combined dataset to beeswarm format...');
    
    const combinedData = JSON.parse(fs.readFileSync('Data/dates-normalized.json', 'utf8'));
    
    const processedData = combinedData.map((record, index) => {
        // Parse date - keep ISO format, extract components
        let dateObj = { year: null, month: null, day: null, full: null };
        if (record.date && record.date !== 'Unknown') {
            if (record.date.includes('-')) {
                // YYYY-MM-DD format (ISO)
                const parts = record.date.split('-');
                if (parts.length === 3) {
                    dateObj = {
                        year: parseInt(parts[0]),
                        month: parseInt(parts[1]), 
                        day: parseInt(parts[2]),
                        full: record.date, // Keep original ISO format
                        raw: record.date
                    };
                }
            }
        }
        
        return {
            id: `entry_${index}_${record.perpetrator.replace(/\s+/g, '_')}`,
            date: dateObj,
            perpetrator: {
                name: record.perpetrator,
                age: record.age || 0,
                gender: record.gender || 'Unknown',
                race: record.race || 'Unknown',
                religion: record.religion || 'Unknown',
                veteran: {
                    isVeteran: record.veteranStatus !== 'Civilian' && record.veteranStatus !== 'Unknown',
                    service: record.veteranStatus || 'Unknown'
                }
            },
            incident: {
                location: {
                    city: record.city || 'Unknown',
                    state: record.region || 'Unknown',
                    country: record.country || 'Unknown',
                    formatted: `${record.city || 'Unknown'}, ${record.region || 'Unknown'}, ${record.country || 'Unknown'}`
                },
                method: record.method || 'Unknown',
                casualties: {
                    killed: record.killed || 0,
                    injured: record.wounded || 0,
                    total: (record.killed || 0) + (record.wounded || 0)
                }
            },
            ideology: {
                affiliation: record.ideology || 'Unknown',
                hateCrime: record.hateCrime === 'Yes',
                groupAffiliation: record.groupAffiliation || 'Unknown'
            },
            // Preserve lone actor specific fields (excluding number)
            loneActorData: {
                livestream: record.livestream || 'Unknown',
                manifesto: record.manifesto || 'Unknown',
                socialMedia: record.socialMedia || 'Unknown',
                influences: record.influences || 'Unknown',
                affiliations: record.affiliations || 'Unknown'
            },
            narrative: record.event || 'Unknown',
            source: record.source || 'manual_entry'
        };
    });
    
    // Save processed data
    fs.writeFileSync('Data/processed-combined-dataset.json', JSON.stringify(processedData, null, 2));
    console.log(`✅ Processed ${processedData.length} entries to beeswarm format`);
    console.log(`💾 Saved to: Data/processed-combined-dataset.json`);
    console.log(`📅 Dates kept in ISO format (YYYY-MM-DD)`);
    console.log(`🗑️ Number field removed from all entries`);
    
    return processedData.length;
}

// Run the processing
processToBeesarmFormat();