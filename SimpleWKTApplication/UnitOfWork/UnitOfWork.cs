namespace SimpleWKTApplication.Data
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private IPointRepository points;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
        }

        public IPointRepository Points
        {
            get
            {
                if (points == null)
                {
                    points = new PointRepository(_context);
                }
                return points;
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