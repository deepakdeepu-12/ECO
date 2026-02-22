import { Request, Response } from 'express';
import { classifyWaste } from './classify.service';

export const classify = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { image } = req.body as { image?: string };

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const data = await classifyWaste(image);
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Classification error:', error);
    const err = error as Error & { statusCode?: number };

    if (err.message?.includes('GEMINI_API_KEY')) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY not configured',
        message:
          'Please set your Gemini API key in backend/.env. Get a FREE key at: https://aistudio.google.com/app/apikey',
      });
    }
    if (err.message?.includes('API_KEY')) {
      return res.status(401).json({
        error: 'Invalid API key. Get your FREE key at: https://aistudio.google.com/app/apikey',
      });
    }

    const status = err.statusCode ?? 500;
    return res.status(status).json({ error: err.message ?? 'Classification failed. Please try again.' });
  }
};
