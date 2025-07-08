using SimpleWKTApplication.Entity;
using System.Collections.Generic;

namespace SimpleWKTApplication.Services
{
    public interface ISpatialService
    {
        Spatial AddSpatial(string name, string wkt);
        IEnumerable<Spatial> AddRange(List<Spatial> spatials);
        Spatial GetSpatialById(int id);
        List<Spatial> GetAllSpatials();
        Spatial UpdateSpatial(int id, string name, string wkt);
        Spatial DeleteSpatial(int id);
        IEnumerable<Spatial> GetSpatialsBetweenIds(int startId, int endId);
    }
}