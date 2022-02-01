using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using dor_backend_production.Domains;
using Microsoft.Extensions.Configuration;

// Code scaffolded by EF Core assumes nullable reference types (NRTs) are not used or disabled.
// If you have enabled NRTs for your project, then un-comment the following line:
// #nullable disable

namespace dor_backend_production.Contexts
{
    public partial class DOrContext : DbContext
    {
        public DOrContext()
        {
        }

        public DOrContext(DbContextOptions<DOrContext> options)
            : base(options)
        {
        }

        public virtual DbSet<RelationshipRecord> RelationshipRecord { get; set; }
        public virtual DbSet<TimeStamp> TimeStamp { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                var config = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();
                var connectionString = config["ConnectionStrings:DefaultConnection"];

                optionsBuilder.UseSqlServer(connectionString);
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<RelationshipRecord>(entity =>
            {
                entity.ToTable("Relationship_Record");

                entity.Property(e => e.Category)
                    .IsRequired()
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.Client)
                    .IsRequired()
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.ProductOperator)
                    .IsRequired()
                    .HasColumnName("Product_Operator")
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.Sla)
                    .IsRequired()
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.Subcategory)
                    .IsRequired()
                    .HasMaxLength(255)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<TimeStamp>(entity =>
            {
                entity.Property(e => e.Client)
                    .IsRequired()
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.KeyCategory)
                    .IsRequired()
                    .HasColumnName("Key_Category")
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.KeyProductOperator)
                    .IsRequired()
                    .HasColumnName("Key_Product_Operator")
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.KeySubCategory)
                    .IsRequired()
                    .HasColumnName("Key_SubCategory")
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.TicketId).HasColumnName("Ticket_Id");

                entity.Property(e => e.ValueCategory)
                    .IsRequired()
                    .HasColumnName("Value_Category")
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.ValueProductOperator)
                    .IsRequired()
                    .HasColumnName("Value_Product_Operator")
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.ValueSubCategory)
                    .IsRequired()
                    .HasColumnName("Value_SubCategory")
                    .HasMaxLength(255)
                    .IsUnicode(false);
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
