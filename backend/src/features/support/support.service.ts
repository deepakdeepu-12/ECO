import type { FAQ } from '../../types';

export const faqs: FAQ[] = [
  {
    id: 1,
    question: 'How does the AI waste classification work?',
    answer:
      'Our AI uses Google Gemini Vision to analyze photos of waste items and identify the waste type, recyclability, and the correct disposal bin. Simply point your camera at an item and tap Scan.',
  },
  {
    id: 2,
    question: 'How do I earn Green Points (GP)?',
    answer:
      'You earn GP by scanning and recycling items (5–30 GP each depending on type), completing weekly challenges, reporting illegal dumps, and maintaining daily streaks.',
  },
  {
    id: 3,
    question: 'Can I redeem my Green Points?',
    answer:
      'Yes! Visit the Rewards section to redeem GP for eco-friendly products, discount vouchers, and exclusive merchandise from our sustainability partners.',
  },
  {
    id: 4,
    question: 'How accurate is the waste detection?',
    answer:
      'Our AI achieves 95%+ accuracy on common waste items. For best results, ensure good lighting, hold the item steady, and make sure it fills most of the camera frame.',
  },
  {
    id: 5,
    question: 'What data does EcoSync collect?',
    answer:
      'We collect your email, name, recycling activity, and location (only when finding nearby bins). We never sell your data. See our Privacy Policy for full details.',
  },
  {
    id: 6,
    question: 'How do I report an illegal dumping site?',
    answer:
      'Tap the "Report" feature in the app, pin the location on the map, describe the waste type and severity, and optionally attach a photo. You earn 50 GP per verified report.',
  },
];
