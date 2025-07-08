using System.Text.RegularExpressions;
using SimpleWKTApplication.Entity;

namespace SimpleWKTApplication.Validators
{
    public static class Validator
    {
        public static void Validate(Spatial spatial)
        {
            if (string.IsNullOrEmpty(spatial.Name))
            {
                throw new ValidationException("Ýsim boþ olamaz");
            }

            if (spatial.Name.Length > 100)
            {
                throw new ValidationException("Ýsim çok uzun olamaz.");
            }

            string wktString = spatial.WKT?.AsText();
            if (string.IsNullOrEmpty(wktString) ||
                !Regex.IsMatch(wktString, @"^(?i)(POINT|LINESTRING|POLYGON)\s*\(\s*(-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s*,?\s*)+\s*\)$"))
            {
                throw new ValidationException("Doðru format deðil.");
            }
        }

        public static void ValidateForUpdate(int id, Spatial spatial, List<Spatial> spatials)
        {
            Validate(spatial);

            if (!spatials.Any(p => p.Id == id))
            {
                throw new NotFoundException("Spatial bulunamadý.");
            }
        }

        public static void ValidateRange(List<Spatial> spatials)
        {
            var errors = new List<string>();

            for (int i = 0; i < spatials.Count; i++)
            {
                try
                {
                    Validate(spatials[i]);
                }
                catch (ValidationException ex)
                {
                    errors.Add($"Spatial no: {i} Spatial ismi: {spatials[i].Name} Hata kodu: {ex.Message}");
                }
            }

            if (errors.Count > 0)
            {
                throw new ValidationException($"Validasyonu geçemeyen spatial sayýsý: {errors.Count}");
            }
        }
    }
}