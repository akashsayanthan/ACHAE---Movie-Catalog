# REEL - User Guide

**REEL** is a film catalog application powered by the TMDB API. Browse thousands of movies, search by title, filter by genre, sort results, save films to personal lists, and leave reviews.

No account is needed to browse. Create a free account to unlock reviews, favourites, watched, and wishlist features.

---

## Browsing Films

When you open the app, the most popular films load automatically in a card grid.

- **Scroll down** to see more films on the current page
- **Click any card** to open the full detail view
- **← PREV** and **NEXT →** buttons at the bottom move between pages 

No account is needed to browse.

---

## Searching

1. Type a title into the search bar in the top right
2. Click **SEARCH** or press **Enter**
3. Matching results load automatically
4. Click **✕ CLEAR** to return to the popular films feed

---

## Filtering by Genre

The filter bar sits below the masthead and lists all available genres.

1. Click any genre (e.g. **ACTION**, **DRAMA**, **HORROR**) to fetch films from that category
2. Results are fetched directly from TMDB 
3. Pagination works within the selected genre
4. Click **ALL** to return to the popular films feed

---

## Sorting Films

The sort bar sits below the filter bar. Click any option to re-order the grid.

| Sort Option | What it does |
|---|---|
| **Popularity** | Most popular films first (default) |
| **Rating ↓** | Highest TMDB score first |
| **Rating ↑** | Lowest TMDB score first |
| **Newest** | Most recently released first |
| **Oldest** | Oldest release date first |
| **Most Voted** | Films with the most votes first |
| **Title A–Z** | Alphabetical order |
| **Title Z–A** | Reverse alphabetical order |


---

## Viewing Film Details & Similar Films

Click any card to open the detail modal. This shows:

- **Full synopsis** and genre tags
- **Star rating** and TMDB score out of 10
- **Total vote count**
- **Reviews** from other users
- **You Might Also Like** - a horizontal row of recommended similar films at the bottom

Click any similar film card to jump straight to its detail view without closing the modal.

Click **[ CLOSE ]** or anywhere outside the modal to close it.

---

## Creating an Account

1. Click **SIGN IN** in the top right of the header
2. Click **Register here**
3. Enter a **username**, **email address**, and **password** (minimum 6 characters)
4. Click **CREATE ACCOUNT**
5. A confirmation message will appear 

---

## Signing In & Out

**To sign in:**
1. Click **SIGN IN** in the top right
2. Enter your email and password
3. Click **SIGN IN**

Your username will appear in the header alongside the ♥, ✓, and 🎬 list buttons.

**To sign out:**
Click **SIGN OUT** in the top right. All list buttons will be hidden until you sign in again.

---

## Writing & Deleting Reviews

### Writing a review

You must be signed in to write a review.

1. Click any film card to open its detail view
2. Scroll down to the **REVIEWS** section
3. Click **+ WRITE A REVIEW**
4. Select a **star rating** from 1 to 5 by clicking the stars
5. Write your review - minimum 10 characters
6. Click **SUBMIT REVIEW**

Your review appears in the list immediately with your username and the date.

### Deleting a review

You can only delete your own reviews. Admin users can delete any review.

1. Open the film detail modal
2. Find your review in the list
3. Click **DELETE** next to it

The review is removed immediately.

---

## Favourites

Save films you love to your personal favourites list.

**To add a film:**
- Click the **♡** (heart) button on any film card while signed in
- The heart turns gold to confirm the film was saved

**To remove a film:**
- Click the filled **♥** heart button on the card again, or
- Open **My Favourites** from the header and click **✕** on the poster card

**To view your favourites:**
- Click the **♥** button in the header (shows a count badge when you have saved films)
- Click any poster to open that film's full detail view

---

## Watched List

Keep track of films you have already seen.

**To mark a film as watched:**
- Click the **✓** button on any film card while signed in
- The tick turns green to confirm

**To remove from watched:**
- Click the green **✓** again, or
- Open **Watched** from the header and click **✕** on the poster card

**To view your watched films:**
- Click the **✓** button in the header (shows a count badge)

---

## Wishlist

Build a list of films you want to watch next.

**To add a film:**
- Click the **🎬** button on any film card while signed in
- The icon turns blue to confirm

**To remove from wishlist:**
- Click the blue **🎬** again, or
- Open **Wishlist** from the header and click **✕** on the poster card

**To view your wishlist:**
- Click the **🎬** button in the header (shows a count badge)

---

## Admin Features

Admin users have additional controls not visible to regular users. The **ADMIN** badge will appear next to your username in the header if you have admin access.

### Adding a film

1. Click **+ ADD FILM** in the header
2. Fill in the form:
   - **Title** (required)
   - **Year** (required)
   - **Rating** - use the star picker or type a value from 0 to 10
   - **Genres** - comma-separated (e.g. `Action, Drama`)
   - **Poster URL** - direct image link
   - **Synopsis**
3. Click **ADD FILM**

The film appears at the top of the grid immediately.

### Editing a film

1. Click **EDIT** on any film card
2. Update any fields in the form
3. Click **SAVE CHANGES**

Editing a TMDB film saves an override in the database - the original TMDB card is hidden and replaced with your edited version.

### Deleting a film

1. Click **DELETE** on any film card
2. Confirm in the dialog that appears

Deleting a TMDB film inserts a deleted marker in the database so it stays hidden across all sessions. Deleting an admin-added film removes it permanently.

### Deleting any review

Admins can delete any user's review directly from the film detail modal - the **DELETE** button appears on all reviews, not just your own.
