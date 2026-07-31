const results = document.querySelector('#pokedex-results');
const form = document.querySelector('#form');
const initSearch = 30;

document.addEventListener('DOMContentLoaded', () => {
    form.addEventListener('submit', validForm);

    loadPreviewPokemon();
});

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
        const { id, name, sprites, stats } = pokemon;

        results.innerHTML += `
            <div class="pokemon-card">
                <img src="${sprites['front_default']}" alt="img-${name}">

                <div class="pokemon-data">
                    <p>${name}</p>
                    <p></p>

                    <a href=""></a>
                </div>
            </div>
        `;
    });
}