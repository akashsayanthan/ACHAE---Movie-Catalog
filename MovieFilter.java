import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Legitimate starter utility for movie filtering.
 *
 * You can commit this as real work if your project actually needs filtering.
 * Adjust fields/methods to match your existing Movie class and app structure.
 */
public class MovieFilter {

    public static class Movie {
        private final String title;
        private final String genre;
        private final int year;
        private final double rating;

        public Movie(String title, String genre, int year, double rating) {
            this.title = title;
            this.genre = genre;
            this.year = year;
            this.rating = rating;
        }

        public String getTitle() {
            return title;
        }

        public String getGenre() {
            return genre;
        }

        public int getYear() {
            return year;
        }

        public double getRating() {
            return rating;
        }

        @Override
        public String toString() {
            return title + " | " + genre + " | " + year + " | " + rating;
        }
    }

    public static List<Movie> filterByTitle(List<Movie> movies, String keyword) {
        if (movies == null) {
            return Collections.emptyList();
        }

        if (keyword == null || keyword.trim().isEmpty()) {
            return new ArrayList<>(movies);
        }

        List<Movie> results = new ArrayList<>();
        String search = keyword.trim().toLowerCase();

        for (Movie movie : movies) {
            if (movie != null && movie.getTitle() != null &&
                movie.getTitle().toLowerCase().contains(search)) {
                results.add(movie);
            }
        }

        return results;
    }

    public static List<Movie> filterByGenre(List<Movie> movies, String genre) {
        if (movies == null) {
            return Collections.emptyList();
        }

        if (genre == null || genre.trim().isEmpty()) {
            return new ArrayList<>(movies);
        }

        List<Movie> results = new ArrayList<>();
        String search = genre.trim().toLowerCase();

        for (Movie movie : movies) {
            if (movie != null && movie.getGenre() != null &&
                movie.getGenre().toLowerCase().equals(search)) {
                results.add(movie);
            }
        }

        return results;
    }

    public static List<Movie> filterByMinimumRating(List<Movie> movies, double minRating) {
        if (movies == null) {
            return Collections.emptyList();
        }

        List<Movie> results = new ArrayList<>();

        for (Movie movie : movies) {
            if (movie != null && movie.getRating() >= minRating) {
                results.add(movie);
            }
        }

        return results;
    }

    public static List<Movie> filterByYearRange(List<Movie> movies, int startYear, int endYear) {
        if (movies == null) {
            return Collections.emptyList();
        }

        List<Movie> results = new ArrayList<>();

        for (Movie movie : movies) {
            if (movie != null && movie.getYear() >= startYear && movie.getYear() <= endYear) {
                results.add(movie);
            }
        }

        return results;
    }

    public static void main(String[] args) {
        List<Movie> movies = new ArrayList<>();
        movies.add(new Movie("Inception", "Sci-Fi", 2010, 8.8));
        movies.add(new Movie("The Dark Knight", "Action", 2008, 9.0));
        movies.add(new Movie("Interstellar", "Sci-Fi", 2014, 8.7));
        movies.add(new Movie("Coco", "Animation", 2017, 8.4));

        System.out.println("Title contains 'in':");
        for (Movie movie : filterByTitle(movies, "in")) {
            System.out.println(movie);
        }

        System.out.println("\nGenre = Sci-Fi:");
        for (Movie movie : filterByGenre(movies, "Sci-Fi")) {
            System.out.println(movie);
        }

        System.out.println("\nMinimum rating 8.7:");
        for (Movie movie : filterByMinimumRating(movies, 8.7)) {
            System.out.println(movie);
        }

        System.out.println("\nYear range 2009 to 2017:");
        for (Movie movie : filterByYearRange(movies, 2009, 2017)) {
            System.out.println(movie);
        }
    }
}
