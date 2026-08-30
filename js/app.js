(function () {
    "use strict";

    const recipeCard = document.getElementById("recipeCard");
    const statusRegion = document.getElementById("statusRegion");
    const randomButton = document.getElementById("randomButton");
    const favoritesList = document.getElementById("favoritesList");
    const favoriteCounter = document.getElementById("favoriteCounter");

    let activeDrink = null;

    function escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function renderStarIcon(isFilled) {
        return `
            <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path ${isFilled ? 'class="is-filled"' : ""} d="m12 3.6 2.65 5.37 5.93.86-4.29 4.18 1.01 5.9L12 17.12l-5.3 2.79 1.01-5.9-4.29-4.18 5.93-.86L12 3.6Z"></path>
            </svg>
        `;
    }

    function renderCloseIcon() {
        return `
            <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M7 7l10 10"></path>
                <path d="M17 7 7 17"></path>
            </svg>
        `;
    }

    function setControlsDisabled(isDisabled) {
        randomButton.disabled = isDisabled;
        document.querySelectorAll("[data-load-favorite], [data-remove-favorite], [data-toggle-favorite]")
            .forEach((button) => {
                button.disabled = isDisabled;
            });
    }

    function clearStatus() {
        statusRegion.innerHTML = "";
    }

    function renderError(message) {
        statusRegion.innerHTML = `
            <div class="status-message" role="alert">
                <span>${escapeHTML(message)}</span>
            </div>
        `;
    }

    function renderLoader() {
        recipeCard.innerHTML = `
            <div class="skeleton-panel" aria-label="Cargando receta">
                <div class="skeleton-card">
                    <div class="loader-dot" aria-hidden="true"></div>
                    <div class="skeleton-image"></div>
                    <div class="skeleton-line title"></div>
                    <div class="skeleton-line medium"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line short"></div>
                    <div class="skeleton-pill"></div>
                </div>
            </div>
        `;
    }

    function renderRecipe(drink) {
        const favorite = FavoriteStorage.hasFavorite(drink.id);
        const ingredients = drink.ingredientes.length
            ? drink.ingredientes
            : [{ nombre: "Sin ingredientes listados", cantidad: "La API no devolvió cantidades." }];

        recipeCard.innerHTML = `
            <div class="recipe-layout">
                <figure class="recipe-media">
                    <img src="${escapeHTML(drink.imagen)}" alt="Imagen del coctel ${escapeHTML(drink.nombre)}">
                </figure>

                <div class="recipe-content">
                    <div class="meta-row" aria-label="Datos de la receta">
                        <span class="meta-chip">ID ${escapeHTML(drink.id)}</span>
                        <span class="meta-chip">${escapeHTML(drink.categoria)}</span>
                        <span class="meta-chip">${escapeHTML(drink.tipo)}</span>
                        <span class="meta-chip">${escapeHTML(drink.vaso)}</span>
                    </div>

                    <div class="recipe-title-row">
                        <h3 class="recipe-title">${escapeHTML(drink.nombre)}</h3>
                        <button class="icon-button favorite-toggle ${favorite ? "is-active" : ""}" type="button" data-toggle-favorite title="${favorite ? "Quitar de favoritos" : "Añadir a favoritos"}" aria-label="${favorite ? "Quitar de favoritos" : "Añadir a favoritos"}">
                            ${renderStarIcon(favorite)}
                        </button>
                    </div>

                    <section class="detail-section" aria-labelledby="ingredientsTitle">
                        <h3 id="ingredientsTitle">Ingredientes y cantidades</h3>
                        <ul class="ingredient-grid">
                            ${ingredients.map((item) => `
                                <li class="ingredient">
                                    <strong>${escapeHTML(item.nombre)}</strong>
                                    <span>${escapeHTML(item.cantidad)}</span>
                                </li>
                            `).join("")}
                        </ul>
                    </section>

                    <section class="detail-section" aria-labelledby="instructionsTitle">
                        <h3 id="instructionsTitle">Preparación</h3>
                        <p class="instructions">${escapeHTML(drink.instrucciones)}</p>
                    </section>
                </div>
            </div>
        `;

        recipeCard.classList.remove("is-entering");
        requestAnimationFrame(() => {
            recipeCard.classList.add("is-entering");
        });
    }

    function renderFavorites() {
        const favorites = FavoriteStorage.getFavorites();
        favoriteCounter.textContent = String(favorites.length);

        if (favorites.length === 0) {
            favoritesList.innerHTML = `
                <div class="empty-state">
                    <strong>No tienes favoritos guardados todavía.</strong>
                </div>
            `;
            return;
        }

        favoritesList.innerHTML = favorites.map((favorite) => `
            <div class="favorite-row" role="button" tabindex="0" data-load-favorite="${escapeHTML(favorite.id)}">
                <span>
                    <strong>${escapeHTML(favorite.nombre)}</strong>
                    <small>ID ${escapeHTML(favorite.id)}</small>
                </span>
                <button class="icon-button" type="button" data-remove-favorite="${escapeHTML(favorite.id)}" aria-label="Eliminar ${escapeHTML(favorite.nombre)} de favoritos">
                    ${renderCloseIcon()}
                </button>
            </div>
        `).join("");
    }

    async function loadRandomDrink() {
        try {
            clearStatus();
            setControlsDisabled(true);
            renderLoader();

            activeDrink = await CocktailAPI.getRandomDrink();
            renderRecipe(activeDrink);
            renderFavorites();
        } catch (error) {
            renderError("No se pudo cargar un coctel aleatorio. Revisa tu conexión e intenta nuevamente.");
        } finally {
            setControlsDisabled(false);
        }
    }

    async function loadFavoriteById(id) {
        try {
            clearStatus();
            setControlsDisabled(true);
            renderLoader();

            activeDrink = await CocktailAPI.getDrinkById(id);
            renderRecipe(activeDrink);
            renderFavorites();
        } catch (error) {
            renderError("No se pudo recuperar el favorito desde la API. La interfaz sigue disponible.");
        } finally {
            setControlsDisabled(false);
        }
    }

    function toggleActiveFavorite() {
        if (!activeDrink) {
            renderError("Primero carga una receta para poder guardarla.");
            return;
        }

        if (FavoriteStorage.hasFavorite(activeDrink.id)) {
            FavoriteStorage.removeFavorite(activeDrink.id);
        } else {
            FavoriteStorage.addFavorite(activeDrink);
        }

        renderRecipe(activeDrink);
        renderFavorites();
    }

    function handleFavoriteKeyboard(event) {
        if (event.key !== "Enter" && event.key !== " ") {
            return;
        }

        const row = event.target.closest("[data-load-favorite]");
        if (!row) {
            return;
        }

        event.preventDefault();
        loadFavoriteById(row.dataset.loadFavorite);
    }

    randomButton.addEventListener("click", loadRandomDrink);

    document.addEventListener("click", (event) => {
        const removeButton = event.target.closest("[data-remove-favorite]");
        const favoriteRow = event.target.closest("[data-load-favorite]");
        const toggleButton = event.target.closest("[data-toggle-favorite]");

        if (removeButton) {
            event.stopPropagation();
            FavoriteStorage.removeFavorite(removeButton.dataset.removeFavorite);
            renderFavorites();

            if (activeDrink) {
                renderRecipe(activeDrink);
            }

            return;
        }

        if (toggleButton) {
            toggleActiveFavorite();
            return;
        }

        if (favoriteRow) {
            loadFavoriteById(favoriteRow.dataset.loadFavorite);
        }
    });

    document.addEventListener("keydown", handleFavoriteKeyboard);

    document.addEventListener("DOMContentLoaded", () => {
        renderFavorites();
        loadRandomDrink();
    });
})();
