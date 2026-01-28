// Native fetch used in Node 18+
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5200/api';
let cookieJar = '';

const updateCookie = (res) => {
    // Helper logic for cookies...
    const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : (res.headers.raw ? res.headers.raw()['set-cookie'] : null);

    let cookiesList = [];
    if (raw) {
        cookiesList = raw;
    } else {
        const c = res.headers.get('set-cookie');
        if (c) cookiesList = [c];
    }

    if (cookiesList && cookiesList.length > 0) {
        // Simple cookie jar: just keep the latest JWT? 
        // Or accumulating? Since we only have one relevant cookie 'jwt', replacing is fine.
        const cookies = cookiesList.map((entry) => {
            const parts = entry.split(';');
            const cookiePart = parts[0];
            return cookiePart;
        }).join('; ');
        cookieJar = cookies;
    }
};

const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Cookie': cookieJar
    };
};

const getCaptchaFromFile = () => {
    const filePath = path.join(__dirname, 'server', 'captcha.txt');


    const rootPath = path.join(__dirname, 'captcha.txt');
    if (!fs.existsSync(rootPath)) return null;
    const content = fs.readFileSync(rootPath, 'utf8');
    const parts = content.split(' ');
    return { id: parts[0], text: parts[1] };
};

async function run() {
    try {
        console.log('--- Starting Verification ---');

        await new Promise(r => setTimeout(r, 2000));

        console.log('1. Getting Captcha...');
        const cRes = await fetch(`${BASE_URL}/auth/captcha`);
        if (!cRes.ok) throw new Error(`Captcha fetch failed: ${cRes.status}`);
        const cData = await cRes.json();

        await new Promise(r => setTimeout(r, 1000));

        const captchaData = getCaptchaFromFile();
        if (!captchaData) throw new Error('Could not find captcha in file');
        console.log(`   Found Captcha: ID=${captchaData.id}, Text=${captchaData.text}`);

        console.log('2. Registering Admin...');
        const adminUser = { username: 'admin', password: 'password123' };
        let res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminUser)
        });

        let data = await res.json();
        if (res.status === 201) {
            console.log('   Admin Registered:', data.username, data.role);
            updateCookie(res);
        } else if (res.status === 400 && data.message === 'User already exists') {
            console.log('   Admin already exists. Proceeding to login.');
        } else {
            throw new Error(`Admin reg failed: ${data.message}`);
        }

        console.log('3. Logging in Admin...');
        res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'password123',
                captchaId: captchaData.id,
                // Use ID from file if available, or from response if they match. 
                // The controller writes the ID it generated. 
                // The response returns the ID it generated. They should be same.
                captchaValue: captchaData.text
            })
        });
        data = await res.json();

        if (res.status !== 200) throw new Error(`Login failed: ${data.message}`);
        console.log('   Logged in as:', data.username);
        updateCookie(res);

        console.log('4. Admin Self Recharge (1000)...');
        res = await fetch(`${BASE_URL}/transactions/recharge`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ amount: 1000 })
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Recharge failed: ${res.status} ${text}`);
        }

        try {
            data = await res.json();
        } catch (err) {
            const text = await res.text(); // This might fail if body consumed? No, .text() consumes.
            // Wait, if json() failed, we can't read text again easily unless we cloned or buffered.
            // But if res.ok was true but content is HTML?
            // Let's assume if we are here, something is wrong.
            throw new Error(`Recharge JSON parse failed. Status: ${res.status}`);
        }
        console.log('   Recharge result:', data);

        console.log('5. Creating Child User A...');
        let uniqueUser = 'userA_' + Math.floor(Math.random() * 10000);
        res = await fetch(`${BASE_URL}/users/create-child`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ username: uniqueUser, password: 'password123' })
        });

        data = await res.json();
        let userAId;
        if (res.status === 201) {
            console.log('   User A Created:', data.username);
            userAId = data._id;
        } else {
            console.log('   Create User A failed:', data);
        }

        if (userAId) {
            console.log('6. Transferring 100 to User A...');
            res = await fetch(`${BASE_URL}/transactions/transfer`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ receiverId: userAId, amount: 100 })
            });
            data = await res.json();
            console.log('   Transfer result:', data);
        }

        console.log('7. Checking Admin Stats...');
        res = await fetch(`${BASE_URL}/users/admin/stats`, { headers: getHeaders() });
        data = await res.json();
        console.log('   Stats:', data);

        console.log('--- Verification Complete ---');
    } catch (e) {
        console.error('Verification Error:', e);
        process.exit(1);
    }
}

run();
