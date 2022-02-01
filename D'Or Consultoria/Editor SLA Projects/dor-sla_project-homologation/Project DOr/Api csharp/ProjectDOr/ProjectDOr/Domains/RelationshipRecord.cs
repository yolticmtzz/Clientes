using System;
using System.Collections.Generic;

//This class was created to get specific JSON data sent from freshdesk api

namespace ProjectDOr.Domains
{
    public class RelationshipRecord
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
