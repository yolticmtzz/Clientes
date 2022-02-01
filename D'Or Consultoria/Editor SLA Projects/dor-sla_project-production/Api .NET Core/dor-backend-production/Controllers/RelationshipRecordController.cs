using dor_backend_production.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NPOI.SS.UserModel;
using dor_backend_production.Domains;
using dor_backend_production.Interfaces;
using dor_backend_production.Repositories;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.IO;
using System.Net.Http;

namespace dor_backend_production.Controllers
{
    [Produces("application/json")]

    [Route("api/[controller]")]

    [ApiController]
    public class RelationshipRecordController : ControllerBase
    {
        IRelationshipRecord _relationshipRecord;

        public RelationshipRecordController()
        {
            _relationshipRecord = new RelationshipRecordRepository();
        }

        private static readonly HttpClient http = new HttpClient();

        /// <summary>
        /// Lists all relationship Record
        /// </summary>
        /// <returns>A list of relationship Record and a status code 200 - ok</returns>
        /// <response code="200">Returns a list of relationship Record</response>
        /// <response code="400">Returns the generated error</response>
        [HttpGet]
        public IActionResult ListAllRelationshipRecord()
        {
            try
            {
                return Ok(_relationshipRecord.ListAllRelationshipRecords());
            }
            catch (Exception error)
            {
                return BadRequest(error);
            }
        }

        /// <summary>
        /// Import data from excel table
        /// </summary>
        /// <param name="file">variable that contains the path of the file</param>
        /// <returns>return status code 200 OK or 400 BadRequest</returns>
        /// <response code="200">Returns a list of categories</response>
        /// <response code="400">Returns the generated error</response>
        [HttpPost("import-sheet-string")]
        public async Task<IActionResult> ImportContractsSheetString([FromForm] ImportViewModel file)
        {
            try
            {
                IWorkbook excel = WorkbookFactory.Create(file.FilePath.OpenReadStream());

                ISheet tableRelationship = excel.GetSheet("SLA");

                if (tableRelationship == null)
                    return StatusCode(404, "A tabela Relationship não foi encontrada!");

                // Pega o index da primeira linha (Titulos) dessa tabela
                int firstRowIndexTitle = tableRelationship.FirstRowNum;

                // Pega o index da seguna linha (1° Registro) dessa tabela
                int secondRowIndex = (tableRelationship.FirstRowNum + 1);

                // Pega o index da ultima linha (Ultimo Registro) dessa tabela
                int lastRowIndex = tableRelationship.LastRowNum;

                ICell Clients = null;
                ICell ProductOperators = null;
                ICell Categories = null;
                ICell SubCategories = null;
                ICell SLAS = null;

                IRow titleRows = tableRelationship.GetRow(firstRowIndexTitle);

                foreach (ICell cell in titleRows.Cells)
                {
                    switch (cell.StringCellValue)
                    {
                        case "Cliente":
                            Clients = cell;
                            break;
                        case "ProdutoOperadora":
                            ProductOperators = cell;
                            break;
                        case "Categoria":
                            Categories = cell;
                            break;
                        case "Subcategoria":
                            SubCategories = cell;
                            break;
                        case "SLAPadrao":
                            SLAS = cell;
                            break;
                        default:
                            break;
                    }
                }

                string Client = "";
                string ProductOperator = "";
                string Category = "";
                string Subcategory = "";
                string Sla = "";

                List<RelationshipRecord> newRelationships = new List<RelationshipRecord>();

                for (int rowNum = secondRowIndex; rowNum <= lastRowIndex; rowNum++)
                {
                    RelationshipRecord relationShipAddDb = null;

                    //Recupera a linha atual
                    IRow linha = tableRelationship.GetRow(rowNum);

                    if (linha == null)
                    {
                        goto Exit;
                    }
                    foreach (ICell cell in linha.Cells)
                    {

                        if (cell.ColumnIndex == Clients.ColumnIndex)
                            Client = cell.StringCellValue;

                        if (cell.ColumnIndex == ProductOperators.ColumnIndex)
                            ProductOperator = cell.StringCellValue;

                        if (cell.ColumnIndex == Categories.ColumnIndex)
                            Category = cell.StringCellValue;

                        if (cell.ColumnIndex == SubCategories.ColumnIndex)
                            Subcategory = cell.StringCellValue;

                        if (cell.ColumnIndex == SLAS.ColumnIndex)
                            Sla = cell.StringCellValue;
                    }

                    relationShipAddDb = new RelationshipRecord()
                    {
                        Client = Client,
                        ProductOperator = ProductOperator,
                        Category = Category,
                        Subcategory = Subcategory,
                        Sla = Sla,
                        Active = true
                    };
                    newRelationships.Add(relationShipAddDb);
                }
            Exit:
                var response = _relationshipRecord.CreateRelationshipRecordsRange(newRelationships);

                return StatusCode(200);
            }
            catch (Exception e)
            {
                return BadRequest(e);
            }
        }

