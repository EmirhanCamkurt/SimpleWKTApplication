using System.Text.RegularExpressions;
using SimpleWKTApplication.Entity;
using SimpleWKTApplication.Response;

namespace SimpleWKTApplication.Validators
{
    public static class Validator
    {
        public static Result Validate(Point point)
        {
            var result = new Result { Success = false };

            if (string.IsNullOrEmpty(point.Name))
            {
                result.Message = "Ýsim boþ olamaz";
                return result;
            }

            if (point.Name.Length > 100)
            {
                result.Message = "Ýsim çok uzun olamaz.";
                return result;
            }

            if (Regex.IsMatch(point.WKT,  @"^(?i)(POINT|LINESTRING|POLYGON)\s*\(\s*(-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s*,?\s*)+\s*\)$"))
            {
                result.Success = true;
                return result;
            }

            result.Message = "Doðru format deðil.";
            return result;
        }
        public static Result ValidateForUpdate(int id, Point point, List<Point> points)
        {
            var result = Validate(point);
            if (!result.Success) return result;

            if (!points.Any(p => p.Id == id))
            {
                return new Result { Success = false, Message = "Nokta bulunamadý." };
            }

            return new Result { Success = true };
        }
        public static Result ValidateForUpdate(int id, Point point)
        {
            var result = Validate(point);
            if (!result.Success) return result;

            return new Result { Success = true };
        }
        public static Result ValidateRange(List<Point> points)
        {
            var result = new Result { Success = true };
            var errors = new List<string>();

            for (int i = 0; i < points.Count; i++)
            {
                var validation = Validate(points[i]);
                if (!validation.Success)
                {
                    errors.Add($"Nokta no: {i} Nokta ismi: {points[i].Name} Hata kodu: {validation.Message}");
                    result.Success = false;
                }
            }

            if (!result.Success)
            {
                result.Message = $"Validasyonu geçemeyen nokta sayýsý: {errors.Count} ";
                result.Data = errors;
            }

            return result;
        }
    }
    
}