using Microsoft.AspNetCore.Mvc;
using dor_backend_production.Domains;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace dor_backend_production.Interfaces
{
    interface IRelationshipRecord
    {
        List<RelationshipRecord> ListAllRelationshipRecords();

        RelationshipRecord getByTicket(RelationshipRecord relationship);

        List<RelationshipRecord> CreateRelationshipRecordsRange(List<RelationshipRecord> newRelationshipRecords);
    }
}