        /// <summary>
        /// Import data from excel table
        /// </summary>
        /// <param name="file">variable that contains the path of the file</param>
        /// <returns>return status code 200 OK or 400 BadRequest</returns>
        /// <response code="200">Returns a list of categories</response>
        /// <response code="400">Returns the generated error</response>
        [HttpPost("import-sheet-number")]
        public async Task<IActionResult> ImportContractsSheetNumber([FromForm] ImportViewModel file)
        {
            try
            {
                IWorkbook excel = WorkbookFactory.Create(file.FilePath.OpenReadStream());

                ISheet tableRelationship = excel.GetSheet("SLA");

                if (tableRelationship == null)
                    return StatusCode(404, "A tabela Relationship não foi encontrada!");

                // Pega o index da primeira linha (Titulos) dessa tabela
                int firstRowIndexTitle = tableRelationship.FirstRowNum;

                // Pega o index da seguna linha (1° Registro) dessa tabela
                int secondRowIndex = (tableRelationship.FirstRowNum + 1);

                // Pega o index da ultima linha (Ultimo Registro) dessa tabela
                int lastRowIndex = tableRelationship.LastRowNum;

                ICell Clients = null;
                ICell ProductOperators = null;
                ICell Categories = null;
                ICell SubCategories = null;
                ICell SLAS = null;

                IRow titleRows = tableRelationship.GetRow(firstRowIndexTitle);

                foreach (ICell cell in titleRows.Cells)
                {
                    switch (cell.StringCellValue)
                    {
                        case "Cliente":
                            Clients = cell;
                            break;
                        case "ProdutoOperadora":
                            ProductOperators = cell;
                            break;
                        case "Categoria":
                            Categories = cell;
                            break;
                        case "Subcategoria":
                            SubCategories = cell;
                            break;
                        case "SLAPadrao":
                            SLAS = cell;
                            break;
                        default:
                            break;
                    }
                }

                string Client = "";
                string ProductOperator = "";
                string Category = "";
                string Subcategory = "";
                string Sla = "";

                List<RelationshipRecord> newRelationships = new List<RelationshipRecord>();

                for (int rowNum = secondRowIndex; rowNum <= lastRowIndex; rowNum++)
                {
                    RelationshipRecord relationShipAddDb = null;

                    //Recupera a linha atual
                    IRow linha = tableRelationship.GetRow(rowNum);

                    if (linha == null)
                    {
                        goto Exit;
                    }
                    foreach (ICell cell in linha.Cells)
                    {

                        if (cell.ColumnIndex == Clients.ColumnIndex)
                            Client = cell.StringCellValue;

                        if (cell.ColumnIndex == ProductOperators.ColumnIndex)
                            ProductOperator = cell.StringCellValue;

                        if (cell.ColumnIndex == Categories.ColumnIndex)
                            Category = cell.StringCellValue;

                        if (cell.ColumnIndex == SubCategories.ColumnIndex)
                            Subcategory = cell.StringCellValue;

                        if (cell.ColumnIndex == SLAS.ColumnIndex)
                            Sla = cell.NumericCellValue.ToString();
                    }

                    relationShipAddDb = new RelationshipRecord()
                    {
                        Client = Client,
                        ProductOperator = ProductOperator,
                        Category = Category,
                        Subcategory = Subcategory,
                        Sla = Sla,
                        Active = true
                    };
                    newRelationships.Add(relationShipAddDb);
                }
            Exit:
                var response = _relationshipRecord.CreateRelationshipRecordsRange(newRelationships);

                return StatusCode(200);
            }
            catch (Exception e)
            {
                return BadRequest(e);
            }
        }

        /// <summary>
        /// Method responsible for receiving the request from api Node and adding the correct value in the SLA field
        /// </summary>
        /// <param name="req"></param>
        /// <returns></returns>
        /// <response code="200">Returns Ok success</response>
        /// <response code="404">Returns an error message</response> 
        [HttpPost]
        public async Task<IActionResult> Post(RelationshipRecordResponseRequest req)
        {
            var response = new RelationshipRecord(req.Client_ , req.ProductOperator_, req.Category_, req.SubCategory_);

            RelationshipRecord searchedRelationship = _relationshipRecord.getByTicket(response);

            if (searchedRelationship != null)
            {
                return Ok(searchedRelationship);
            }
            else
            {
                return NotFound("Não foi encontrado nenhum sla com essas informações");
            }
        }

        /// <summary>
        /// Method responsible for encoding the fresh api key in base64
        /// </summary>
        /// <param name="api_key"></param>
        /// <returns></returns>
        /// <response code="200">Returns Ok success</response>
        /// <response code="400">Returns the generated error</response> 
        [HttpPost("enconder/{api_key}")]
        public IActionResult Encoder(string api_key)
        {
            try
            {
                var api_keyBytes = System.Text.Encoding.UTF8.GetBytes(api_key);

                return Ok(System.Convert.ToBase64String(api_keyBytes));
            }
            catch (Exception e)
            {
                return BadRequest(e);
            }
        }
    }
}
