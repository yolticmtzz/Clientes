using dor_backend_production.Domains;
using dor_backend_production.Interfaces;
using dor_backend_production.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace dor_backend_production.Controllers
{
    [Produces("application/json")]

    [Route("api/[controller]")]

    [ApiController]
    public class TimeStampController : ControllerBase
    {
        ITimeStampRepository _timeStampRepository;

        public TimeStampController()
        {
            _timeStampRepository = new TimeStampRepository();
        }

        /// <summary>
        /// Lists all time stamp
        /// </summary>
        /// <returns>A list of time stamp and a status code 200 - ok</returns>
        /// <response code="200">Returns a list of categories</response>
        /// <response code="400">Returns the generated error</response>
        [HttpGet]
        public IActionResult ListAllTimeStamp()
        {
            try
            {
                return Ok(_timeStampRepository.ListAllTimeStamp());
            }
            catch (Exception error)
            {
                return BadRequest(error);
            }
        }

        [HttpGet("{id}")]
        public IActionResult ListTimeStampByTicketId(int id)
        {
            try
            {
                TimeStamp newTimeStamp = _timeStampRepository.SearchByTicketId(id);

                return Ok(new
                {
                    timestamp = newTimeStamp
                });
            }
            catch (Exception e)
            {
                return BadRequest(e);
            }
        }

        /// <summary>
        /// Create a new ticket in bank 
        /// </summary>
        /// <param name="newTicket">Object with information</param>
        /// <returns>one status code 201 - Created</returns>
        /// <response code="201">Returns only the Created status code</response>
        /// <response code="400">Returns the generated error</response>
        [HttpPost]
        public IActionResult RegisterTicket(TimeStamp newTicket)
        {
            try
            {
                bool wasCreated = _timeStampRepository.RegisterTicket(newTicket);

                if (wasCreated == true)
                {
                    return StatusCode(201, "O ticket foi criado com sucesso!");
                }
                else
                {
                    return StatusCode(202, "O ticket não foi criado, pois o id do ticket já existe ou não existe!");
                }

            }
            catch (Exception error)
            {
                return BadRequest(error);
            }
        }

        /// <summary>
        /// Update a ticket
        /// </summary>
        /// <param name="newRequest">Object with information</param>
        /// <returns>one status code 200 - OK</returns>
        /// <response code="200">Returns only the Ok status code</response>
        /// <response code="400">Returns the generated error</response>
        [NonAction]
        public IActionResult UpdateTimeStamp(TimeStampRequest newRequest)
        {
            try
            {
                TimeStampRequest newTimeStampRequest = _timeStampRepository.UpdateTimeStamp(newRequest);

                return Ok(new
                {
                    jsonRequest = newTimeStampRequest
                });

            }
            catch (Exception error)
            {
                return BadRequest(error);
            }
        }

        [HttpPut]
        public IActionResult UpdateTimeStampDB(TimeStamp newRequest)
        {
            try
            {
                _timeStampRepository.UpdateTimestampDB(newRequest);

                return Ok("O registro do ticket foi atualizado com sucesso!");

            }
            catch (Exception error)
            {
                return BadRequest(error);
            }
        }
    }
}
