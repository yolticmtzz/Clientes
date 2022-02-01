var client;

(async function init() {
  client = await app.initialized();
  client.events.on('app.activated', () => {
    console.log('App is Activated');
  });

  await renderPokemon();  

  var btn = document.getElementsByClassName('btn-open');
  btn.addEventListener('click', function () {
    openModal();
  });
})();

async function renderPokemon() {
  const header = {
    headers:{
      "Content-Type": "application/json"
    }
  };

  let data = await client.request.get('https://pokeapi.co/api/v2/pokemon/pikachu/', header);
  let value = JSON.parse(data.response);
  console.log("valor ======> " + JSON.stringify(value));
  console.log(JSON.stringify(data.response.abilities));
  let pokemon = JSON.stringify(value.forms[0].name);
  console.log(pokemon)

  let text = pokemon
  
  document.getElementById("apitext").innerText = text;
}

// document.onreadystatechange = function() {
//   if (document.readyState === 'interactive') renderApp();
//   function renderApp() {
//     var onInit = app.initialized();

//     onInit.then(getClient).catch(handleErr);

//     function getClient(_client) {
//       window.client = _client;
//       client.events.on('app.activated', teste());
//     }
//   }
// };

// function teste() {
//   
  
//   // Start writing your code...
//   const header = {
//     headers:{
//       "Content-Type": "application/json"
//     }
//   };

//   console.log("Fazendo request");

//   client.request.get("https://pokeapi.co/api/v2/pokemon/pikachu/", header)
//   .then(
//     function (data) {
//       document.getElementById("apitext").innerText = data;
//       console.log(data);
//     },
//     function (error) {   
//       document.getElementById("apitext").innerText = error;
//       console.log(error);
//     }
//   )
// }

function openModal() {
  client.interface.trigger(
    'showModal',
    useTemplate('Title of the Modal', './views/modal.html')
  );
}

// function useTemplate(title, template) {
//   return {
//     title,
//     template
//   };
// }

// function handleErr(err) {
//   console.error(`Error occured. Details:`, err);
// }
