import express from 'express';
import { Configuration, OpenAIApi } from 'openai';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'client')));

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/api/complete', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' });
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });
    res.json({ result: completion.data.choices[0].message.content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Completion failed' });
  }
});

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).send('No audio');
  try {
    const resp = await openai.createTranscription(
      fs.createReadStream(req.file.path),
      'whisper-1'
    );
    fs.unlink(req.file.path, () => {});
    res.send(resp.data.text);
  } catch (e) {
    console.error(e);
    res.status(500).send('Transcription failed');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
