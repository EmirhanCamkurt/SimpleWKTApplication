// IpointService.cs
using SimpleWKTApplication.Entity;
using SimpleWKTApplication.Response;
using System.Collections.Generic;

namespace SimpleWKTApplication.Services
{
    public interface IPointService
    {
        Result AddPoint(string name, string wkt);
        Result AddRange(List<Point> points);
        Result UpdatePoint(int id, string name, string wkt);
        Result DeletePoint(int id);
        Result GetPointById(int id);
        List<Point> GetAllPoints();
        Result GetPointsBetweenIds(int startId, int endId);
    }
}