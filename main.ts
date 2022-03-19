const express = require('express');
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

const PORT = 3100;
const UPLOAD_DIR_NAME_LENGTH = 12;

app.use(express.static('public'));
app.use(cors());
app.use(fileUpload({}));

app.get('/', (req: any, res: any) => res.send('Hello World!'));

app.post('/upload', (req: any, res: any) => {
	if (!req.files || !req.files.file) {
		res.status(400).json({ error: 'No file uploaded' });
		return;
	}

	let uploadId = handleFileUpload(req.files.file);
	if (uploadId) {
		res.json({
			uploadId
		});
	} else {
		res.status(500).json({
			error: 'Something went wrong while uploading the file.'
		});
	}
});

app.get('/file/:uploadId', (req: any, res: any) => {
	let uploadId = req.params.uploadId;
	let uploadDir = path.join(__dirname, 'public/files/', uploadId);
	if (!fs.existsSync(uploadDir)) {
		res.status(404).json({ error: 'UploadId not found.' });
		return;
	}

	let files = fs.readdirSync(uploadDir);
	if (files.length === 0) {
		res.status(404).json({ error: 'No files found for this uploadId.' });
		return;
	}

	res.json({ files });
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));

function handleFileUpload(file: any): string {
	let dirName = generateRandomString(UPLOAD_DIR_NAME_LENGTH);
	while (fs.existsSync(path.join(__dirname, 'public/files/', dirName))) {
		dirName = generateRandomString(UPLOAD_DIR_NAME_LENGTH);
	}

	fs.mkdirSync(path.join(__dirname, 'public/files/', dirName));

	const dest = path.join(__dirname, 'public/files/', dirName, file.name);
	file.mv(dest, (err: any) => {
		if (err) {
			console.error(err);
			return null;
		}
	});

	return dirName;
}

function generateRandomString(length: number): string {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
}
