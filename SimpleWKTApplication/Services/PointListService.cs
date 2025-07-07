using SimpleWKTApplication.Entity;
using SimpleWKTApplication.Response;
using SimpleWKTApplication.Validators;

namespace SimpleWKTApplication.Services
{
    public class PointService : IPointService
    {
        private static readonly List<Point> _points = new List<Point>();
        private static int _id = 1;

        public Result AddPoint(string name, string wkt)
        {
            var point = new Point { Name = name, WKT = wkt };
            var validation = Validator.Validate(point);
            if (!validation.Success) return validation;

            point.Id = _id++;
            _points.Add(point);
            return new Result { Success = true, Message = "Nokta eklendi", Data = point };
        }

        public Result UpdatePoint(int id, string name, string wkt)
        {
            var point = new Point { Name = name, WKT = wkt };
            var validation = Validator.ValidateForUpdate(id, point, _points);
            if (!validation.Success) return validation;

            var existing = _points.First(p => p.Id == id);
            existing.Name = name;
            existing.WKT = wkt;

            return new Result { Success = true, Message = "Nokta guncellendi.", Data = existing };
        }

        public Result DeletePoint(int id)
        {
            var point = _points.FirstOrDefault(p => p.Id == id);
            if (point == null) return new Result { Success = false, Message = "Nokta bulunamadi" };

            _points.Remove(point);
            return new Result { Success = true, Message = "Nokta silindi", Data = point };
        }

        public Result GetPointById(int id)
        {
            var point = _points.FirstOrDefault(p => p.Id == id);
            return point == null
                ? new Result { Success = false, Message = "Nokta bulunamadi" }
                : new Result { Success = true, Message = "Nokta bulundu", Data = point };
        }
        public Result AddRange(List<Point> points)
        {
            var results = new List<Point>();
            var errors = new List<string>();

            foreach (var point in points)
            {
                var validation = Validator.Validate(point);
                if (!validation.Success)
                {
                    errors.Add($"Nokta no: {point.Id} Nokta ismi: {point.Name} Hata kodu: {validation.Message}");
                    continue;
                }

                point.Id = _id++;
                _points.Add(point);
                results.Add(point);
            }

            return new Result
            {
                Success = errors.Count == 0,
                Message = errors.Count == 0
                    ? "Butun noktalar eklendi. "
                    : $"Eklenen nokta sayýsý: {results.Count} hata veren nokta sayýsý: {errors.Count} ",
                Data = new { AddedPoints = results, Errors = errors }
            };
        }
        public List<Point> GetAllPoints() => _points;

        public Result GetPointsBetweenIds(int startId, int endId)
        {
            var points = _points.Where(p => p.Id >= startId && p.Id <= endId).ToList();
            return new Result
            {
                Success = true,
                Message = "Noktalar basariyla donduruldu!",
                Data = points
            };
        }
    }
}