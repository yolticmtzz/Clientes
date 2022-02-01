using dor_backend_production.Domains;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace dor_backend_production.Interfaces
{
    interface ITimeStampRepository
    {
        //Method that lists all timeStamp registered in the database
        List<TimeStamp> ListAllTimeStamp();

        //method responsible for registering a ticket in the database
        bool RegisterTicket(TimeStamp newTicket);

        //method responsible for updating the ticket's custom fields
        TimeStampRequest UpdateTimeStamp(TimeStampRequest newRequest);

        //Method that lists a timeStamp by ID
        TimeStamp SearchByTicketId(int ticketId);

        void UpdateTimestampDB(TimeStamp newTimeStamp);
    }
}
