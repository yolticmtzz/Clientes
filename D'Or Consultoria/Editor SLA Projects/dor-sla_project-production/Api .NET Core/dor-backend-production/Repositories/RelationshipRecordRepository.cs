using Microsoft.AspNetCore.Mvc;
using dor_backend_production.Contexts;
using dor_backend_production.Domains;
using dor_backend_production.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace dor_backend_production.Repositories
{
    public class RelationshipRecordRepository : IRelationshipRecord
    {
        DOrContext ctx = new DOrContext();

        public List<RelationshipRecord> CreateRelationshipRecordsRange(List<RelationshipRecord> newRelationshipRecords)
        {
            ctx.AddRange(newRelationshipRecords);

            ctx.SaveChanges();

            return newRelationshipRecords;
        }

        public RelationshipRecord getByTicket(RelationshipRecord relationship)
        {
            return ctx.RelationshipRecord.FirstOrDefault(x => x.Client == relationship.Client 
                && x.ProductOperator == relationship.ProductOperator 
                && x.Category == relationship.Category 
                && x.Subcategory == relationship.Subcategory);
        }

        public List<RelationshipRecord> ListAllRelationshipRecords()
        {
            return ctx.RelationshipRecord.ToList();
        }
    }
}
