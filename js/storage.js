(function () {
    "use strict";

    const FAVORITES_KEY = "cocktailFavorites";

    function normalizeFavorite(item) {
        return {
            id: String(item.id),
            nombre: String(item.nombre)
        };
    }

    function getFavorites() {
        try {
            const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

            if (!Array.isArray(parsed)) {
                return [];
            }

            return parsed
                .filter((item) => item && item.id && item.nombre)
                .map(normalizeFavorite);
        } catch (error) {
            return [];
        }
    }

    function saveFavorites(favorites) {
        const minimalFavorites = favorites.map(normalizeFavorite);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(minimalFavorites));
    }

    function hasFavorite(id) {
        return getFavorites().some((favorite) => favorite.id === String(id));
    }

    function addFavorite(drink) {
        const favorites = getFavorites();
        const id = String(drink.id);

        if (favorites.some((favorite) => favorite.id === id)) {
            return favorites;
        }

        const nextFavorites = [
            ...favorites,
            {
                id,
                nombre: String(drink.nombre)
            }
        ];

        saveFavorites(nextFavorites);
        return nextFavorites;
    }

    function removeFavorite(id) {
        const nextFavorites = getFavorites().filter((favorite) => favorite.id !== String(id));
        saveFavorites(nextFavorites);
        return nextFavorites;
    }

    window.FavoriteStorage = {
        getFavorites,
        hasFavorite,
        addFavorite,
        removeFavorite
    };
})();
