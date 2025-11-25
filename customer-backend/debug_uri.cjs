require('dotenv').config();
const uri = process.env.MONGO_URI;
console.log('---CHUNK_START---');
if (uri) {
    for (let i = 0; i < uri.length; i += 20) {
        console.log(uri.substring(i, i + 20));
    }
} else {
    console.log('URI is undefined');
}
console.log('---CHUNK_END---');
