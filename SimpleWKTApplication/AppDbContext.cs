using Microsoft.EntityFrameworkCore;
using SimpleWKTApplication.Entity;

namespace SimpleWKTApplication
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {}

        public DbSet<Point> Points { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Point>(entity =>
            {
                entity.ToTable("points");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.WKT).IsRequired();
            });
        }
    }
}