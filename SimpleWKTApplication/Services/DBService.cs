using Npgsql;
using SimpleWKTApplication.Entity;
using SimpleWKTApplication.Response;
using SimpleWKTApplication.Validators;

namespace SimpleWKTApplication.Services
{
    public class PostgresPointService : IPointService
    {
        private readonly string connectionString;
        public PostgresPointService(IConfiguration configuration)
        {
            connectionString = configuration.GetConnectionString("PostgreSQL");
        }
        public Result AddPoint(string name, string wkt)
        {
            var point = new Point { Name = name, WKT = wkt };
            var validation = Validator.Validate(point);
            if (!validation.Success) return validation;

            using (var connection = new NpgsqlConnection(connectionString))
            {
                connection.Open();
                using (var command = new NpgsqlCommand(
                    "INSERT INTO points (name, wkt) VALUES (@name, @wkt) RETURNING id", 
                    connection))
                {
                    command.Parameters.AddWithValue("@name", name);
                    command.Parameters.AddWithValue("@wkt", wkt);
                    
                    point.Id = (int)command.ExecuteScalar();
                }
            }

            return new Result { Success = true, Message = "Nokta eklendi", Data = point };
        }

        public Result UpdatePoint(int id, string name, string wkt)
        {
            var point = new Point { Id = id, Name = name, WKT = wkt };
            var validation = Validator.Validate(point);
            if (!validation.Success) return validation;

            using (var connection = new NpgsqlConnection(connectionString))
            {
                connection.Open();
                using (var command = new NpgsqlCommand(
                    "UPDATE points SET name = @name, wkt = @wkt WHERE id = @id", 
                    connection))
                {
                    command.Parameters.AddWithValue("@id", id);
                    command.Parameters.AddWithValue("@name", name);
                    command.Parameters.AddWithValue("@wkt", wkt);
                    
                    int affectedRows = command.ExecuteNonQuery();
                    if (affectedRows == 0)
                    {
                        return new Result { Success = false, Message = "Nokta bulunamadi." };
                    }
                }
            }

            return new Result { Success = true, Message = "Nokta güncellendi.", Data = point };
        }

        public Result DeletePoint(int id)
        {
            using (var connection = new NpgsqlConnection(connectionString))
            {
                 
                connection.Open();
                
                
                Point point;
                using (var command = new NpgsqlCommand("SELECT * FROM points WHERE id = @id", connection))
                {
                    command.Parameters.AddWithValue("@id", id);
                    using(var reader = command.ExecuteReader())
                    {
                        if (!reader.Read())
                        {
                            return new Result { Success = false, Message = "Nokta bulunamadi" };
                        }
                        
                        point = new Point
                        {
                            Id = reader.GetInt32(0),
                            Name = reader.GetString(1),
                            WKT = reader.GetString(2)
                        };
                    }
                }
                
                
                using (var command = new NpgsqlCommand("DELETE FROM points WHERE id = @id", connection))
                {
                    command.Parameters.AddWithValue("@id", id);
                    command.ExecuteNonQuery();
                }

                return new Result { Success = true, Message = "Nokta silindi", Data = point };
            }
        }

        public Result GetPointById(int id)
        {
            using (var connection = new NpgsqlConnection(connectionString))
            {
                connection.Open();
                using (var command = new NpgsqlCommand("SELECT * FROM points WHERE id = @id", connection))
                {
                    command.Parameters.AddWithValue("@id", id);
                    using (var reader = command.ExecuteReader())
                    {
                        if (!reader.Read())
                        {
                            return new Result { Success = false, Message = "Nokta bulunamadi" };
                        }
                        
                        var point = new Point
                        {
                            Id = reader.GetInt32(0),
                            Name = reader.GetString(1),
                            WKT = reader.GetString(2)
                        };
                        
                        return new Result { Success = true, Message = "Nokta bulundu", Data = point };
                    }
                }
            }
        }

        public Result AddRange(List<Point> points)
        {
            var validation = Validator.ValidateRange(points);
            if (!validation.Success) return validation;

            var results = new List<Point>();
            using (var connection = new NpgsqlConnection(connectionString))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        foreach (var point in points)
                        {
                            using (var command = new NpgsqlCommand(
                                "INSERT INTO points (name, wkt) VALUES (@name, @wkt) RETURNING id", 
                                connection, transaction))
                            {
                                command.Parameters.AddWithValue("@name", point.Name);
                                command.Parameters.AddWithValue("@wkt", point.WKT);
                                
                                point.Id = (int)command.ExecuteScalar();
                                results.Add(point);
                            }
                        }
                        transaction.Commit();
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }

            return new Result
            {
                Success = true,
                Message = "Butun noktalar eklendi.",
                Data = results
            };
        }

        public List<Point> GetAllPoints()
        {
            var points = new List<Point>();
            using (var connection = new NpgsqlConnection(connectionString))
            {
                connection.Open();
                using (var command = new NpgsqlCommand("SELECT * FROM points", connection))
                {
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            points.Add(new Point
                            {
                                Id = reader.GetInt32(0),
                                Name = reader.GetString(1),
                                WKT = reader.GetString(2)
                            });
                        }
                    }
                }
            }
            return points;
        }

        public Result GetPointsBetweenIds(int startId, int endId)
        {
            var points = new List<Point>();
            using (var connection = new NpgsqlConnection(connectionString))
            {
                connection.Open();
                using (var command = new NpgsqlCommand(
                    "SELECT * FROM points WHERE id BETWEEN @startId AND @endId", 
                    connection))
                {
                    command.Parameters.AddWithValue("@startId", startId);
                    command.Parameters.AddWithValue("@endId", endId);
                    
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            points.Add(new Point
                            {
                                Id = reader.GetInt32(0),
                                Name = reader.GetString(1),
                                WKT = reader.GetString(2)
                            });
                        }
                    }
                }
            }

            return new Result
            {
                Success = true,
                Message = "Noktalar basariyla donduruldu!",
                Data = points
            };
        }
    }
}