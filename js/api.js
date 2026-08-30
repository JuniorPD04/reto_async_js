(function () {
    "use strict";

    const API_BASE_URL = "https://www.thecocktaildb.com/api/json/v1/1";

    async function requestCocktail(endpoint) {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);

        if (!response.ok) {
            throw new Error("La API no respondió correctamente.");
        }

        const data = await response.json();

        if (!data.drinks || data.drinks.length === 0) {
            throw new Error("La API no devolvió cocteles para esta consulta.");
        }

        return data.drinks[0];
    }

    function formatIngredientList(rawDrink) {
        const ingredients = [];

        for (let index = 1; index <= 15; index += 1) {
            const ingredient = rawDrink[`strIngredient${index}`];
            const measure = rawDrink[`strMeasure${index}`];

            if (ingredient && ingredient.trim()) {
                ingredients.push({
                    nombre: ingredient.trim(),
                    cantidad: measure && measure.trim() ? measure.trim() : "Al gusto"
                });
            }
        }

        return ingredients;
    }

    function formatDrink(rawDrink) {
        return {
            id: String(rawDrink.idDrink),
            nombre: rawDrink.strDrink || "Coctel sin nombre",
            categoria: rawDrink.strCategory || "Sin categoría",
            tipo: rawDrink.strAlcoholic || "Sin clasificación",
            vaso: rawDrink.strGlass || "Vaso no especificado",
            imagen: rawDrink.strDrinkThumb || "",
            instrucciones: rawDrink.strInstructionsES || rawDrink.strInstructions || "La API no incluye instrucciones para esta receta.",
            ingredientes: formatIngredientList(rawDrink)
        };
    }

    async function getRandomDrink() {
        const rawDrink = await requestCocktail("random.php");
        return formatDrink(rawDrink);
    }

    async function getDrinkById(id) {
        const rawDrink = await requestCocktail(`lookup.php?i=${encodeURIComponent(id)}`);
        return formatDrink(rawDrink);
    }

    window.CocktailAPI = {
        getRandomDrink,
        getDrinkById
    };
})();
