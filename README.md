# Habitual - Build Better Habits

A beautiful, privacy-focused habit tracker built with Vanilla JavaScript and Supabase.

![Habitual](https://img.shields.io/badge/Habitual-Build%20Better%20Habits-purple?style=for-the-badge)
![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-yellow?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-Powered-green?style=for-the-badge)

## ✨ Features

### Core Features
- **Habit Tracking** - Create habits with daily or specific day schedules
- **Streak Tracking** - Track current and best streaks
- **Visual Analytics** - Heatmap calendar and completion rate charts
- **Dark Mode** - Automatic dark mode support

### Data Management
- **Export Data** - Export your habits and logs as CSV
- **Import Data** - Import habits from CSV files
- **Privacy First** - Your data is secured with Row Level Security (RLS)

### User Experience
- **Landing Page** - Beautiful welcome screen with feature showcase
- **Simple Auth** - Easy signup and login with email/password
- **Responsive Design** - Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites
- A [Supabase](https://supabase.com) account (free tier works)
- A modern web browser

### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ImmaculateEben/Habitual.git
   cd Habitual
   ```

2. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Note your project URL and anon key

3. **Set Up Database Tables**
   In your Supabase SQL Editor, run:

   ```sql
   -- Create profiles table
   create table profiles (
     id uuid references auth.users on delete cascade primary key,
     full_name text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Create habits table
   create table habits (
     id uuid default uuid_generate_v4() primary key,
     user_id uuid references auth.users on delete cascade not null,
     title text not null,
     icon text default '🎯',
     schedule text default 'daily',
     days jsonb default '[1,2,3,4,5,6,7]',
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     archived boolean default false
   );

   -- Create habit_logs table
   create table habit_logs (
     id uuid default uuid_generate_v4() primary key,
     habit_id uuid references habits on delete cascade not null,
     user_id uuid references auth.users on delete cascade not null,
     completed_date date not null,
     note text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     unique(habit_id, completed_date)
   );

   -- Enable UUID extension
   create extension if not exists "uuid-ossp";

   -- Set up Row Level Security (RLS)
   alter table profiles enable row level security;
   alter table habits enable row level security;
   alter table habit_logs enable row level security;

   -- Profiles RLS policies
   create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
   create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
   create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

   -- Habits RLS policies
   create policy "Users can view own habits" on habits for select using (auth.uid() = user_id);
   create policy "Users can insert own habits" on habits for insert with check (auth.uid() = user_id);
   create policy "Users can update own habits" on habits for update using (auth.uid() = user_id);
   create policy "Users can delete own habits" on habits for delete using (auth.uid() = user_id);

   -- Habit_logs RLS policies
   create policy "Users can view own logs" on habit_logs for select using (auth.uid() = user_id);
   create policy "Users can insert own logs" on habit_logs for insert with check (auth.uid() = user_id);
   create policy "Users can update own logs" on habit_logs for update using (auth.uid() = user_id);
   create policy "Users can delete own logs" on habit_logs for delete using (auth.uid() = user_id);
   ```

4. **Configure the App**
   - Edit `js/supabase.js` and replace the credentials:
   ```javascript
   const SUPABASE_URL = 'your-supabase-url';
   const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
   ```

5. **Deploy**
   Deploy to Vercel, Netlify, or any static hosting:
   
   - [Deploy to Vercel](https://vercel.com/new)
   - [Deploy to Netlify](https://www.netlify.com/)

## 📁 Project Structure

```
Habitual/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── supabase.js     # Supabase client
│   ├── auth.js         # Authentication
│   ├── habits.js       # Habit management
│   ├── streak.js       # Streak calculations
│   ├── heatmap.js      # Heatmap visualization
│   ├── charts.js       # Analytics charts
│   └── app.js          # Main app initialization
└── README.md           # This file
```

## 🔧 Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Supabase (PostgreSQL + Auth)
- **Hosting**: Vercel / Netlify

## 📝 Usage Guide

### Creating a Habit
1. Click the "+" button in the sidebar
2. Enter habit name and choose an icon
3. Select schedule: Daily or specific days
4. Click "Create Habit"

### Checking In
1. Select a habit from the sidebar
2. Click the checkmark button for today
3. Optionally add a note

### Viewing Stats
- **Streaks**: View current and best streaks on the habit detail page
- **Heatmap**: See your activity history in the calendar
- **Charts**: View completion rates over time

### Export/Import
- Click the settings icon in the header
- Use "Export Data" to download CSV
- Use "Import Data" to upload CSV

## 🔐 Privacy

Your data is:
- Stored securely in your Supabase database
- Protected by Row Level Security (only you can access your data)
- Never shared with third parties
- Exportable anytime

## 📄 License

MIT License - feel free to use this project for learning or personal use.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ using Vanilla JavaScript and Supabase
