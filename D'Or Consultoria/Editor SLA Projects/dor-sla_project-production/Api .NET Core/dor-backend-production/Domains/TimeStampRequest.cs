using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//This class was created to get all the custom JSON fields that come from the freshdesk api request

namespace dor_backend_production.Domains
{
    public class TimeStampRequest
    {
        public int ticketId { get; set; }
        public CustomFields customFields { get; set; }
    }

    public class CustomFields
    {
        public string cf_produtooperadora14817 { get; set; }
        public string cf_categoria6427 { get; set; }
        public string cf_subcategoria550702 { get; set; }
        public string cf_produtooperadora70533 { get; set; }
        public string cf_categoria736511 { get; set; }
        public string cf_subcategoria718942 { get; set; }
        public string cf_produtooperadora639209 { get; set; }
        public string cf_categoria454388 { get; set; }
        public string cf_subcategoria848735 { get; set; }
        public string cf_produtooperadora598393 { get; set; }
        public string cf_categoria943054 { get; set; }
        public string cf_subcategoria562429 { get; set; }
        public string cf_produtooperadora_manserv { get; set; }
        public string cf_categoria_manserv { get; set; }
        public string cf_item_manserv { get; set; }
        public string cf_categoria { get; set; }
        public string cf_produtooperadora { get; set; }
        public string cf_categoria834653 { get; set; }
        public string cf_subcategoria { get; set; }
        public string cf_produtooperadora_6429008 { get; set; }
        public string cf_categoria463091 { get; set; }
        public string cf_subcategoria528040 { get; set; }
    }
}
