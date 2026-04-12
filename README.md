# REEL — Film Catalog

A web-based movie catalog application built with React and powered by the TMDB API. Users can browse popular films, search by title, filter by genre, and view detailed information for each movie. Authenticated users can log in and out, and admin users have additional controls to add, edit, and delete films from the catalog.

## Run Locally — 2 Steps

Only requirement: Node.js v18+ installed on your machine.

**Windows:**
```
Double-click run.bat
```
 
**Mac / Linux:**
```bash
chmod +x run.sh && ./run.sh
```
 
The script will automatically install dependencies, build the app, and open it at **http://localhost:4173**.

---

## Features

| Feature | Description |
|---|---|
| Browse Films | Popular movies fetched live from the TMDB API with pagination |
| Search | Search any title via the TMDB search endpoint |
| Genre Filter | Server-side genre filtering using TMDB discover endpoint |
| Sorting | 8 sort options — Popularity, Rating, Release Date, Most Voted, Title A–Z |
| Movie Detail | Full detail modal with synopsis, rating, vote count, and similar films |
| Reviews | Registered users can write and delete star-rated reviews |
| Favourites | Save films to a personal favourites list |
| Watched | Mark films as watched |
| Wishlist | Add films to a want-to-watch list |
| Admin CRUD | Admins can add, edit, and delete films with manual rating |
| Similar Films | Recommendations and similar films shown in each movie modal |
 

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