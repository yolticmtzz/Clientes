using Microsoft.AspNetCore.Mvc;
using ProjectDOr.Domains;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectDOr.Interfaces
{
    interface IRelationshipRecord
    {
        //Method that lists all relationshipRecords registered in the database
        List<RelationshipRecord> ListAllRelationshipRecords();

        //Method that lists a relationshipRecord by ID
        RelationshipRecord getByTicket(RelationshipRecord relationship);

        //Method responsible for registering more than one relationshipRecords at once
        List<RelationshipRecord> CreateRelationshipRecordsRange(List<RelationshipRecord> newRelationshipRecords);
    }
}
