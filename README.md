# RapidAPI Text Translator

A GitHub-ready React + Tailwind application that translates English text into a selected language. The app keeps RapidAPI branding on the frontend and uses a public translation API endpoint in the settings.

## Features

- English input with a focused translation workspace
- Favorite target language selector
- Public translation API call
- Copy translated text
- Recent translation history
- Clear setup notes for local development and GitHub upload

## API Setup

This project is configured for the public MyMemory Translation API format:

```text
https://api.mymemory.translated.net/get?q=Hello&langpair=en|fr
```

No API key is required for the default setup. If you want to keep the default, you can run the app without creating a `.env` file.

To customize the endpoint, copy `.env.example` to `.env` and update:

```bash
VITE_RAPIDAPI_URL=https://api.mymemory.translated.net/get
```

The app sends a GET request using these query parameters:

```text
q=Hello world
langpair=en|es
```

The response parser reads `responseData.translatedText` and also supports common fallback fields such as `trans`, `translatedText`, `translation`, and `result`.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Upload

Upload this project folder to GitHub. Do not upload your `.env` file. GitHub should include `.env.example` so other users know which variables to create locally.

## Frontend Label

The visible app label remains `React + RapidAPI`, as requested.
