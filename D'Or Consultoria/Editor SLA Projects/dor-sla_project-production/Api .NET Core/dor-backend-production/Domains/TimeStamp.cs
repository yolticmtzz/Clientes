using System;
using System.Collections.Generic;

// Code scaffolded by EF Core assumes nullable reference types (NRTs) are not used or disabled.
// If you have enabled NRTs for your project, then un-comment the following line:
// #nullable disable

namespace dor_backend_production.Domains
{
    public partial class TimeStamp
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public string Client { get; set; }
        public string ValueProductOperator { get; set; }
        public string ValueCategory { get; set; }
        public string ValueSubCategory { get; set; }
        public string KeyProductOperator { get; set; }
        public string KeyCategory { get; set; }
        public string KeySubCategory { get; set; }
    }
}
