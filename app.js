const results = document.querySelector('#pokedex-results');
const form = document.querySelector('#form');
const loadMoreBtn = document.querySelector('#morePokemonBtn');
let initSearch = 30;

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

    
    // console.log(id);
    // console.log(name);
    // console.log(sprites);
    // console.log(stats);
    results.innerHTML = '';

    resultsData.forEach(pokemon => {
        const { id, name, sprites, types, stats } = pokemon;
        const typesArr = getTypes(types);

        results.innerHTML += `
            <div class="pokemon-card">
                <img class="pokemon-img" src="${sprites["other"]["showdown"]["front_default"]}" alt="img-${name}">

                <div class="pokemon-data">
                    <p class="pokemon-id">N◦${id}</p>
                    <p class="pokemon-name">${name}</p>
                    <p class="pokemon-types">${typesArr[0]}</p>

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