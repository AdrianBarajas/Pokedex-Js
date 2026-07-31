const results = document.querySelector('#pokedex-results');
const form = document.querySelector('#form');

document.addEventListener('DOMContentLoaded', () => {
    form.addEventListener('submit', validForm);
});

function validForm(e) {
    e.preventDefault();

    const searchValue = document.querySelector('#search-input').value.trim();

    if (searchValue == '') {
        showAlert('Search field must not be empty');
        return;
    }

    searchPokemon(searchValue);
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

async function searchPokemon(searchValue) {

    const url = `https://pokeapi.co/api/v2/pokemon/${searchValue}`;

    try {
        const response = await fetch(url);
        const result = await response.json();
        showResult(result)
    } catch (error) {
        console.log(error);
    }
}

function showResult(result) {

    const { id, name, sprites, stats } = result;
    // console.log(id);
    // console.log(name);
    // console.log(sprites);
    // console.log(stats);

    results.innerHTML = `
    <div class="pokemon-card">
        <img src="${sprites['front_default']}" alt="img-${name}">

        <div class="pokemon-data">
            <p>${name}</p>
            <p></p>

            <a href=""></a>
        </div>
    </div>
    `;
}