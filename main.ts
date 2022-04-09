const express = require('express');
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const PORT = 3100;
const UPLOAD_DIR_NAME_LENGTH = 12;
const BOT_URL = 'http://localhost:3200';
// const BOT_URL = 'http://vollsm.art:5300';

app.use(express.static('public'));
app.use(cors());
app.use(fileUpload({}));

app.get('/', (req: any, res: any) => res.send('Hello World!'));

app.post('/upload', (req: any, res: any) => {
	console.log(new Date().toISOString() + ' | POST /upload by ' + req.ip);

	if (!req.body.uploadId) {
		res.status(400).send('No uploadId was provided');
		return;
	}

	if (!req.files || !req.files.file) {
		res.status(400).json({ error: 'No file uploaded' });
		return;
	}

	if (handleFileUpload(req.files.file, req.body.uploadId)) {
		res.json({
			uploadId: req.body.uploadId
		});
		if (req.body.discordToken) {
			axios({
				url: BOT_URL + '/postUpload?discordToken=' + req.body.discordToken + '&uploadId=' + req.body.uploadId + '&fileName=' + req.files.file.name,
				method: 'POST'
			}).catch((err: any) => {
				console.error(err);
			});
		}
	} else {
		res.status(500).json({
			error: 'Something went wrong while uploading the file.'
		});
	}
});

app.delete('/file/:uploadId', (req: any, res: any) => {
	console.log(new Date().toISOString() + ' | DELETE /file/' + req.params.uploadId + ' by ' + req.ip);

	if (!req.params.uploadId) {
		res.status(400).send('No uploadId was provided');
		return;
	}

	fs.rmSync(path.join(__dirname, 'public/files/', req.params.uploadId), { recursive: true, force: true });

	res.status(204).send();
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));

function handleFileUpload(file: any, uploadId: string): boolean {
	fs.mkdirSync(path.join(__dirname, 'public/files/', uploadId));

	const dest = path.join(__dirname, 'public/files/', uploadId, file.name);
	file.mv(dest, (err: any) => {
		if (err) {
			console.error(err);
			return false;
		}
	});

	return true;
}
