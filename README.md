# Skillcy

**The ultimate community-driven learning management system where anyone can learn, share, and grow together.**

---

## Overview

Skillcy is a modern, open-source LMS (Learning Management System) built with React, TypeScript, Supabase, and Tailwind CSS. It empowers learners and educators to:

- **Browse and enroll** in a wide variety of courses (videos, PDFs, interactive content, and more)
- **Track progress** and manage your personal library
- **Upload and share** your own courses with the community
- **Access premium features** and exclusive content
- **Collaborate and grow** with a vibrant, community-driven platform

---

## Tech Stack

- **Frontend:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **UI:** [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) (headless UI components built on [Radix UI](https://www.radix-ui.com/)), [Radix UI](https://www.radix-ui.com/) (as the underlying primitives), [Lucide Icons](https://lucide.dev/)
- **State & Forms:** [React Hook Form](https://react-hook-form.com/), [React Context API](https://react.dev/reference/react/useContext)
- **Backend:** [Supabase](https://supabase.com/) (Database, Auth, Storage)
- **Data Fetching:** [@tanstack/react-query](https://tanstack.com/query/latest)
- **Routing:** [React Router](https://reactrouter.com/)
- **Charts:** [Recharts](https://recharts.org/)
- **Other:** [Zod](https://zod.dev/), [date-fns](https://date-fns.org/), [clsx](https://github.com/lukeed/clsx), [Vercel](https://vercel.com/) (Deployment)

---

## Features

- 🚀 **Modern UI**: Built with React, shadcn/ui, and Tailwind CSS for a beautiful, responsive experience
- 🔒 **Authentication**: Secure login and registration with Supabase Auth
- 📚 **Course Library**: Browse, enroll, and track progress on thousands of courses
- 📝 **Course Uploads**: Share your knowledge by uploading your own courses
- 📈 **Dashboard**: Visualize your learning stats and achievements
- ✨ **Premium Access**: Unlock exclusive content and advanced features
- 🌙 **Dark Mode**: Seamless light/dark theme support
- 🔗 **Open Source**: MIT licensed and community-driven

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Supabase project (for backend)

### Installation

```bash
git clone https://github.com/yourusername/skillcy.git
cd skillcy
npm install
```

### Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com/).
2. In your Supabase dashboard, go to Project Settings → API and copy:
    - **Project URL** (e.g., `https://your-project-id.supabase.co`)
    - **Anon public key**
3. Create a `.env` file in your project root:
    ```
    VITE_SUPABASE_URL=https://your-project-id.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key
    ```
4. **Never commit your `.env` file** (it's already in `.gitignore`).

### Running Locally

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
skillcy/
├── src/
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React context providers (e.g., Auth)
│   ├── integrations/       # Supabase client and types
│   ├── pages/              # Route-based pages (Home, Browse, Library, etc.)
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── supabase/               # Supabase migrations and SQL
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
└── README.md
```

---

## Deployment

### Deploying to Vercel

1. **Push your code to GitHub/GitLab/Bitbucket.**
2. **Go to [Vercel](https://vercel.com/) and create a new project.**
3. **Import your repository.**
4. **Set Environment Variables:**
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
5. **Vercel will auto-detect Vite and use `npm run build`.**
6. **Click "Deploy".**
7. **Your app will be live at `https://your-project-name.vercel.app`.**

For custom domains and advanced settings, see the [Vercel documentation](https://vercel.com/docs).

---

## Supabase Project ID in `config.toml`

The `project_id` in `supabase/config.toml` is used by Supabase CLI and tools to identify your Supabase project for migrations and management.  
It is not a secret and is safe to commit.  
It is not a trace of "lovable" (the CLI tool you used), but rather a unique identifier for your Supabase project.

---

## License

MIT

---

## Contributing

Pull requests and issues are welcome! Please open an issue for bugs or feature requests.

---

## Acknowledgements

- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)
- [Tailwind CSS](https://tailwindcss.com/)

