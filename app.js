const results = document.querySelector('#pokedex-results');
const form = document.querySelector('#form');
const loadMoreBtn = document.querySelector('#morePokemonBtn');
const sidebar = document.querySelector('#pokemon-sidebar');
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
    results.addEventListener('click', handlePokemonCardClick);
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
                return null;
            }

            return await response.json();
        });
        
        const resultsData = (await Promise.all(promises)).filter(Boolean);
        showResult(resultsData);

    } catch (error) {
        console.error(error);
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
            <div class="pokemon-card" data-id="${id}" data-name="${name}">
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

function handlePokemonCardClick(e) {
    const card = e.target.closest('.pokemon-card');

    if (!card) {
        return;
    }

    const pokemonId = card.dataset.id;
    showPokemonSidebar(pokemonId);
}

async function showPokemonSidebar(pokemonId) {
    try {
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const pokemonData = await pokemonResponse.json();

        const speciesResponse = await fetch(pokemonData.species.url);
        const speciesData = await speciesResponse.json();

        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();

        const encounterResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`);
        const encounterData = await encounterResponse.json();

        const evolutionForms = getEvolutionChainNames(evolutionData.chain);
        const locations = getEncounterLocations(encounterData);
        const typesArr = getTypes(pokemonData.types);
        const abilities = getAbilities(pokemonData.abilities);
        const stats = getStats(pokemonData.stats);

        sidebar.innerHTML = `
            <div class="pokemon-detail-card">
                <div class="pokemon-detail-header">
                    <img class="pokemon-detail-img" src="${pokemonData.sprites.other.showdown.front_default}" alt="img-${pokemonData.name}">
                    <div>
                        <p class="pokemon-detail-id">N◦${pokemonData.id}</p>
                        <h2>${pokemonData.name}</h2>
                    </div>
                </div>

                <div class="pokemon-detail-section">
                    <h3>Type</h3>
                    <div class="pokemon-types">${typesArr.map(type => `<span class="pokemon-type" style="background-color: ${typeColors[type] || '#757575'}">${type}</span>`).join('')}</div>
                </div>

                <div class="pokemon-detail-section">
                    <h3>Abilities</h3>
                    <p>${abilities.join(', ')}</p>
                </div>

                <div class="pokemon-detail-section">
                    <h3>Stats</h3>
                    <ul class="pokemon-stats-list">${stats.map(stat => `<li><span>${stat.name}</span><strong>${stat.value}</strong></li>`).join('')}</ul>
                </div>

                <div class="pokemon-detail-section">
                    <h3>Evolution Forms</h3>
                    <p>${evolutionForms.join(' → ')}</p>
                </div>

                <div class="pokemon-detail-section">
                    <h3>Locations</h3>
                    <p>${locations.length ? locations.join(', ') : 'No encounter locations found.'}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error(error);
        sidebar.innerHTML = `
            <div class="sidebar-placeholder">
                <p>We couldn't load the Pokémon details.</p>
            </div>
        `;
    }
}

function getTypes(types){
    const results = [];

    types.forEach(element => {
       results.push(element['type']['name']);
    });

    return results;
}

function getAbilities(abilities){
    return abilities.map(ability => ability.ability.name);
}

function getStats(stats){
    return stats.map(stat => ({
        name: stat.stat.name,
        value: stat.base_stat
    }));
}

function getEvolutionChainNames(chain) {
    const evolutionNames = [];

    const collectEvolutionNames = (currentChain) => {
        evolutionNames.push(currentChain.species.name);

        if (currentChain.evolves_to.length > 0) {
            currentChain.evolves_to.forEach(item => collectEvolutionNames(item));
        }
    };

    collectEvolutionNames(chain);

    return [...new Set(evolutionNames)];
}

function getEncounterLocations(encounterData) {
    return [...new Set(encounterData.map(location => location.location_area.name.replace(/-/g, ' ')))];
}