using System;
using System.Collections.Generic;

//This class has the ticket information created. This class was created to be able to identify if there was any
//change to custom_fields after it is updated

namespace ProjectDOr.Domains
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
