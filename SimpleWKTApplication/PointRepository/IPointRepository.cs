using SimpleWKTApplication.Entity;
using SimpleWKTApplication.Response;

namespace SimpleWKTApplication.Data
{
    public interface IPointRepository
    {
        Result Add(Point point);
        Result Update(Point point);
        Result Delete(int id);
        Point GetById(int id);
        IEnumerable<Point> GetAll();
        IEnumerable<Point> GetBetweenIds(int startId, int endId);
        Result AddRange(IEnumerable<Point> points);
    }
}

