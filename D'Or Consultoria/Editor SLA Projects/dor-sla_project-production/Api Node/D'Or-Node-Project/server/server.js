exports = {

  events: [
    { event: 'onTicketCreate', callback: 'onTicketCreateHandler' },
    { event: 'onTicketUpdate', callback: 'onTicketUpdateHandler' }
  ],


  onTicketCreateHandler: async function (args) {

    //Variables that take ticket information
    let custom_fields_create = args.data.ticket.custom_fields;
    let client = args.data.ticket.custom_fields.cf_categoria_1228746;
    let id = args.data.ticket.id;
    let apiKey = args.iparams.api_key;

    //Variables that will have the value of the fields of the ticket
    let produtooperadora_value;
    let produtooperadora_key;

    let categoria_value;
    let categoria_key;

    let subcategoria_value;
    let subcategoria_key;

    let fieldsObtained = {
      gotProduto: false,
      gotCategoria: false,
      gotSubcategoria: false
    }

    let slaObtained = false;
    let recordObj;

    console.log("__________________________________________");
    console.log(`Início do onCreate do ticket ${id}`);

    //deleting this field from the array so the iterator wont get the wrong data
    //this field holds the value of the client
    delete custom_fields_create["cf_categoria_1228746"];

    //FOR loop to assing value from the request to the respective variables
    for (var property in custom_fields_create) {
      if (custom_fields_create[property] != null) {
        //Produto
        if (property.includes("cf_produtooperadora")) {
          produtooperadora_value = custom_fields_create[property]
          produtooperadora_key = property.replace(/\_1228746/g, '');
          fieldsObtained.gotProduto = true;
        }
        //Categoria
        else if (property.includes("cf_categoria")) {
          categoria_value = custom_fields_create[property]
          categoria_key = property.replace(/\_1228746/g, '');
          fieldsObtained.gotCategoria = true;
        }
        //Subcategoria
        else if (property.includes("cf_subcategoria") || property.includes("cf_item")) {
          subcategoria_value = custom_fields_create[property]
          subcategoria_key = property.replace(/\_1228746/g, '');
          fieldsObtained.gotSubcategoria = true;
        }
      }
    }

    const payload_verifiesSLA = {
      Client_: client,
      ProductOperator_: produtooperadora_value,
      Category_: categoria_value,
      SubCategory_: subcategoria_value,
    };

    const request_verifiesSLA = {
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload_verifiesSLA)
    };

    // Verifies if all fields where obtained
    console.log("Verificando se foi obtido os valores dos campos do ticket");
    if (Object.values(fieldsObtained).every(Boolean)) {

      console.log("Campos obtidos");

      console.log("POST - Requisição para obter o SLA");
      await $request.post("https://dor-backend-production.azurewebsites.net/api/RelationshipRecord", request_verifiesSLA)
        .then(
          function (data_record) {
            recordObj = JSON.parse(data_record.response);

            console.log(`Objeto com o SLA`);
            console.log(recordObj)

            slaObtained = true;
          },
          function (error) {
            console.error(`O erro abaixo ocorreu ao efetuar a requisição que retorna o sla, no ticket com id ${id} `, error);
            console.log("Encerrando o create");
            console.log("__________________________________________");
            process.exit(1);
          });

      //body that gets the data of the created ticket to be registered in the database
      const payload_registerTimestamp = {
        TicketId: id,
        Client: client,
        ValueProductOperator: produtooperadora_value,
        ValueCategory: categoria_value,
        ValueSubCategory: subcategoria_value,
        KeyProductOperator: produtooperadora_key,
        KeyCategory: categoria_key,
        KeySubCategory: subcategoria_key
      }

      //Request configuration that is responsible for sending the info to api .NET CORE
      const request_registerTimestamp = {
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload_registerTimestamp)
      }

      //Method responsible for registering the data obtained from payLoad in the database
      console.log("POST - Requisição para cadastrar os campos do ticket no banco de dados"); 
      await $request.post("https://dor-backend-production.azurewebsites.net/api/TimeStamp", request_registerTimestamp)
        .then(
          function (data) {
            console.log(data.status);
            console.info("Registro do ticket concluído com sucesso.");
          },
          function (error) {
            console.error("Houve um erro ao finalizar o registro do ticket no banco de dados. ", error);
            console.log("Encerrando o create");
            console.log("__________________________________________");
            process.exit(1);
          });
    }
    else {
      console.error("Falha na obtenção do valor dos campos do ticket, pois um ou mais vieram vazios.");

      //body that gets the data of the created ticket to be registered in the database
      const payload_registerTimestampNull = {
        TicketId: id,
        Client: "",
        ValueProductOperator: "",
        ValueCategory: "",
        ValueSubCategory: "",
        KeyProductOperator: "",
        KeyCategory: "",
        KeySubCategory: ""
      }

      //Request configuration that is responsible for sending the info to api .NET CORE
      const request_registerTimestampNull = {
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload_registerTimestampNull)
      }

      //Method responsible for registering the data obtained from payLoad in the database 
      console.log("POST - Requisição para cadastrar os campos vazios do ticket no banco de dados");
      await $request.post("https://dor-backend-production.azurewebsites.net/api/TimeStamp", request_registerTimestampNull)
        .then(
          function (data) {
            console.log(data.status);
            console.info("Registro do ticket vazio concluído com sucesso.");
          },
          function (error) {
            console.error("Houve um erro ao finalizar o registro do ticket no banco de dados. ", error);
            console.log("Encerrando o create");
            console.log("__________________________________________");
            process.exit(1);
          });

      console.log("Encerrando o create");
      console.log("__________________________________________");
      process.exit(1);
    }

    if (slaObtained) {
      await UpdateSLA(recordObj, apiKey, id);
    }

    console.log("Fim do OnCreate");
    console.log("__________________________________________");
    process.exit();
  },

  onTicketUpdateHandler: async function (args) {

    // Auxialliary variables
    let id = args.data.ticket.id;
    let searchedTimestamp;
    let apiKey = args.iparams.api_key;
    let customFields;
    let relationshipObj;
    let slaObtained = false;

    console.log("__________________________________________");
    console.log(`Início do onUpdate do ticket ${id}`);

    const request_getTicket = {
      headers: {
        "Authorization": "Basic " + apiKey,
        "Content-Type": "application/json"
      }
    };

    //Method responsible for listing freshdesk ticket
    //this is done so that we can get the attributes without _1228746
    console.log("GET - Requisição para obter os campos do ticket " + id);
    await $request.get(`https://dorconsultoria.freshdesk.com/api/v2/tickets/${id}`, request_getTicket)
      .then(
        function (data_customfields) {
          let ticket = JSON.parse(data_customfields.response)
          customFields = ticket.custom_fields;
          console.log("Dados do ticket obtidos com sucesso");
          console.log(customFields);
        },
        function (error) {
          console.log(error);
          console.log("Houve um erro na requisição para obter o ticket")
          console.log("Encerrando o update")
          console.log("__________________________________________");
          process.exit(1);
        });

    const options_ = {
      headers: {
        "Content-Type": "application/json"
      }
    }

    console.log("GET - Requisição para obter o timestamp do banco de dados");
    await $request.get(`https://dor-backend-production.azurewebsites.net/api/TimeStamp/${id}`, options_)
      .then((data) => {
        searchedTimestamp = JSON.parse(data.response);

        console.log('Timestamp encontrado');
        console.log(searchedTimestamp);

      },
        function (error) {
          console.error("Houve um erro na requisição para obter o timestamp", error);
          console.log("Encerrando o update")
          console.log("__________________________________________");
          process.exit(1);
        });

    //variables that will store the values (new and in some occasions, old ones that didn't needed change)
    let cliente_value;
    let produtooperadora_value;
    let produtooperadora_key;

    let categoria_value;
    let categoria_key;

    let subcategoria_value;
    let subcategoria_key;

    //variable that will store the updated JSON of the current ticket and timestamp
    let newCustomFields;
    let newTimestampRequest;

    //variables used to verify if the right values were obtained
    let fieldsObtained = {
      gotCliente: false,
      gotProduto: false,
      gotCategoria: false,
      gotSubcategoria: false
    }

    console.log("GET - Requisição para obter os campos do ticket " + id);
    //Method responsible for listing freshdesk ticket
    //this is done so that we can get the attributes without _1228746
    await $request.get(`https://dorconsultoria.freshdesk.com/api/v2/tickets/${id}`, request_getTicket)
      .then(
        function (data_customfields) {

          // geting the old values from freshdesk
          let ticketObj = JSON.parse(data_customfields.response);
          let customFields = ticketObj.custom_fields;

          // // for (var property in customFields) {
          // //   if (!property.includes("cf_produtooperadora") ||
          // //     !property.includes("cf_categoria") ||
          // //     !property.includes("cf_subcategoria") ||
          // //     !property.includes("cf_item")) {
          // //     delete property;
          // //   }
          // // }

          //deletion of an unnecessary fields
          delete customFields["cf_nome_do_atendido"];
          delete customFields["cf_nmero_da_matricula"];
          delete customFields["cf_nmero_da_matricula"];
          delete customFields["cf_atendido"];
          delete customFields["cf_cpf"];
          delete customFields["cf_unidade"];
          delete customFields["cf_descrio"];
          delete customFields["cf_chamado_flow"];
          delete customFields["cf_nome_do_atendido356917"];
          delete customFields["cf_nome_ut"];
          delete customFields["cf_gerente_ut"];
          delete customFields["cf_coordenador_ut"];
          delete customFields["cf_nome_do_atendido349946"];
          delete customFields["cf_cpf538806"];
          delete customFields["cf_cdigo_ut"];
          delete customFields["cf_administrativo_ut"];
          delete customFields["cf_consrcios"];
          delete customFields["cf_nome_do_atendido626168"];
          delete customFields["cf_matrcula"];
          delete customFields["cf_descreva_categoriasubcategoria"];
          delete customFields["cf_id_freshservice"];
          delete customFields["cf_1"];
          delete customFields["cf_2"];
          delete customFields["cf_3"];
          delete customFields["cf_nome_do_solicitante"];
          delete customFields["cf_solicitante"];
          delete customFields["cf_exceo"];

          console.log("CustomFields com as informações novas e antigas");
          console.log(customFields);

          console.log("------------------------------------------");
          console.log("Método de atualização dos campos do ticket");

          console.log("Campos do ticket atual");
          console.log(customFields);

          console.log("Campos do ticket antigo");
          console.log(searchedTimestamp)

          if (searchedTimestamp !== null) {
            // array[i] => value of the index
            // i => key of the index

            // If the client is null the other attributes will also be, so in this case
            // the ticket was created by email
            if (searchedTimestamp.timestamp.client === "") {
              //for loop to assing value from the request to the respective variables
              console.log("Looping for para obter os valores dos campos do ticket")
              for (var property in customFields) {
                // array[i] => value of the index
                // i => key of the index
                if (customFields[property] != null) {

                  //Cliente
                  if (property.includes("cf_categoria") && property.length === 12) {
                    cliente_value = customFields[property]
                    fieldsObtained.gotCliente = true;
                  }
                  //Produto
                  if (property.includes("cf_produtooperadora")) {
                    produtooperadora_value = customFields[property]
                    produtooperadora_key = property.replace(/\_1228746/g, '');
                    fieldsObtained.gotProduto = true;
                  }
                  //Categoria
                  else if (property.includes("cf_categoria") && property.length > 12) {
                    categoria_value = customFields[property]
                    categoria_key = property.replace(/\_1228746/g, '');
                    fieldsObtained.gotCategoria = true;
                  }
                  //Subcategoria
                  else if (property.includes("cf_subcategoria") || property.includes("cf_item")) {
                    subcategoria_value = customFields[property]
                    subcategoria_key = property.replace(/\_1228746/g, '');
                    fieldsObtained.gotSubcategoria = true;
                  }
                }
              }
            }
            // Verification to see if the client value from db is diffrent from the current client value
            // customFields["cf_categoria"] because the client value is on this attribute, I know that is stupid
            else if (searchedTimestamp.timestamp.client !== customFields["cf_categoria"]) {
              for (var prop in customFields) {

                let value = customFields[prop];
                let key = prop;

                // value cannot be null
                if (customFields[prop] !== null) {
                  console.log("Valor atual do iterator")
                  console.log(customFields[prop])

                  // CLIENTE -----------------------------------------------------
                  if (prop.includes("cf_categoria") && prop.length === 12) {
                    console.log("Antigo valor do cliente")
                    console.log(searchedTimestamp.timestamp.client)

                    cliente_value = customFields[prop];

                    console.log("Novo valor do cliente")
                    console.log(cliente_value)
                    fieldsObtained.gotCliente = true;
                  }

                  // PRODUTO/OPERATORA -------------------------------------------
                  if (prop.includes("cf_produtooperadora")) {

                    // verifies if the key is the same as the current iteration
                    // scenario 1: the iterator name is equal to the key
                    if (prop === searchedTimestamp.timestamp.keyProductOperator) {

                      console.log("valor e chave ATUAL do produto")
                      console.log(searchedTimestamp.timestamp.valueProductOperator)
                      console.log(searchedTimestamp.timestamp.keyProductOperator)

                      // verifies if the value is the same
                      // scenario 1.1: the value is the same, so it is the old value that
                      // needs to be deleted from the array
                      if (value === searchedTimestamp.timestamp.valueProductOperator) {
                        console.log(`valor nulo para ${customFields[prop]} no array`)
                        customFields[prop] = null;
                      }

                      // verifies if the value is different
                      // scenario 1.2: the value is different, so it is the new value that
                      // needs to be keeped on the array and updated on db
                      else if (value !== searchedTimestamp.timestamp.valueProductOperator) {
                        produtooperadora_value = value;

                        console.log("novo valor do produto")
                        console.log(produtooperadora_value)
                        wasUpdated = true;
                        fieldsObtained.gotProduto = true;
                      }
                    }

                    // if the key is different
                    // scenario 2: the key is different from the iterator, so the value and
                    // the key are new and they need to be updated
                    else {
                      if (customFields[prop] !== null) {

                        console.log("valor e chave ATUAL do produto")
                        console.log(searchedTimestamp.timestamp.valueProductOperator)
                        console.log(searchedTimestamp.timestamp.keyProductOperator)

                        // scenario 2.1: the value is the same, so just the key will be updated
                        if (value === searchedTimestamp.timestamp.valueProductOperator) {
                          produtooperadora_key = key;

                          console.log("nova chave do produto")
                          console.log(produtooperadora_key)

                          fieldsObtained.gotProduto = true;
                        }

                        // scenario 2.2: the value is different, so both value and key will be updated
                        else {
                          produtooperadora_value = value;
                          produtooperadora_key = key;

                          console.log("novo valor e chave do produto")
                          console.log(produtooperadora_value)
                          console.log(produtooperadora_key)
                          fieldsObtained.gotProduto = true;
                        }
                      }
                    }
                  }
                }

                // CATEGORIA -------------------------------------------
                if (prop.includes("cf_categoria") && prop.length > 12) {

                  // verifies if the key is the same as the current iteration
                  // scenario 1: the iterator name is equal to the key
                  if (prop === searchedTimestamp.timestamp.keyCategory) {
                    console.log("valor do iterator")

                    console.log("valor e chave ATUAL do categoria")
                    console.log(searchedTimestamp.timestamp.valueCategory)
                    console.log(searchedTimestamp.timestamp.keyCategory)

                    // verifies if the value is the same
                    // scenario 1.1: the value is the same, so it is the old value that
                    // needs to be deleted from the array
                    if (value === searchedTimestamp.timestamp.valueCategory) {
                      console.log(`valor nulo para ${customFields[prop]} no array`)
                      customFields[prop] = null;
                      console.log(customFields[prop])
                    }

                    // verifies if the value is different
                    // scenario 1.2: the value is different, so it is the new value that
                    // needs to be keeped on the array and updated on db
                    else if (value !== searchedTimestamp.timestamp.valueCategory) {
                      categoria_value = value;

                      console.log("novo valor do categoria")
                      console.log(categoria_value)
                      fieldsObtained.gotCategoria = true;
                    }
                  }

                  // if the key is different
                  // scenario 2: the key is different from the iterator, so the value and
                  // the key are new and they need to be updated
                  else {
                    if (customFields[prop] !== null) {

                      console.log("valor e chave ATUAL do categoria")
                      console.log(searchedTimestamp.timestamp.valueCategory)
                      console.log(searchedTimestamp.timestamp.keyCategory)

                      // scenario 2.1: the value is the same, so just the key will be updated
                      if (value === searchedTimestamp.timestamp.valueCategory) {
                        categoria_key = key;

                        console.log("nova chave do categoria")
                        console.log(categoria_key)

                        fieldsObtained.gotCategoria = true;
                      }

                      // scenario 2.2: the value is different, so both value and key will be updated
                      else {
                        categoria_value = value;
                        categoria_key = key;

                        console.log("novo valor e chave do categoria")
                        console.log(categoria_value)
                        console.log(categoria_key)
                        fieldsObtained.gotCategoria = true;
                      }
                    }
                  }
                }

                // SUBCATEGORIA -------------------------------------------
                if (prop.includes("cf_subcategoria") || prop.includes("cf_item")) {
                  // verifies if the key is the same as the current iteration
                  // scenario 1: the iterator name is equal to the key
                  if (prop === searchedTimestamp.timestamp.keySubCategory) {
                    console.log("valor do iterator")
                    let value = customFields[prop];

                    console.log("valor e chave ATUAL do subcategoria")
                    console.log(searchedTimestamp.timestamp.valueSubCategory)
                    console.log(searchedTimestamp.timestamp.keySubCategory)

                    // verifies if the value is the same
                    // scenario 1.1: the value is the same, so it is the old value that
                    // needs to be deleted from the array
                    if (value === searchedTimestamp.timestamp.valueSubCategory) {
                      console.log(`valor nulo para ${customFields[prop]} no array`)
                      customFields[prop] = null;
                      console.log(customFields[prop])
                    }

                    // verifies if the value is different
                    // scenario 1.2: the value is different, so it is the new value that
                    // needs to be keeped on the array and updated on db
                    else if (value !== searchedTimestamp.timestamp.valueSubCategory) {
                      subcategoria_value = value;

                      console.log("novo valor do categoria")
                      console.log(subcategoria_value)
                      fieldsObtained.gotSubcategoria = true;
                    }
                  }

                  // if the key is different
                  // scenario 2: the key is different from the iterator, so the value and
                  // the key are new and they need to be updated
                  else {
                    if (customFields[prop] !== null) {

                      let value = customFields[prop];
                      let key = prop;

                      console.log("valor e chave ATUAL do subcategoria")
                      console.log(searchedTimestamp.timestamp.valueSubCategory)
                      console.log(searchedTimestamp.timestamp.keySubCategory)

                      // scenario 2.1: the value is the same, so just the key will be updated
                      if (value === searchedTimestamp.timestamp.valueSubCategory) {
                        subcategoria_key = key;

                        console.log("nova chave do categoria")
                        console.log(subcategoria_key)

                        fieldsObtained.gotSubcategoria = true;
                      }

                      // scenario 2.2: the value is different, so both value and key will be updated
                      else {
                        subcategoria_value = value;
                        subcategoria_key = key;

                        console.log("novo valor e chave do subcategoria")
                        console.log(subcategoria_value)
                        console.log(subcategoria_key)
                        fieldsObtained.gotSubcategoria = true;
                      }
                    }
                  }
                }
              }
            }

            // if the client is the same
            // only the value is changed, the key doesnt need to be
            // but it's still needed to assign the value (old value) to the variable
            else {

              for (var prop in customFields) {
                console.log("Iterator key")
                console.log(prop)
                console.log("Key ProductOperator")
                console.log(searchedTimestamp.timestamp.keyProductOperator)
                console.log("Key Category")
                console.log(searchedTimestamp.timestamp.keyCategory)
                console.log("Key SubCategory")
                console.log(searchedTimestamp.timestamp.keySubCategory)

                let value = customFields[prop];

                if (prop === searchedTimestamp.timestamp.keyProductOperator) {
                  console.log("====================================================");
                  console.log("as chaves são iguais");
                  console.log("prop");
                  console.log(prop);
                  console.log("searchedTimestamp.timestamp.keyProductOperator");
                  console.log(searchedTimestamp.timestamp.keyProductOperator);

                  console.log(searchedTimestamp.timestamp.keyProductOperator)
                  if (customFields[prop] !== null) {

                    console.log("valores");
                    console.log("valor novo");
                    console.log(value);
                    console.log("valor antigo");
                    console.log(searchedTimestamp.timestamp.valueProductOperator);
                    if (value !== searchedTimestamp.timestamp.valueProductOperator) {
                      console.log("trocou o valor");
                      produtooperadora_value = value;
                      produtooperadora_key = prop;
                      fieldsObtained.gotProduto = true;
                      console.log(produtooperadora_value);
                    }
                    else {
                      produtooperadora_value = value;
                      produtooperadora_key = searchedTimestamp.timestamp.keyProductOperator;
                    }
                  }
                  console.log("====================================================")
                }

                if (prop === searchedTimestamp.timestamp.keyCategory) {
                  console.log("====================================================")
                  console.log("as chaves são iguais");
                  console.log("prop");
                  console.log(prop);
                  console.log("searchedTimestamp.timestamp.keyCategory");
                  console.log(searchedTimestamp.timestamp.keyCategory);

                  if (customFields[prop] !== null) {

                    console.log("valores");
                    console.log("valor novo");
                    console.log(value);
                    console.log("valor antigo");
                    console.log(searchedTimestamp.timestamp.valueCategory);

                    if (value !== searchedTimestamp.timestamp.valueCategory) {
                      console.log("trocou o valor");
                      categoria_value = value;
                      categoria_key = prop;
                      fieldsObtained.gotCategoria = true;
                      console.log(categoria_value);
                    }
                    else {
                      categoria_value = value;
                      categoria_key = searchedTimestamp.timestamp.keyCategory;
                    }
                  }
                  console.log("====================================================")
                }

                if (prop === searchedTimestamp.timestamp.keySubCategory) {
                  console.log("====================================================")
                  console.log("as chaves são iguais");
                  console.log("prop");
                  console.log(prop);
                  console.log("searchedTimestamp.timestamp.keySubCategory");
                  console.log(searchedTimestamp.timestamp.keySubCategory);

                  if (customFields[prop] !== null) {

                    console.log("valores");
                    console.log("valor novo");
                    console.log(value);
                    console.log("valor antigo");
                    console.log(searchedTimestamp.timestamp.valueSubCategory);

                    if (value !== searchedTimestamp.timestamp.valueSubCategory) {
                      console.log("trocou o valor");
                      subcategoria_value = value;
                      subcategoria_key = prop;
                      fieldsObtained.gotSubcategoria = true;
                      console.log(subcategoria_value);
                    }
                    else {
                      subcategoria_value = value;
                      subcategoria_key = searchedTimestamp.timestamp.keySubCategory;
                    }
                  }
                  console.log("====================================================")
                }

              }
            }
          }
          // else {

          //   //Object to validate if the fields has been assign a value
          //   let validFields = {
          //     clientValid: false,
          //     productValid: false,
          //     categoriaValid: false,
          //     subcategoriaValid: false
          //   }

          //   //FOR loop to assing value from the request to the respective variables
          //   for (var property in customFields) {
          //     if (customFields[property] != null) {
          //       if (property.includes("cf_categoria") && property.length === 12) {
          //         client = customFields[property];
          //         validFields.clientValid = true;
          //       }
          //       else if (property.includes("cf_produtooperadora")) {
          //         produtooperadora_value = customFields[property];
          //         produtooperadora_key = property;
          //         validFields.productValidValid = true;
          //       }
          //       else if (property.includes("cf_categoria") && property.length > 12) {
          //         categoria_value = customFields[property];
          //         categoria_key = property;
          //         validFields.categoriaValid = true;
          //       }
          //       else if (property.includes("cf_subcategoria") || property.includes("cf_item")) {
          //         subcategoria_value = customFields[property];
          //         subcategoria_key = property;
          //         validFields.subcategoriaValid = true;
          //       }
          //     }
          //   }

          //   if (Object.values(validFields).every(Boolean)) {

          //     const newTimestampRequest = {
          //       ticketId: id,
          //       client: client,
          //       valueProductOperator: produtooperadora_value,
          //       valueCategory: categoria_value,
          //       valueSubCategory: subcategoria_value,
          //       keyProductOperator: produtooperadora_key,
          //       keyCategory: categoria_key,
          //       keySubCategory: subcategoria_key
          //     };

          //     $request.post("https://dor-backend-production.azurewebsites.net/api/TimeStamp", newTimestampRequest)
          //       .then(() => {
          //         console.info("Registro do ticket concluído com sucesso.");
          //       },
          //         function (error) {
          //           console.error("Houve um erro ao finalizar o registro do ticket no banco de dados. " +
          //             error);
          //           console.error(error)
          //         });
          //   }
          // }

          console.log("FIM do método de atualização dos campos do ticket");
          console.log("------------------------------------------");

          if (Object.values(fieldsObtained).every(Boolean)) {

            newTimestampRequest = {
              ticketId: id,
              client: cliente_value,
              valueProductOperator: produtooperadora_value,
              valueCategory: categoria_value,
              valueSubCategory: subcategoria_value,
              keyProductOperator: produtooperadora_key,
              keyCategory: categoria_key,
              keySubCategory: subcategoria_key
            };

            console.log("Objeto com os novos campos do ticket");
            console.log(newTimestampRequest);

            newCustomFields = customFields;
            console.log(`objeto atulizado`);
            console.log(newCustomFields);
          }
        },
        function (error) {
          console.error("Houve um erro ao listar o ticket pelo ambiente freshdesk. ", error);
          console.log("Encerrando o update");
          console.log("__________________________________________");
          process.exit(1);
        });

    console.log(newTimestampRequest);
    const request = {
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newTimestampRequest)
    };

    console.log("PUT - Requisição para atualizar o timestamp");
    await $request.put(`https://dor-backend-production.azurewebsites.net/api/TimeStamp`, request)
      .then(
        function (data) {
          console.log("atualização do timestamp feita com sucesso, status code:  " + data.status);
        },
        function (error) {
          console.error("Houve um erro ao atualizar o timestamp", error);
          console.log("Encerrando o update")
          console.log("__________________________________________");
          process.exit(1);
        });

    //Request configuration that is responsible for sending the info to api .NET CORE
    const payload_updateCustomFields = {
      custom_fields: newCustomFields
    }

    const request_updateCustomFields = {
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload_updateCustomFields)
    };

    //method responsible for updating the ticket's custom field with only the new information
    console.log("PUT - Requisição para atualizar o ticket apenas com as novas informações");
    await $request.put(`https://dorconsultoria.freshdesk.com/api/v2/tickets/${id}`, request_updateCustomFields)
      .then(
        function (data) {
          console.log("Campos do ticket atualizado com sucesso, status code: " + data.status);
        },
        function (error) {
          console.error("Houve um erro ao atualizar custom field do ticket. ", error);
          console.log("Encerrando o update");
          console.log("__________________________________________");
          process.exit(1);
        });

    const payload_updateSLA = {
      client_: cliente_value,
      ProductOperator_: produtooperadora_value,
      Category_: categoria_value,
      SubCategory_: subcategoria_value
    }

    console.log(payload_updateSLA);

    const request_updateSLA = {
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload_updateSLA)
    };

    // request that verifies the object and return his respective sla
    console.log("POST - Requisição para buscar o SLA");
    await $request.post("https://dor-backend-production.azurewebsites.net/api/RelationshipRecord", request_updateSLA)
      .then(
        function (data_relationship) {
          relationshipObj = JSON.parse(data_relationship.response);
          console.log("O SLA foi obtido " + relationshipObj);

          slaObtained = true;
        },
        function (error) {
          console.error("Houve um erro ao obter o SLA do ticket. ", error);
          console.log("Encerrando o update");
          console.log("__________________________________________");
          process.exit(1);
        });

    console.log(slaObtained);
    console.log(relationshipObj);
    if (slaObtained) {
      //Call of the method responsible for returning the sla
      await UpdateSLA(relationshipObj, apiKey, id);
    }
    else {
      console.error("Não foi possível atualizar o ticket, pois ocorreu um erro na requisição que obtem o SLA")
      console.log("__________________________________________");
      process.exit(1);
    }

    console.log("Fim do OnUpdate");
    console.log("__________________________________________");
  }
};

async function UpdateSLA(obj, apiKey, id) {

  console.log("-------------------------------------------");
  console.log("Método para atualizar o ticket com o SLA");

  console.log("SLA " + obj.sla);

  let sla = obj.sla;

  const payload_sla = {
    type: sla
  };

  const request_sla = {
    headers: {
      "Authorization": "Basic " + apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload_sla)
  };

  console.log(`SLA a ser registrado: ${obj.sla}`);

  console.log("PUT - Requisição para atualizar o SLA");
  await $request.put(`https://dorconsultoria.freshdesk.com/api/v2/tickets/${id}`, request_sla)
    .then(
      function (data) {
        console.log(data.status);
        console.info("O ticket foi atualizado com sucesso.");
        console.log("-------------------------------------------");
        process.exit();
      },
      function (error) {
        console.error("Um erro ocorreu ao efetuar a requisição que atualiza o ticket. ", error);
        console.log("Encerrando a função");
        console.log("__________________________________________");
        process.exit(1);
      })
}