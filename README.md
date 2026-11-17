# Moo · กินเท่าไหร่ เดินเท่านั้น

Moo แปลงอาหารที่กินเป็น "จำนวนก้าวเดิน" ถ่ายรูปอาหาร แล้ว AI บอกแคลอรี่และจำนวนก้าวที่เทียบเท่า
ใช้ฟรีทั้งหมด ผู้ใช้เชื่อม Google Gemini API key ของตัวเอง (แบบฟรี ไม่ต้องใส่บัตร)

Moo turns food into walking steps. Snap a meal, AI estimates calories, and Moo shows the equivalent steps.
Free for everyone: each user connects their own free Google Gemini API key.

## Features (MVP)
- Thai / English, switchable
- Onboarding without typing (steppers and chips)
- Food photo → dish, kcal range, steps; adjust portion and "ate half" by tapping
- Daily energy balance: eaten − body at rest (BMR × 1.2) − walking
- Steps from an iPhone Shortcut (`/steps?n=<count>`) or an AI-read screenshot of any step app
- 7-day history, CSV export for research
- All data stays on the device (localStorage); the API key never leaves the device except to Google

## Energy math
- BMR: Mifflin-St Jeor; base burn = BMR × 1.2
- Stride ≈ height × 0.415 (male) / 0.413 (female)
- Net walking ≈ 0.5 kcal × weight(kg) × distance(km)
- Daily step goal = steps to walk off intake above budget, clamped 6,000–20,000

Estimates only, not medical advice.

## Develop
```bash
npm ci
npx expo start --web
npx tsc --noEmit
npx expo export --platform web   # static site in dist/
```

The site is served from `/moo` (`experiments.baseUrl` in `app.json`). Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.
