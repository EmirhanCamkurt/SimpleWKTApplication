using NetTopologySuite.Geometries;

namespace SimpleWKTApplication.Entity
{
    public class Spatial
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Geometry  WKT{ get; set; }

    }
}