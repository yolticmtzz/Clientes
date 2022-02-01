using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace dor_backend_production.ViewModels
{
    public class ImportViewModel
    {
        [Required]
        public IFormFile FilePath { get; set; }

        public ImportViewModel()
        {

        }
    }
}
