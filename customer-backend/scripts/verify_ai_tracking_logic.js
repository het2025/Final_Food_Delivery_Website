
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';

// We can't easily import the controller function and run it isolated because it expects req/res and DB connection.
// But we can verify the REGEX again to be double sure, or we can try to "peek" the file content to verify it's updated.
// Actually, the previous run confirmed that the NEW regex works. 
// Now we just need to confirm that `aiController.js` HAS the new regex.

import fs from 'fs';
import path from 'path';

const checkFile = () => {
    const filePath = path.join(process.cwd(), 'controllers', 'aiController.js');
    const content = fs.readFileSync(filePath, 'utf-8');

    // The expected regex string in the file
    const expected = `const statusRegex = /pending|confirmed|accepted|preparing|ready|out_for_delivery|out for delivery|outfordelivery|picked up/i;`;

    if (content.includes(expected)) {
        console.log('SUCCESS: aiController.js contains the fixed regex.');
        console.log('Regex found:', expected);
    } else {
        console.error('FAILURE: aiController.js does NOT contain the fixed regex.');
        console.log('Content preview:');
        // Find the line with statusRegex
        const lines = content.split('\n');
        const line = lines.find(l => l.includes('const statusRegex'));
        console.log(line ? line.trim() : 'Regex line not found');
        process.exit(1);
    }
};

checkFile();
