const results = document.querySelector('#pokedex-results');
const form = document.querySelector('#form');
const loadMoreBtn = document.querySelector('#morePokemonBtn');
let initSearch = 30;

const typeColors = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD'
};

document.addEventListener('DOMContentLoaded', () => {
    form.addEventListener('submit', validForm);
    loadMoreBtn.addEventListener('click', loadMorePokemons);
    loadPreviewPokemon();
});

function loadMorePokemons(e){

    initSearch += 30;
    loadPreviewPokemon();
    loadMoreBtn.disabled = true;
    setTimeout(() => {
        loadMoreBtn.disabled = false;
    }, 3000);
}

function loadPreviewPokemon(){
    let pokemonNumbers = [];
    for(let i = 1; i <= initSearch; i++){
        pokemonNumbers.push(i);
    }
    searchPokemon(pokemonNumbers);
}

function validForm(e) {
    e.preventDefault();

    const searchValue = document.querySelector('#search-input').value.trim();

    if (searchValue == '') {
        showAlert('Search field must not be empty');
        return;
    }

    searchPokemon([searchValue]);
}

function showAlert(msj) {
    const thereIsAnAlert = document.querySelector('.bg-red-100');

    if (!thereIsAnAlert) {
        const alert = document.createElement('P');
        //alert.classList.add('');

        alert.innerHTML = `
            <strong style="font-weight: bold">Error</strong>
            <span>${msj}</span>
        `;

        form.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
}

async function searchPokemon(searchValues) {

    let baseUrl = 'https://pokeapi.co/api/v2/pokemon/';

    try {

        const promises = searchValues.map(async (searchValue) => {
            const response = await fetch(`${baseUrl}${searchValue}`);

            if(!response.ok){
                console.log('Pokemon no encontrado');
            }

            return await response.json();
        })
        
        const resultsData = await Promise.all(promises);
        showResult(resultsData);

    } catch (error) {

    }
}

function showResult(resultsData) {
    results.innerHTML = '';

    resultsData.forEach(pokemon => {
        const { id, name, sprites, types } = pokemon;
        const typesArr = getTypes(types);
        const typeBadges = typesArr.map(type => {
            const color = typeColors[type] || '#757575';
            return `<span class="pokemon-type" style="background-color: ${color}">${type}</span>`;
        }).join('');

        results.innerHTML += `
            <div class="pokemon-card">
                <img class="pokemon-img" src="${sprites["other"]["showdown"]["front_default"]}" alt="img-${name}">

                <div class="pokemon-data">
                    <p class="pokemon-id">N◦${id}</p>
                    <p class="pokemon-name">${name}</p>
                    <div class="pokemon-types">${typeBadges}</div>
                </div>
            </div>
        `;
    });
}

function getTypes(types){
    const results = [];

    types.forEach(element => {
       results.push(element['type']['name']);
    });

    return results;
}