using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Threading.Tasks;

//This class was created to compare fields with RelationshipRecords

namespace dor_backend_production.Domains
{
    public class RelationshipRecordResponseRequest
    {
        public string Client_ { get; set; }
        public string ProductOperator_ { get; set; }
        public string Category_ { get; set; }
        public string SubCategory_ { get; set; }
        public string Sla_ { get; set; }
    }

}
