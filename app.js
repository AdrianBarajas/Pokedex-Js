const results = document.querySelector('#pokedex-results');
const form = document.querySelector('#form');
const loadMoreBtn = document.querySelector('#morePokemonBtn');
const sidebar = document.querySelector('#pokemon-sidebar');
const searchInput = document.querySelector('#search-input');
const typeSelect = document.querySelector('#type-select');
const weaknessSelect = document.querySelector('#weakness-select');
const abilitySelect = document.querySelector('#ability-select');
const resetButton = document.querySelector('button[type="reset"]');
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
    resetButton.addEventListener('click', () => {
        initSearch = 30;
        setTimeout(() => loadPreviewPokemon(), 0);
    });
    loadPreviewPokemon();
});

function loadMorePokemons(e) {
    initSearch += 30;
    loadPreviewPokemon();
    loadMoreBtn.disabled = true;

    setTimeout(() => {
        loadMoreBtn.disabled = false;
    }, 3000);
}

function loadPreviewPokemon() {
    const pokemonNumbers = [];

    for (let i = 1; i <= initSearch; i++) {
        pokemonNumbers.push(i);
    }

    searchPokemon(pokemonNumbers);
}

function getSelectedFilters() {
    return {
        type: typeSelect.value,
        weakness: weaknessSelect.value,
        ability: abilitySelect.value
    };
}

async function validForm(e) {
    e.preventDefault();

    const searchValue = searchInput.value.trim().toLowerCase();
    const selectedFilters = getSelectedFilters();

    if (!searchValue && !selectedFilters.type && !selectedFilters.weakness && !selectedFilters.ability) {
        initSearch = 30;
        loadPreviewPokemon();
        return;
    }

    if (searchValue) {
        const resultsData = await fetchPokemonData([searchValue]);
        const filteredData = filterPokemonData(resultsData, selectedFilters);
        showResult(filteredData);
        return;
    }

    const filteredPokemonIds = await getPokemonIdsByFilters(selectedFilters);
    const resultsData = await fetchPokemonData(filteredPokemonIds);
    showResult(resultsData);
}

function showAlert(msj) {
    const thereIsAnAlert = document.querySelector('.bg-red-100');

    if (!thereIsAnAlert) {
        const alert = document.createElement('P');
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

async function fetchPokemonData(searchValues) {
    const baseUrl = 'https://pokeapi.co/api/v2/pokemon/';

    try {
        const promises = searchValues.map(async (searchValue) => {
            const response = await fetch(`${baseUrl}${searchValue}`);

            if (!response.ok) {
                return null;
            }

            return await response.json();
        });

        return (await Promise.all(promises)).filter(Boolean);
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function searchPokemon(searchValues) {
    const resultsData = await fetchPokemonData(searchValues);
    showResult(resultsData);
}

function filterPokemonData(resultsData, filters) {
    return resultsData.filter((pokemon) => {
        const types = getTypes(pokemon.types);
        const abilities = getAbilities(pokemon.abilities);

        const matchesType = filters.type ? types.includes(filters.type) : true;
        const matchesWeakness = filters.weakness ? matchesSelectedWeakness(types, filters.weakness) : true;
        const matchesAbility = filters.ability ? abilities.includes(filters.ability) : true;

        return matchesType && matchesWeakness && matchesAbility;
    });
}

function matchesSelectedWeakness(types, weakness) {
    const weaknessMap = {
        fire: ['grass', 'ice', 'bug', 'steel'],
        water: ['fire', 'ground', 'rock'],
        grass: ['water', 'ground', 'rock'],
        electric: ['water', 'flying'],
        normal: [],
        poison: ['grass', 'fairy'],
        fighting: ['normal', 'ice', 'rock', 'dark', 'steel'],
        flying: ['grass', 'fighting', 'bug'],
        psychic: ['fighting', 'poison'],
        bug: ['grass', 'psychic', 'dark'],
        rock: ['fire', 'ice', 'flying', 'bug'],
        ghost: ['psychic', 'ghost'],
        dragon: ['dragon', 'ice', 'fairy'],
        dark: ['fighting', 'bug', 'fairy'],
        steel: ['fire', 'water', 'electric', 'steel'],
        fairy: ['fighting', 'dragon', 'dark']
    };

    const weaknessTypes = weaknessMap[weakness] || [];
    return types.some((type) => weaknessTypes.includes(type));
}

async function getPokemonIdsByFilters(filters) {
    const typeIds = filters.type ? await getFilterPokemonIds('type', filters.type) : [];
    const weaknessIds = filters.weakness ? await getFilterPokemonIds('weakness', filters.weakness) : [];
    const abilityIds = filters.ability ? await getFilterPokemonIds('ability', filters.ability) : [];

    if (typeIds.length === 0 && weaknessIds.length === 0 && abilityIds.length === 0) {
        return [];
    }

    const activeFilters = [
        { ids: typeIds, enabled: Boolean(filters.type) },
        { ids: weaknessIds, enabled: Boolean(filters.weakness) },
        { ids: abilityIds, enabled: Boolean(filters.ability) }
    ].filter((filter) => filter.enabled);

    const resultIds = activeFilters.length > 0 ? new Set(activeFilters[0].ids) : new Set();

    activeFilters.slice(1).forEach((filter) => {
        const nextSet = new Set(filter.ids);
        for (const id of resultIds) {
            if (!nextSet.has(id)) {
                resultIds.delete(id);
            }
        }
    });

    return [...resultIds];
}

async function getFilterPokemonIds(filterType, filterValue) {
    const baseUrl = 'https://pokeapi.co/api/v2';

    if (filterType === 'ability') {
        const response = await fetch(`${baseUrl}/ability/${filterValue}`);
        const data = await response.json();
        return data.pokemon.map(({ pokemon }) => pokemon.name);
    }

    if (filterType === 'weakness') {
        const typeResponse = await fetch(`${baseUrl}/type/${filterValue}`);
        const typeData = await typeResponse.json();
        const weaknessTypes = typeData.damage_relations?.double_damage_from || [];
        const weaknessPromises = weaknessTypes.map(async (item) => {
            const response = await fetch(`${baseUrl}/type/${item.name}`);
            const data = await response.json();
            return data.pokemon.map(({ pokemon }) => pokemon.name);
        });

        const weaknessesByType = await Promise.all(weaknessPromises);
        return [...new Set(weaknessesByType.flat())];
    }

    const response = await fetch(`${baseUrl}/type/${filterValue}`);
    const data = await response.json();
    return data.pokemon.map(({ pokemon }) => pokemon.name);
}

function showResult(resultsData) {
    results.innerHTML = '';

    if (resultsData.length === 0) {
        results.innerHTML = '<p>No Pokémon were found with the selected filters.</p>';
        return;
    }

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