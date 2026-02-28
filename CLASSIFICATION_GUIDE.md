# 🤖 AI Waste Classification Guide

## How the AI Classification Works

### Overview
The EcoSync app uses **Google Gemini AI** (gemini-1.5-flash model) to instantly identify waste items from photos and provide detailed recycling instructions.

---

## 📸 How to Classify Waste

### Step-by-Step Process:

1. **Open the Scanner**
   - Click the "Scan Item" button on the dashboard
   - Grant camera permissions when prompted

2. **Capture the Image**
   - Point your camera at the waste item
   - Ensure good lighting and the item is clearly visible
   - Click the capture button (camera icon)

3. **AI Analysis** (happens automatically)
   - Image is sent to Google Gemini AI
   - AI analyzes the waste type, material, and recyclability
   - Typically takes 2-5 seconds

4. **View Results**
   - Waste type (e.g., "Plastic Water Bottle")
   - Category (plastic, paper, glass, metal, organic, etc.)
   - Recyclability status
   - Disposal instructions (step-by-step)
   - Bin color recommendation
   - Eco-tips
   - Points earned (5-30 points based on category)

---

## 🏗️ System Architecture

### Frontend Flow ([WasteScanner.tsx](src/components/WasteScanner.tsx))
```
User Opens Scanner
    ↓
Camera Access Granted
    ↓
Capture Image → Convert to Base64
    ↓
POST Request to Backend (/api/classify)
    ↓
Display Classification Results
```

### Backend Flow ([classify.service.ts](backend/src/features/classify/classify.service.ts))
```
Receive Base64 Image
    ↓
Validate Image Data
    ↓
Send to Google Gemini AI (gemini-1.5-flash)
    ↓
Parse AI Response (JSON)
    ↓
Assign Points (5-30 based on category)
    ↓
Return Classification Result
```

### API Endpoint
```
POST http://localhost:3001/api/classify
Content-Type: application/json

Request Body:
{
  "image": "data:image/jpeg;base64,/9j/4AAQ..."
}

Response:
{
  "success": true,
  "data": {
    "wasteType": "Plastic Water Bottle",
    "category": "plastic",
    "recyclable": true,
    "confidence": 95,
    "color": "#3B82F6",
    "instructions": [
      "Empty and rinse the bottle",
      "Remove the cap and label",
      "Place in blue recycling bin"
    ],
    "tips": "Reusable bottles reduce plastic waste by 80%",
    "binColor": "Blue Recycling Bin",
    "points": 15
  }
}
```

---

## 🎯 Categories & Points

| Category    | Points | Examples                          | Emoji |
|-------------|--------|-----------------------------------|-------|
| Electronic  | 30     | Phones, batteries, computers      | 📱    |
| Metal       | 25     | Cans, foil, wires                 | 🥫    |
| Glass       | 20     | Bottles, jars                     | 🫙    |
| Hazardous   | 20     | Chemicals, paint, medicine        | ⚠️    |
| Plastic     | 15     | Bottles, containers, packaging    | 🧴    |
| Textile     | 12     | Clothing, fabric, shoes           | 👕    |
| Paper       | 10     | Newspapers, cardboard, books      | 📄    |
| Organic     | 8      | Food waste, garden waste          | 🌿    |
| General     | 5      | Non-recyclable mixed waste        | 🗑️    |

---

## 🔧 Technical Details

### Environment Variables

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3001
```

**Backend (backend/.env)**
```env
GEMINI_API_KEY=your_api_key_here
PORT=3001
CORS_ORIGIN=http://localhost:5173,http://localhost:4173
```

### Key Files

1. **Frontend**
   - `src/components/WasteScanner.tsx` - Camera & UI
   - `src/lib/download.ts` - Track recycled waste

2. **Backend**
   - `backend/src/features/classify/classify.routes.ts` - Routes
   - `backend/src/features/classify/classify.controller.ts` - Request handling
   - `backend/src/features/classify/classify.service.ts` - AI integration
   - `backend/src/app.ts` - Express app setup

---

## 🐛 Troubleshooting

### "Failed to fetch" Error

**Cause:** Frontend cannot connect to backend

**Solutions:**
1. Verify backend is running:
   ```bash
   curl http://localhost:3001/api/health
   ```

2. Check environment variable:
   ```bash
   # Frontend .env file should have:
   VITE_API_URL=http://localhost:3001
   ```

3. Restart both servers:
   ```bash
   # Stop all Node processes
   taskkill /F /IM node.exe
   
   # Restart using start.bat
   .\start.bat
   ```

4. Check CORS settings in `backend/src/app.ts`

### "GEMINI_API_KEY not configured"

**Cause:** Missing or invalid Gemini API key

**Solution:**
1. Get a FREE API key: https://aistudio.google.com/app/apikey
2. Add to `backend/.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...your_key_here
   ```
3. Restart backend server

### "No waste item detected in image"

**Cause:** Image is unclear or doesn't contain a waste item

**Solutions:**
- Ensure good lighting
- Get closer to the item
- Make sure the item fills most of the frame
- Try a different angle

### Camera permission denied

**Solutions:**
- Allow camera access in browser settings
- On mobile: Grant camera permissions in device settings
- Try refreshing the page

---

## 🧪 Testing the Classification API

Run the test script:
```bash
node test-classify.js
```

Or test with curl:
```bash
curl -X POST http://localhost:3001/api/classify \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,..."}'
```

---

## 🚀 Development Tips

### Adding New Categories

Edit `backend/src/features/classify/classify.service.ts`:

1. Update `pointsByCategory`:
```typescript
export const pointsByCategory: Record<string, number> = {
  // ... existing categories
  newCategory: 50,  // Add your category
};
```

2. Update the CLASSIFY_PROMPT with the new category

### Customizing Instructions

The AI generates instructions dynamically, but you can:
- Modify the prompt in `classify.service.ts`
- Add post-processing in `classify.controller.ts`
- Customize the UI in `WasteScanner.tsx`

### Changing AI Model

In `classify.service.ts`:
```typescript
// Change model (options: gemini-1.5-flash, gemini-1.5-pro)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
```

---

## 📊 Performance

- **Average response time:** 2-5 seconds
- **Accuracy:** ~85-95% (depends on image quality)
- **Image size limit:** 20MB (configured in `backend/src/app.ts`)
- **Supported formats:** JPEG, PNG, WebP

---

## 🔒 Security & Privacy

- Images are sent to Google Gemini AI for processing
- Images are NOT stored on the server
- Only classification results are returned
- All communication over HTTPS in production

---

## 📱 Mobile App (Capacitor)

The classification works identically in the mobile app:
- Uses device camera
- Same backend API
- Offline mode NOT supported (requires internet for AI)

Build APK:
```bash
.\build-apk.bat
```

See [APK_BUILD_GUIDE.md](APK_BUILD_GUIDE.md) for details.

---

## 💡 Pro Tips

1. **Best Results:**
   - Single item per scan
   - Plain background
   - Good lighting
   - Item centered in frame

2. **Earn More Points:**
   - Focus on high-value categories (electronics, metal)
   - Scan multiple items separately
   - Track your progress in the Impact Dashboard

3. **Eco-Tips:**
   - Read the AI-generated tips
   - Learn proper disposal methods
   - Share knowledge with your community

---

## 🆘 Need Help?

- Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- Open the Help & Support modal in the app
- Contact: deepakyadavdeepu94@gmail.com

---

**Happy Recycling! ♻️🌍**
