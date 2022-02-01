using ProjectDOr.Domains;
using System.Collections.Generic;

namespace ProjectDOr.Interfaces
{
    public interface ITimeStamp
    {
        //Method that lists all timeStamp registered in the database
        List<TimeStamp> ListAllTimeStamp();

        //method responsible for registering a ticket in the database
        bool RegisterTicket(TimeStamp newTicket);

        //method responsible for updating the ticket's custom fields
        TimeStampRequest UpdateTimeStamp(TimeStampRequest json);

        //Method that lists a timeStamp by ID
        TimeStamp SearchByTicketId(int ticketId);

        void UpdateTimestampDB(TimeStamp newTimeStamp);

    }
}
