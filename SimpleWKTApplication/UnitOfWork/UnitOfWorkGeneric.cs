using SimpleWKTApplication.Entity;

namespace SimpleWKTApplication.Data
{
    public class UnitOfWorkGeneric : IUnitOfWorkGeneric
    {
        private readonly AppDbContext _context;
        private IGenericRepository<Point> _points;

        public UnitOfWorkGeneric(AppDbContext context)
        {
            _context = context;
        }

        public IGenericRepository<Point> Points
        {
            get
            {
                if (_points == null)
                {
                    _points = new GenericRepository<Point>(_context);
                }
                return _points;
            }
        }

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public int Complete()
        {
            return _context.SaveChanges();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}