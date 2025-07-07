using Microsoft.EntityFrameworkCore;
using SimpleWKTApplication;
using SimpleWKTApplication.Data;
using SimpleWKTApplication.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// In Program.cs
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSQL")));

// Register the service AFTER registering DbContext
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
/*builder.Services.AddScoped<IPointService, PointService>();
builder.Services.AddScoped<IPointService, PostgresPointService>();*/
builder.Services.AddScoped<IPointService, EFPointService>();
builder.Services.AddScoped<IUnitOfWorkGeneric, UnitOfWorkGeneric>();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
