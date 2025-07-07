using SimpleWKTApplication.Entity;
using SimpleWKTApplication.Response;

namespace SimpleWKTApplication.Data
{
    public class PointRepository : IPointRepository
    {
        private readonly AppDbContext _context;

        public PointRepository(AppDbContext context)
        {
            _context = context;
        }

        public Result Add(Point point)
        {
            _context.Points.Add(point);
            return new Result { Success = true, Message = "Nokta eklendi", Data = point };
        }

        public Result AddRange(IEnumerable<Point> points)
        {
            _context.Points.AddRange(points);
            return new Result { Success = true, Message = "Noktalar eklendi", Data = points };
        }

        public Result Delete(int id)
        {
            var point = _context.Points.Find(id);
            if (point == null)
            {
                return new Result { Success = false, Message = "Nokta bulunamadi" };
            }

            _context.Points.Remove(point);
            return new Result { Success = true, Message = "Nokta silindi", Data = point };
        }

        public IEnumerable<Point> GetAll()
        {
            return _context.Points.ToList();
        }

        public Point GetById(int id)
        {
            return _context.Points.Find(id);
        }

        public IEnumerable<Point> GetBetweenIds(int startId, int endId)
        {
            return _context.Points
                .Where(p => p.Id >= startId && p.Id <= endId)
                .ToList();
        }

        public Result Update(Point point)
        {
            var existingPoint = _context.Points.Find(point.Id);
            if (existingPoint == null)
            {
                return new Result { Success = false, Message = "Nokta bulunamadi." };
            }

            _context.Entry(existingPoint).CurrentValues.SetValues(point);
            return new Result { Success = true, Message = "Nokta güncellendi.", Data = existingPoint };
        }
    }
}