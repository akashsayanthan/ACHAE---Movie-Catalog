# REEL — Film Catalog

A web-based movie catalog application built with React and powered by the TMDB API. Users can browse popular films, search by title, filter by genre, and view detailed information for each movie. Authenticated users can log in and out, and admin users have additional controls to add, edit, and delete films from the catalog.

---

## Features

- Browse popular movies fetched live from the TMDB API
- Search films by title
- Filter by genre
- Click any card to open a full detail modal
- User authentication (login and registration) via Supabase
- Role-based access — admin users can add, edit, and delete films

---

## Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- npm (comes with Node.js)
- A [TMDB API key](https://www.themoviedb.org/settings/api)
- A [Supabase](https://supabase.com/) project with the following tables:
---

## Getting Started

**1. Clone the repository**
```bash
git clone https://github.com/akashsayanthan/ACHAE---Movie-Catalog.git
cd ACHAE---Movie-Catalog
```

**2. Install dependencies**
```bash
npm install
```

**3. Install Supabase client**
```bash
npm install @supabase/supabase-js
```

**4. Start the development server**
```bash
npm start
```

The app will open at `http://localhost:3000`.

---

## Running Tests

```bash
npm test
```

Press `a` to run all test suites. To run once without watch mode:

---

## Acknowledgements

- Movie data provided by [TMDB](https://www.themoviedb.org/)
- Authentication and database by [Supabase](https://supabase.com/)