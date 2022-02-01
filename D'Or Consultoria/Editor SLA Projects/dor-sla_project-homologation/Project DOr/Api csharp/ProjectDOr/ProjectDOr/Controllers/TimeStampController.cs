using Microsoft.AspNetCore.Mvc;
using ProjectDOr.Domains;
using ProjectDOr.Interfaces;
using ProjectDOr.Repositories;
using System;

namespace ProjectDOr.Controllers
{
    [Produces("application/json")]

    [Route("api/[controller]")]

    [ApiController]
    public class TimeStampController : ControllerBase
    {
        public readonly ITimeStamp _timeStamp;

        public TimeStampController()
        {
            _timeStamp = new TimeStampRepository();
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
                return Ok(_timeStamp.ListAllTimeStamp());
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
                TimeStamp newTimeStamp = _timeStamp.SearchByTicketId(id);

                if (newTimeStamp != null)
                {
                    return Ok(new
                    {
                        timestamp = newTimeStamp
                    });
                }
                else
                {
                    return NotFound();
                }
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
        public IActionResult RegisterTicketInBank(TimeStamp newTicket)
        {
            try
            {
                bool wasCreated = _timeStamp.RegisterTicket(newTicket);

                if(wasCreated == true)
                {
                    return StatusCode(201, "O ticket foi criado com sucesso!");
                }
                else
                {
                    return StatusCode(202, "O ticket não foi criado, pois o id do ticket já existe!");
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
        /// <returns>one status code 200 - OK</returns>
        /// <response code="200">Returns only the Ok status code</response>
        /// <response code="400">Returns the generated error</response>
        [NonAction]
        public IActionResult UpdateTimeStamp([FromBody] TimeStampRequest timeStampRequest)
        {
            try
            {
                TimeStampRequest updatedTimeStamp = _timeStamp.UpdateTimeStamp(timeStampRequest);

                return Ok(updatedTimeStamp);

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
                _timeStamp.UpdateTimestampDB(newRequest);

                return Ok("O registro do ticket foi atualizado com sucesso!");

            }
            catch (Exception error)
            {
                return BadRequest(error);
            }
        }
    }
}
