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
                throw new ValidationException("Name can't be empty.");
            }

            if (spatial.Name.Length > 100)
            {
                throw new ValidationException("Name can'T be too long.");
            }

            string wktString = spatial.WKT.AsText();
           /* if (Regex.IsMatch(wktString,@"^(?i)(POINT|LINESTRING|POLYGON|MULTIPOINT|MULTILINESTRING|MULTIPOLYGON)\s*(\(.*\))+$"))
            {
                throw new ValidationException("WKT is not in correct format.");
            }*/
        }

        public static void ValidateForUpdate(int id, Spatial spatial, List<Spatial> spatials)
        {
            Validate(spatial);

            if (!spatials.Any(p => p.Id == id))
            {
                throw new NotFoundException("Spatial couldn't be found.");
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
                    errors.Add($"Spatial no: {i} Spatial name: {spatials[i].Name} Error code: {ex.Message}");
                }
            }

            if (errors.Count > 0)
            {
                throw new ValidationException($"Number of spatials that couldn't pass the validation: {errors.Count}");
            }
        }
    }
}