var client;

(async function init() {
  client = await app.initialized();
  client.events.on('app.activated', () => {
    console.log('App is Activated');
  });

  const header = {
    headers:{
      "Content-Type": "application/json"
    }
  };

  let data = await client.request.get('https://pokeapi.co/api/v2/pokemon/pikachu/', header);
  console.log(data);

  document.getElementById("apitext").innerText = JSON.stringify(data);

  var btn = document.getElementsByClassName('btn-open');
  btn.addEventListener('click', function () {
    openModal();
  });
  
})();

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
