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
                throw new ValidationException("�sim bo� olamaz");
            }

            if (spatial.Name.Length > 100)
            {
                throw new ValidationException("�sim �ok uzun olamaz.");
            }

            string wktString = spatial.WKT.AsText();
           /* if (Regex.IsMatch(wktString,@"^(?i)(POINT|LINESTRING|POLYGON|MULTIPOINT|MULTILINESTRING|MULTIPOLYGON)\s*(\(.*\))+$"))
            {
                throw new ValidationException("Do�ru format de�il.");
            }*/
        }

        public static void ValidateForUpdate(int id, Spatial spatial, List<Spatial> spatials)
        {
            Validate(spatial);

            if (!spatials.Any(p => p.Id == id))
            {
                throw new NotFoundException("Spatial bulunamad�.");
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
                throw new ValidationException($"Validasyonu ge�emeyen spatial say�s�: {errors.Count}");
            }
        }
    }
}