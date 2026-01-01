# Frontend - Smart Accounting Receipt Manager (Next.js 15)

React frontend application built with Next.js 15 and App Router.

## Features

- ⚡ Next.js 15 with App Router
- 🎨 Tailwind CSS for styling
- 📦 Modular component architecture
- 🔄 Context API for state management
- 🚀 Server Components and Client Components
- 📱 Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```bash
cp .env.example .env.local
```

3. Configure the backend API URL in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Running

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (dashboard)
│   ├── upload/            # Upload page
│   ├── list/              # Receipt list page
│   ├── reports/           # Reports page
│   ├── creditors/         # Creditors page
│   └── customers/         # Customers page
├── components/
│   ├── layout/            # Layout components (Sidebar)
│   ├── pages/             # Page components
│   └── ui/                 # Base UI components (Button, Card)
├── context/               # React Context (AppContext)
├── lib/                   # Utilities and API
└── types/                 # TypeScript types
```

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- React Hook Form
