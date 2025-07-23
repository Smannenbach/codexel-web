import fetch from 'node-fetch';

// Global FormData polyfill for Node.js
if (typeof global.FormData === 'undefined') {
  const { FormData } = require('formdata-node');
  global.FormData = FormData;
}

export interface VoiceCloneOptions {
  name: string;
  description?: string;
  audioFile: Buffer;
  fileName: string;
}

export interface VoiceModel {
  voice_id: string;
  name: string;
  category: string;
  fine_tuning: {
    is_allowed_to_fine_tune: boolean;
    state: string;
  };
}

export class VoiceCloneService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not found. Voice cloning will not work.');
    }
  }

  async cloneVoice(options: VoiceCloneOptions): Promise<VoiceModel> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required for voice cloning');
    }

    const formData = new FormData();
    formData.append('name', options.name);
    formData.append('description', options.description || 'Custom voice clone created by Codexel.ai');
    formData.append('files', new Blob([options.audioFile], { type: 'audio/wav' }), options.fileName);

    const response = await fetch(`${this.baseUrl}/voices/add`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Voice cloning failed: ${error}`);
    }

    return await response.json() as VoiceModel;
  }

  async generateSpeech(text: string, voiceId: string): Promise<Buffer> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required for speech generation');
    }

    const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Speech generation failed: ${error}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  async listVoices(): Promise<VoiceModel[]> {
    if (!this.apiKey) {
      return [];
    }

    const response = await fetch(`${this.baseUrl}/voices`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch voices');
    }

    const data = await response.json() as any;
    return data.voices || [];
  }

  async deleteVoice(voiceId: string): Promise<void> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required');
    }

    const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
      method: 'DELETE',
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete voice: ${error}`);
    }
  }
}

export const voiceCloneService = new VoiceCloneService();