using System;
using System.Collections.Generic;

// Code scaffolded by EF Core assumes nullable reference types (NRTs) are not used or disabled.
// If you have enabled NRTs for your project, then un-comment the following line:
// #nullable disable

namespace dor_backend_production.Domains
{
    public partial class RelationshipRecord
    {
        public int Id { get; set; }
        public string Client { get; set; }
        public string ProductOperator { get; set; }
        public string Category { get; set; }
        public string Subcategory { get; set; }
        public string Sla { get; set; }
        public bool Active { get; set; }

        public RelationshipRecord(string client, string productOperator, string category, string subcategory)
        {
            Client = client;
            ProductOperator = productOperator;
            Category = category;
            Subcategory = subcategory;
        }

        public RelationshipRecord()
        {

        }
    }
}
