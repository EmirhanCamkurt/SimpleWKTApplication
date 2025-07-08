using Microsoft.EntityFrameworkCore;
using SimpleWKTApplication.Entity;

namespace SimpleWKTApplication
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {}

        public DbSet<Spatial> Spatials { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Spatial>(entity =>
            {
                entity.ToTable("spatials");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.WKT).HasColumnType("geometry") .IsRequired();
            });
        }
    }
}