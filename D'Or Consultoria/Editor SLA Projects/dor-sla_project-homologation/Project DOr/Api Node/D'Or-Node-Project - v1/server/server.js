exports = {

  events: [
    { event: 'onTicketCreate', callback: 'onTicketCreateHandler' },
    { event: 'onTicketUpdate', callback: 'onTicketUpdateHandler' }
  ],

  onTicketCreateHandler: async function (args) {

    console.log("============================");
    console.log("Início do create")
    //Variables that take ticket information
    let custom_fields_create = args.data.ticket.custom_fields;
    // let client = args.data.ticket.custom_fields.cf_categoria_1228746;
    let client = args.data.ticket.custom_fields.cf_cliente_1586027;
    let id = args.data.ticket.id;
    let apiKey = args.iparams.api_key;

    //**===============================================================
    // * Variables that will have the value of the fields of the ticket
    // *===============================================================**
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

    // // deleting this field from the array so the iterator wont get the wrong data
    // // delete custom_fields_create["cf_cliente"];

    //for loop to assing value from the request to the respective variables
    console.log("Looping for para obter os valores dos campos do ticket")
    for (var property in custom_fields_create) {
      // array[i] => value of the index
      // i => key of the index
      if (custom_fields_create[property] != null) {

        //Produto
        if (property.includes("cf_produtooperadora")) {
          produtooperadora_value = custom_fields_create[property]
          produtooperadora_key = property.replace(/\_1586027/g, '');
          fieldsObtained.gotProduto = true;
        }
        //Categoria
        else if (property.includes("cf_categoria")) {
          categoria_value = custom_fields_create[property]
          categoria_key = property.replace(/\_1586027/g, '');
          fieldsObtained.gotCategoria = true;
        }
        //Subcategoria
        else if (property.includes("cf_subcategoria") || property.includes("cf_item")) {
          subcategoria_value = custom_fields_create[property]
          subcategoria_key = property.replace(/\_1586027/g, '');
          fieldsObtained.gotSubcategoria = true;
        }
      }
    }

    const payload_verifiesSLA = {
      Client_: client,
      ProductOperator_: produtooperadora_value,
      Category_: categoria_value,
      SubCategory_: subcategoria_value,
    }

    console.log("payload de verificacao do sla");
    console.log(payload_verifiesSLA)

    const request_verifiesSLA = {
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload_verifiesSLA)
    }

    // Verifies if all fields where obtained
    console.log("Verificando se foi obtido os valores dos campos do ticket");
    if (Object.values(fieldsObtained).every(Boolean)) {

      console.log("Campos obtidos");

      console.log("POST - Requisição para obter o SLA");
      await $request.post("https://dor-backend-homologation.azurewebsites.net/api/RelationshipRecord", request_verifiesSLA)
        .then(
          function (data_record) {
            //?  Is possible to pass the value of sla directly from the response?
            //?  Example: var sla = JSON.parse(data.response.type)
            recordObj = JSON.parse(data_record.response);

            console.log(`obj com o sla`);
            console.log(recordObj);

            slaObtained = true;

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
            $request.post("https://dor-backend-homologation.azurewebsites.net/api/TimeStamp", request_registerTimestamp)
              .then(
                function (data) {
                  console.log(data.status);
                  console.info("Registro do ticket concluído com sucesso.");
                },
                function (error) {
                  console.error("Houve um erro ao finalizar o registro do ticket no banco de dados. ", error);
                  console.log("Encerrando o create");
                  console.log("================================");
                  process.exit(1);
                }
              )
          },
          function (error) {
            console.error(`O erro abaixo ocorreu ao efetuar a requisição que retorna o sla, no ticket com id ${id}`);
            console.error(error);
            console.log("Encerrando o create");
            console.log("================================");
            process.exit(1);
          });
    }
    else {
      console.error("Falha ao buscar o SLA, pois um ou mais campos do ticket vieram vazios.");
      console.log("Encerrando o create");
      console.log("================================");
      process.exit(1);
    }

    if (slaObtained) {
      await UpdateSLA(recordObj, apiKey, id);
    }

    console.log("Encerrando o create");
    console.log("================================");
    process.exit();
  },

  onTicketUpdateHandler: async function (args) {

    console.log("================================");
    console.log("Início do update");

    // Auxialliary variables
    let id = args.data.ticket.id;
    let searchedTimestamp;
    let apiKey = args.iparams.api_key;
    let customFields;
    let statusCode;
    let relationshipObj;
    let slaObtained = false;

    if (apiKey !== null) {

      const request_getTicket = {
        headers: {
          "Authorization": "Basic " + apiKey,
          "Content-Type": "application/json"
        }
      };

      //Method responsible for listing freshdesk ticket
      //this is done so that we can get the attributes without _1228746
      console.log("GET - Requisição para obter os campos do ticket " + id);
      await $request.get(`https://extcare090.freshdesk.com/api/v2/tickets/${id}`, request_getTicket)
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
            console.log("================================");
            process.exit(1);
          });

      const options_ = {
        headers: {
          "Content-Type": "application/json"
        }
      };

      console.log("GET - Requisição para obter o timestamp do banco de dados");
      // if the timestamp is not found, an 404 error will happen, in this case a new timestamp will be created
      await $request.get(`https://dor-backend-homologation.azurewebsites.net/api/TimeStamp/${id}`, options_)
        .then(
          function (data) {
            searchedTimestamp = JSON.parse(data.response);

            console.log('Timestamp encontrado');
            console.log(searchedTimestamp);

            statusCode = data.status;
          },
          function (error) {
            statusCode = error.status;
            console.error("Houve um erro " + statusCode);
            console.log("continua");
          });
      console.log("aqui ÓOOÓOOÓÓÓÓOOÓÓOÓÓ")

      console.log(statusCode);
      if (statusCode == 404) {
        console.error("Timestamp não foi encontrado");
        console.log("Criando timestamp e realizando o retorno do SLA");

        let client;
        let produtooperadora_value;
        let produtooperadora_key;

        let categoria_value;
        let categoria_key;

        let subcategoria_value;
        let subcategoria_key;

        //Object to validate if the fields has been assign a value
        let validFields = {
          clientValid: false,
          productValid: false,
          categoriaValid: false,
          subcategoriaValid: false
        }

        //FOR loop to assing value from the request to the respective variables
        for (var property in customFields) {

          if (customFields[property] != null) {

            if (property.includes("cf_cliente")) {
              console.log("cliente");
              client = customFields[property];
              validFields.clientValid = true;
            }
            else if (property.includes("cf_produtooperadora")) {
              console.log("produtoOperadora encontrado")
              produtooperadora_value = customFields[property];
              produtooperadora_key = property;
              validFields.productValid = true;
            }
            else if (property.includes("cf_categoria") && property.length > 12) {
              console.log("categoria encontrado")
              categoria_value = customFields[property];
              categoria_key = property;
              validFields.categoriaValid = true;
            }
            else if (property.includes("cf_subcategoria") || property.includes("cf_item")) {
              console.log("subcategoria encontrado")
              subcategoria_value = customFields[property];
              subcategoria_key = property;
              validFields.subcategoriaValid = true;
            }
          }
        }

        console.log(validFields)

        console.log(client)
        console.log(produtooperadora_value)
        console.log(produtooperadora_key)
        console.log(categoria_value)
        console.log(categoria_key)
        console.log(subcategoria_value)
        console.log(subcategoria_key)

        if (Object.values(validFields).every(Boolean)) {

          const newTimestampRequest = {
            ticketId: id,
            client: client,
            valueProductOperator: produtooperadora_value,
            valueCategory: categoria_value,
            valueSubCategory: subcategoria_value,
            keyProductOperator: produtooperadora_key,
            keyCategory: categoria_key,
            keySubCategory: subcategoria_key
          };

          const payload_verifiesSLA = {
            Client_: client,
            ProductOperator_: produtooperadora_value,
            Category_: categoria_value,
            SubCategory_: subcategoria_value,
          }

          console.log(newTimestampRequest)
          console.log(payload_verifiesSLA)

          const sla_request = {
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload_verifiesSLA)
          }

          try {

            console.log("POST - Requisição para obter o SLA ");
            await $request.post("https://dor-backend-homologation.azurewebsites.net/api/RelationshipRecord", sla_request)
              .then((obj) => {
                relationshipObj = JSON.parse(obj.response);
                console.info("SLA do ticket buscado com sucesso.");

                slaObtained = true;

                const timestamp_request = {
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(newTimestampRequest)
                }

                console.log("POST - Requisição para cadastrar o timestamp no banco de dados");
                $request.post("https://dor-backend-homologation.azurewebsites.net/api/TimeStamp", timestamp_request)
                  .then(() => {
                    console.info("Registro do ticket concluído com sucesso.");
                  },
                    function (error) {
                      console.error("Houve um erro ao finalizar o registro do ticket no banco de dados. ",
                        error);
                      console.log("Encerrando o update")
                      console.log("================================");
                      process.exit(1);
                    });
              },
                function (error) {
                  console.error("Houve um erro ao buscar o SLA do ticket no banco de dados. ",
                    error);
                  console.log("Encerrando o update")
                  console.log("================================");
                  process.exit(1);
                });

          } catch (error) {
            console.log("Houve erro em uma das requisições", error);
            console.log("Encerrando o update")
            console.log("================================");
            process.exit(1);
          }

          if (slaObtained) {
            await UpdateSLA(relationshipObj, apiKey, id);
          }

          process.exit();
        }
      }

      //**================================================================================================
      // *                                         NORMAL UPDATE
      // *================================================================================================**/
      // When the request to get the timestamp is successful
      else if (statusCode == 200) {
        console.log("Status code 200");

        // // To obtain the SLA
        // let payload_updateSLA;
        // let request_updateSLA;

        // To be used to update ticket and timestamp
        let newTimestampRequest;
        let newCustomFields;

        // To assign value of the ticket
        let produtooperadora_value;
        let produtooperadora_key;
        let categoria_value;
        let categoria_key;
        let subcategoria_value;
        let subcategoria_key;

        const request_getTicket = {
          headers: {
            "Authorization": apiKey,
            "Content-Type": "application/json"
          }
        };

        console.log("GET - Requisição para obter os campos do ticket " + id);
        //Method responsible for listing freshdesk ticket
        //this is done so that we can get the attributes without _1228746
        await $request.get(`https://extcare090.freshdesk.com/api/v2/tickets/${id}`, request_getTicket)
          .then(
            function (data_customfields) {

              //getting data from the ticket
              let ticketObj = JSON.parse(data_customfields.response);
              console.log(ticketObj)
              let customFields = ticketObj.custom_fields;
              delete customFields["cf_descrio"];

              let wasUpdated = false;

              console.log("------------------------------------------");
              console.log("Método de atualização dos campos do ticket");
              // When a ticket is updated with different values (manily with different clients), the old valiu
              // This method is necessary to delete the old values of the custom fields, if not done, it isn't possible to obtain the SLA

              console.log("Campos do ticket atual");
              console.log(customFields);

              console.log("Campos do ticket antigo");
              console.log(searchedTimestamp)

              if (searchedTimestamp !== null) {

                // If the client has changed
                if (searchedTimestamp.timestamp.client !== customFields["cf_cliente"]) {
                  for (var prop in customFields) {
                    console.log("Cliente é diferente")
                    // value canot be null
                    if (customFields[prop] !== null) {
                      console.log("valor do iterator")
                      console.log(customFields[prop])

                      if (prop.includes("cf_cliente")) {
                        console.log("atual valor do cliente")
                        console.log(searchedTimestamp.timestamp.client)

                        searchedTimestamp.timestamp.client = customFields[prop];

                        console.log("novo valor do cliente")
                        console.log(searchedTimestamp.timestamp.client)
                      }

                      // PRODUTO/OPERATORA -------------------------------------------
                      if (prop.includes("cf_produtooperadora")) {
                        if (prop === searchedTimestamp.timestamp.keyProductOperator) {
                          let value = customFields[prop];

                          console.log("valor e chave ATUAL do produto")
                          console.log(searchedTimestamp.timestamp.valueProductOperator)
                          console.log(searchedTimestamp.timestamp.keyProductOperator)

                          if (value === searchedTimestamp.timestamp.valueProductOperator) {
                            console.log(`valor nulo para ${customFields[prop]} no array`)
                            customFields[prop] = null;
                            console.log(customFields[prop])
                          }

                          else if (value !== searchedTimestamp.timestamp.valueProductOperator) {
                            produtooperadora_value = value;

                            console.log("novo valor do produto")
                            console.log(produtooperadora_value)
                            wasUpdated = true;
                          }
                        }

                        else {
                          if (customFields[prop] !== null) {
                            let value = customFields[prop];
                            let key = prop;

                            console.log("valor e chave ATUAL do produto")
                            console.log(searchedTimestamp.timestamp.valueProductOperator)
                            console.log(searchedTimestamp.timestamp.keyProductOperator)

                            if (value === searchedTimestamp.timestamp.valueProductOperator) {
                              produtooperadora_key = key;

                              console.log("nova chave do produto")
                              console.log(produtooperadora_key)

                              wasUpdated = true;
                            }

                            else {
                              produtooperadora_value = value;
                              produtooperadora_key = key;

                              console.log("novo valor e chave do produto")
                              console.log(produtooperadora_value)
                              console.log(produtooperadora_key)
                              wasUpdated = true;
                            }
                          }
                        }
                      }
                    }

                    // CATEGORIA -------------------------------------------
                    if (prop.includes("cf_categoria")) {
                      if (prop === searchedTimestamp.timestamp.keyCategory) {
                        console.log("valor do iterator")
                        let value = customFields[prop];

                        console.log("valor e chave ATUAL do categoria")
                        console.log(searchedTimestamp.timestamp.valueCategory)
                        console.log(searchedTimestamp.timestamp.keyCategory)

                        if (value === searchedTimestamp.timestamp.valueCategory) {
                          console.log(`valor nulo para ${customFields[prop]} no array`)
                          customFields[prop] = null;
                          console.log(customFields[prop])
                        }

                        else if (value !== searchedTimestamp.timestamp.valueCategory) {
                          categoria_value = value;

                          console.log("novo valor do categoria")
                          console.log(categoria_value)
                          wasUpdated = true;
                        }
                      }

                      else {
                        if (customFields[prop] !== null) {

                          console.log("valor e chave ATUAL do categoria")
                          console.log(searchedTimestamp.timestamp.valueCategory)
                          console.log(searchedTimestamp.timestamp.keyCategory)

                          let value = customFields[prop];
                          let key = prop;

                          if (value === searchedTimestamp.timestamp.valueCategory) {
                            categoria_key = key;

                            console.log("nova chave do categoria")
                            console.log(categoria_key)

                            wasUpdated = true;
                          }

                          else {
                            categoria_value = value;
                            categoria_key = key;

                            console.log("novo valor e chave do categoria")
                            console.log(categoria_value)
                            console.log(categoria_key)
                            wasUpdated = true;
                          }
                        }
                      }
                    }

                    // SUBCATEGORIA -------------------------------------------
                    if (prop.includes("cf_subcategoria")) {
                      if (prop === searchedTimestamp.timestamp.keySubCategory) {
                        console.log("valor do iterator")
                        let value = customFields[prop];

                        console.log("valor e chave ATUAL do subcategoria")
                        console.log(searchedTimestamp.timestamp.valueSubCategory)
                        console.log(searchedTimestamp.timestamp.keySubCategory)

                        if (value === searchedTimestamp.timestamp.valueSubCategory) {
                          console.log(`valor nulo para ${customFields[prop]} no array`)
                          customFields[prop] = null;
                          console.log(customFields[prop])
                        }

                        else if (value !== searchedTimestamp.timestamp.valueSubCategory) {
                          subcategoria_value = value;

                          console.log("novo valor do categoria")
                          console.log(subcategoria_value)
                          wasUpdated = true;
                        }
                      }

                      else {
                        if (customFields[prop] !== null) {

                          let value = customFields[prop];
                          let key = prop;

                          console.log("valor e chave ATUAL do subcategoria")
                          console.log(searchedTimestamp.timestamp.valueSubCategory)
                          console.log(searchedTimestamp.timestamp.keySubCategory)

                          if (value === searchedTimestamp.timestamp.valueSubCategory) {
                            subcategoria_key = key;

                            console.log("nova chave do categoria")
                            console.log(subcategoria_key)

                            wasUpdated = true;
                          }

                          else {
                            subcategoria_value = value;
                            subcategoria_key = key;

                            console.log("novo valor e chave do subcategoria")
                            console.log(subcategoria_value)
                            console.log(subcategoria_key)
                            wasUpdated = true;
                          }
                        }
                      }
                    }
                  }
                }

                // If the cliente is the same
                else {

                  console.log("Cliente é o mesmo");
                  for (var prop in customFields) {
                    if (prop === searchedTimestamp.timestamp.keyProductOperator) {
                      console.log("====================================================")
                      console.log("Chaves")
                      console.log("Key atual")
                      console.log(prop)
                      console.log("Key antiga")
                      console.log(searchedTimestamp.timestamp.keyProductOperator)

                      console.log(searchedTimestamp.timestamp.keyProductOperator)
                      if (customFields[prop] !== null) {
                        let value = customFields[prop];

                        console.log("valores")
                        console.log("valor novo")
                        console.log(value)
                        console.log("valor antigo")
                        console.log(searchedTimestamp.timestamp.valueProductOperator)
                        if (value !== searchedTimestamp.timestamp.valueProductOperator) {
                          console.log("trocou o valor")
                          produtooperadora_value = value;
                          wasUpdated = true;
                          console.log(produtooperadora_value)
                        }
                        //needs to handle exception
                      }
                      console.log("====================================================")
                    }

                    if (prop === searchedTimestamp.timestamp.keyCategory) {
                      console.log("====================================================")
                      console.log("Chaves")
                      console.log("Key atual")
                      console.log(prop)
                      console.log("Key antiga")
                      console.log(searchedTimestamp.timestamp.keyCategory)

                      if (customFields[prop] !== null) {
                        let value = customFields[prop];

                        console.log("valores")
                        console.log("valor novo")
                        console.log(value)
                        console.log("valor antigo")
                        console.log(searchedTimestamp.timestamp.valueCategory)

                        if (value !== searchedTimestamp.timestamp.valueCategory) {
                          console.log("trocou o valor")
                          categoria_value = value;
                          wasUpdated = true;
                          console.log(categoria_value)

                        }
                        //needs to handle exception
                      }
                      console.log("====================================================")
                    }

                    if (prop === searchedTimestamp.timestamp.keySubCategory) {
                      console.log("====================================================")
                      console.log("Chaves")
                      console.log("Key atual")
                      console.log(prop)
                      console.log("Key antiga")
                      console.log(searchedTimestamp.timestamp.keySubCategory)

                      if (customFields[prop] !== null) {
                        let value = customFields[prop];

                        console.log("valores")
                        console.log("valor novo")
                        console.log(value)
                        console.log("valor antigo")
                        console.log(searchedTimestamp.timestamp.valueSubCategory)

                        if (value !== searchedTimestamp.timestamp.valueSubCategory) {
                          console.log("trocou o valor")
                          subcategoria_value = value;
                          wasUpdated = true;
                          console.log(subcategoria_value)
                        }
                        //needs to handle exception
                      }
                      //needs to handle exception
                      console.log("====================================================")
                    }

                  }
                }
              }

              console.log("FIM do método de atualização dos campos do ticket");
              console.log("------------------------------------------");

              if (wasUpdated === true) {

                newTimestampRequest = {
                  ticketId: id,
                  client: searchedTimestamp.timestamp.client,
                  valueProductOperator: produtooperadora_value,
                  valueCategory: categoria_value,
                  valueSubCategory: subcategoria_value,
                  keyProductOperator: produtooperadora_key,
                  keyCategory: categoria_key,
                  keySubCategory: subcategoria_key
                }

                console.log("Objeto com os novos campos do ticket");
                console.log(newTimestampRequest)

                newCustomFields = customFields;

                console.log(`Campos do ticket atulizado`);
                console.log(newCustomFields)
                delete newCustomFields["cf_descrio"]
              }
            },
            function (error) {
              console.error("Houve um erro ao listar o ticket pelo ambiente freshdesk. ", error);
              console.log("Encerrando o update");
              console.log("================================");
              process.exit(1);
            });

        const request = {
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(newTimestampRequest)
        };

        console.log("PUT - Requisição para atualizar o timestamp");
        await $request.put("https://dor-backend-homologation.azurewebsites.net/api/TimeStamp", request)
          .then(
            function (data) {
              console.log("atualização do timestamp feita com sucesso, status code:  " + data.status);
            },

            function (error) {
              console.error("Houve um erro ao atualizar o timestamp", error);
              console.log("Encerrando o update")
              console.log("================================");
              process.exit(1);
            });

        //Request configuration that is responsible for sending the info to api .NET CORE
        const payload_updateCustomFields = {
          custom_fields: newCustomFields
        };

        const request_updateCustomFields = {
          headers: {
            "Authorization": apiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload_updateCustomFields)
        };

        //method responsible for updating the ticket's custom field with only the new information
        console.log("PUT - Requisição para atualizar o ticket apenas com as novas informações");
        await $request.put(`https://extcare090.freshdesk.com/api/v2/tickets/${id}`, request_updateCustomFields)
          .then(
            function (data) {
              console.log("Campos do ticket atualizado com sucesso, status code: " + data.status);
            },
            function (error) {
              console.error("Houve um erro ao atualizar custom field do ticket. ", error);
              console.log("Encerrando o update");
              console.log("================================");
              process.exit(1);
            });

        let payload_updateSLA = {
          client_: searchedTimestamp.timestamp.client,
          ProductOperator_: produtooperadora_value,
          Category_: categoria_value,
          SubCategory_: subcategoria_value
        }

        let request_updateSLA = {
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload_updateSLA)
        }

        console.log("POST - Requisição para buscar o SLA");
        // request that verifies the object and return his respective sla 
        await $request.post("https://dor-backend-homologation.azurewebsites.net/api/RelationshipRecord", request_updateSLA)
          .then(
            function (data_relationship) {
              relationshipObj = JSON.parse(data_relationship.response);

              slaObtained = true;
            },

            function (error) {
              console.error("Houve um erro ao obter o SLA do ticket. ", error);
              console.log("Encerrando o update");
              console.log("================================");
              process.exit(1);
            });

        console.log(slaObtained);
        if (slaObtained) {
          //Call of the method responsible for returning the sla
          await UpdateSLA(relationshipObj, apiKey, id);
        }

        else {
          console.error("Não foi possível atualizar o ticket, pois ocorreu um erro na requisição que obtem o SLA")
          console.log("================================")
          process.exit(1);
        }

      }
      else {
        console.log("Houve um erro inesperado");
        console.log("================================")
        process.exit(1);
      }
    }
    else {
      console.log("Não foi possível obter a chave da api do freshdesk")
      process.exit(1);
    }
  }
}

async function UpdateSLA(obj, apiKey, id) {

  console.log("--------------------------");
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

  console.log(request_sla);

  // try {
  console.log("PUT - Requisição para atualizar o SLA");
  await $request.put(`https://extcare090.freshdesk.com/api/v2/tickets/${id}`, request_sla)
    .then(
      function (data) {
        console.log(data.status);
        console.info("O ticket foi atualizado com sucesso.");
        console.log("--------------------------");
        process.exit();
      },
      function (error) {
        console.error("Um erro ocorreu ao efetuar a requisição que atualiza o ticket. ", error);
        console.log("Encerrando a função");
        console.log("================================");
        process.exit(1);
      })
  // } catch (error) {
  //   console.error("Houve um erro inesperado ao atualizar o ticket com SLA")
  // }
}